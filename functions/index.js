const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const nodemailer = require('nodemailer');

const smtpUser = defineSecret('SMTP_USER');
const smtpPassword = defineSecret('SMTP_PASSWORD');

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
