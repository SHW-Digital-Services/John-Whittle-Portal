# Photo, video and audio uploads

Any signed-in portal member can submit photos and videos from the Gallery or the floating Share a memory button. Submissions stay private to the uploader and the verified portal owner until approved. The owner reviews and previews submissions in Gallery; approval makes them visible to signed-in members, while rejection removes the stored file and its record. A Google Cloud Function emails `sphw1984@gmail.com` when a photo or video is submitted.

There is no application-imposed file-size limit. Firebase Storage, browser memory, network conditions, account quotas, and Google Cloud billing still apply; large media can use substantial storage, bandwidth, and processing time.

The verified owner account `sphw1984@gmail.com` can also upload audio. Each uploaded track is assigned either to the background music player or to altar interactions. The player loads approved background tracks from Firestore/Cloud Storage and no longer generates placeholder temple audio. On the altar, members can choose an uploaded altar track; it plays when they light incense, ring the bell, offer tea or light a candle, and when a meditation starts or completes. The altar and meditation no longer synthesize their own sound effects. Other portal interactions are unchanged.

## Firebase setup before live use

Enable Cloud Storage for project `john-whittle`, using bucket `john-whittle.firebasestorage.app`. Confirm the project is on the Firebase Blaze plan and review expected Storage, Functions, and email usage. Review and deploy the included Firestore and Storage rules:

```powershell
firebase deploy --only firestore:rules,storage --project john-whittle
```

The rules allow any signed-in user to create photo/video submissions, but only the verified owner can approve or reject them. Pending files are only readable by their uploader and the owner. Approved files remain authenticated-only. The rules do not set media size ceilings.

### Email notifications

The notification function uses Google Cloud Functions 2nd gen (Node.js 22) and sends mail through Gmail SMTP. Enable the Cloud Functions and Cloud Build APIs if prompted. Create a Google App Password for the sender Gmail account, then configure both values as Firebase Functions secrets. Do not put the app password in source control or a client-side environment variable.

```powershell
firebase functions:secrets:set SMTP_USER --project john-whittle
firebase functions:secrets:set SMTP_PASSWORD --project john-whittle
```

Use `sphw1984@gmail.com` as `SMTP_USER` or another Gmail account authorized to send the notification. `SMTP_PASSWORD` is that account's Google App Password, not its normal sign-in password. The recipient is currently fixed to `sphw1984@gmail.com` in `functions/index.js`.

Deploy the Functions code and access rules after setting the secrets:

```powershell
firebase deploy --only functions,firestore:rules,storage --project john-whittle
```

The SMTP sender account must have 2-Step Verification and App Passwords enabled. Function deployment and email delivery require a billable Google Cloud project. The trigger retries failed deliveries, so a transient failure can result in a duplicate notification.

### Storage CORS

Gallery images/videos and audio use authenticated Firebase Storage blob downloads. Add the exact deployed portal origin to `storage.cors.json` before production, then apply it with a Google Cloud CLI signed into this project:

```powershell
gcloud storage buckets update gs://john-whittle.firebasestorage.app --cors-file=storage.cors.json
```

Local development and preview origins are already listed. CORS does not grant file access; the Storage rules enforce it. The Storage rules use Firestore lookups to check approval status, so keep the Firestore `media` records and Storage objects together in the configured Firebase project.

## Existing audio records

After deploying the new Firestore rules, sign in once as the verified owner account and visit the portal. The app marks pre-existing media records as approved so previously uploaded audio continues to appear in the background player. Legacy audio is treated as background music. Other members can see the old tracks after that migration.

## Verification

1. Sign in as a non-owner member, open Gallery, and submit an image and a video. Confirm uploads have progress feedback and the resulting media remains hidden from other members.
2. Sign in as `sphw1984@gmail.com`; verify each pending item can be previewed, approved, or rejected. Confirm approved items appear in Gallery and rejected files disappear.
3. Confirm a photo/video submission sends a notification email to `sphw1984@gmail.com`. Audio uploads should not send submission notifications.
4. As the owner, upload an audio file for background music and another for altar interactions. Confirm background audio plays only from the player and altar audio can be selected and plays for altar actions and meditation.
5. Confirm a regular signed-in member cannot approve/reject, upload audio, read another user's pending media, or read media while signed out.
6. Test large media within Firebase Storage's supported object size and available browser memory. Verify a failed upload displays an error and does not create a successful submission record.

Rule deployment, CORS, Gmail SMTP, Cloud Function deployment, live email, and live authenticated uploads must be verified in the Firebase project before public use.

## Local checks

`npm run lint` checks TypeScript, and `npm run build` creates the production bundle. The Functions source uses Node.js 22; run `npm install --prefix functions` before deploying if Firebase CLI reports missing Functions dependencies.
