const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { RecaptchaEnterpriseServiceClient } = require('@google-cloud/recaptcha-enterprise');
const nodemailer = require('nodemailer');

const smtpUser = defineSecret('SMTP_USER');
const smtpPassword = defineSecret('SMTP_PASSWORD');
const recaptchaSiteKey = '6LeG_uEtAAAAAJ8ZM9szpfXhhO-RsEozroyQ3AiE';
const recaptchaScoreThreshold = 0.5;
const recaptchaClient = new RecaptchaEnterpriseServiceClient();

exports.assessRecaptchaToken = onCall(async request => {
  const { token, action } = request.data || {};
  if (typeof token !== 'string' || !token || token.length > 4096) {
    throw new HttpsError('invalid-argument', 'A valid reCAPTCHA token is required.');
  }
  if (!['LOGIN', 'SIGNUP'].includes(action)) {
    throw new HttpsError('invalid-argument', 'Unsupported reCAPTCHA action.');
  }

  const projectId = process.env.GCLOUD_PROJECT;
  if (!projectId) {
    console.error('GCLOUD_PROJECT is unavailable for reCAPTCHA assessment.');
    throw new HttpsError('internal', 'Security verification is not configured.');
  }

  try {
    const [assessment] = await recaptchaClient.createAssessment({
      parent: recaptchaClient.projectPath(projectId),
      assessment: {
        event: {
          token,
          siteKey: recaptchaSiteKey,
          expectedAction: action,
        },
      },
    });
    const tokenProperties = assessment.tokenProperties;
    const score = assessment.riskAnalysis?.score;

    if (!tokenProperties?.valid || tokenProperties.action !== action ||
        typeof score !== 'number' || score < recaptchaScoreThreshold) {
      console.warn('reCAPTCHA rejected an authentication attempt.', {
        action,
        valid: tokenProperties?.valid,
        tokenAction: tokenProperties?.action,
        score,
        invalidReason: tokenProperties?.invalidReason,
      });
      throw new HttpsError('permission-denied', 'Security verification failed.');
    }

    return { verified: true };
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    console.error('reCAPTCHA Enterprise assessment failed.', error);
    throw new HttpsError('unavailable', 'Security verification is temporarily unavailable.');
  }
});

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

exports.notifyMediaSubmission = onDocumentCreated({
  document: 'media/{mediaId}',
  secrets: [smtpUser, smtpPassword],
  retry: true,
}, async event => {
  const media = event.data?.data();
  if (!media || media.status !== 'pending' || !['picture', 'video'].includes(media.kind)) return;

  const user = smtpUser.value();
  const password = smtpPassword.value();
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass: password },
  });
  const title = escapeHtml(String(media.title || 'Untitled submission'));
  const subjectTitle = String(media.title || 'Untitled').replace(/[\r\n]+/g, ' ').slice(0, 150);
  const kind = media.kind === 'video' ? 'video' : 'photo';
  const reviewUrl = 'https://johnwhittle.vercel.app';

  await transporter.sendMail({
    from: `"John Whittle Portal" <${user}>`,
    to: 'sphw1984@gmail.com',
    subject: `New ${kind} submission: ${subjectTitle}`,
    text: `A new ${kind} has been submitted and is waiting for your approval.\n\nTitle: ${media.title || 'Untitled submission'}\nSubmitted by user ID: ${media.ownerId}\n\nReview it in the portal: ${reviewUrl}`,
    html: `<p>A new ${kind} has been submitted and is waiting for your approval.</p><p><strong>Title:</strong> ${title}<br><strong>Submitted by user ID:</strong> ${escapeHtml(String(media.ownerId))}</p><p><a href="${reviewUrl}">Open the portal to review the submission</a></p>`,
  });
});
