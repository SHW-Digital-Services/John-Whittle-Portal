# Photo, video and audio uploads

Any signed-in portal member can submit photos and videos from the Gallery or the floating Share a memory button. Submissions stay private to the uploader and the verified portal owner until approved. The owner reviews and previews submissions in Gallery; approval makes them visible to signed-in members, while rejection removes the stored file and its record. A Google Cloud Function emails `sphw1984@gmail.com` when a photo or video is submitted.

Approved background audio uploaded by the verified owner is also available to signed-out visitors on the home screen player. The same background tracks are selectable for altar actions. Only approved background-audio metadata and its audio object are public; meditation audio and all photos/videos remain login-gated.

There is no application-imposed file-size limit. Firebase Storage, browser memory, network conditions, account quotas, and Google Cloud billing still apply; large media can use substantial storage, bandwidth, and processing time.

The verified owner account `sphw1984@gmail.com` has a **Media admin** panel in Gallery. It can upload photos, videos, and audio; review pending photos/videos and approve them for publication or reject them; and delete published photos/videos or any background or meditation audio track. Owner uploads of photos and videos also remain pending until approved. When uploading audio, choose **Background music** or **Meditation sound**. Background tracks are available in the home-page player and as options for altar actions. For meditation audio, assign a stillness duration of **3, 5, 10, or 15 minutes**; the altar offers matching meditation tracks for the selected duration. The altar action selector and background player can each choose from all background music tracks, but the portal pauses other audio whenever a track starts so only one track plays at a time. Selecting a stillness duration stops active audio. The altar and meditation no longer synthesize their own sound effects. Other portal interactions are unchanged.

### Suggested audio to acquire

Use recordings you made or tracks licensed for use on your site (including properly licensed royalty-free audio).

- **Background music:** gentle, unobtrusive instrumental ambience, ideally loop-friendly and without sudden loud changes.
- **Background music:** choose calm, gentle tracks that also work as altar-action sounds.
- **Meditation sound:** quiet ambient or instrumental tracks assigned to each stillness duration you want to support: 3, 5, 10, and 15 minutes. Avoid speech or abrupt transitions; a track should comfortably cover its assigned session and play gently at the beginning and end. Existing meditation uploads without a duration assignment will not match a timer selection; upload them again and assign the intended duration.

Supported formats include MP3, M4A (audio/mp4), WAV, OGG, WebM, and FLAC. There is no app-imposed file-size limit; compressed MP3/M4A files are usually more practical for long recordings.

## Firebase setup before live use

Enable Cloud Storage for project `john-whittle`, using bucket `john-whittle.firebasestorage.app`. Confirm the project is on the Firebase Blaze plan and review expected Storage, Functions, and email usage. Review and deploy the included Firestore and Storage rules:

```powershell
firebase deploy --only firestore:rules,storage --project john-whittle
```

The rules allow any signed-in user to create photo/video submissions, but only the verified owner can approve, reject, or delete media. Pending files are only readable by their uploader and the owner. Approved photos/videos remain authenticated-only; approved background audio is public for home-page playback. The rules do not set media size ceilings.

**If an audio upload reports that the media record could not be saved**, make sure both the current Firestore and Storage rules have been deployed with the command above. Audio records now include `audioPurpose` and `visibility`; meditation records also include `meditationDurationMinutes`. Outdated Firestore rules reject these fields even if the file itself uploaded successfully. The Storage rules also allow the verified owner to remove an uploaded object whose Firestore record was denied, so deploy both rule sets before retrying.

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

After deploying the new Firestore rules, sign in once as the verified owner account and visit the portal. The app marks pre-existing media records as approved and converts old altar-only tracks into public background tracks so they are available in the home-page player and as altar-action options. Other media stays private or visible only to signed-in members.

## Verification

1. Sign in as a non-owner member, open Gallery, and submit an image and a video. Confirm uploads have progress feedback and the resulting media remains hidden from other members.
2. Sign in as `sphw1984@gmail.com`; verify each pending item can be previewed, approved, or rejected. Confirm approved items appear in Gallery and rejected files disappear.
3. Confirm a photo/video submission sends a notification email to `sphw1984@gmail.com`. Audio uploads should not send submission notifications.
4. As the owner, upload a background-music track and meditation tracks for different durations. Confirm background tracks are selectable for altar actions and the matching meditation track plays at meditation start and completion.
5. Confirm a regular signed-in member cannot approve/reject, upload audio, read another user's pending media, or read media while signed out.
6. Test large media within Firebase Storage's supported object size and available browser memory. Verify a failed upload displays an error and does not create a successful submission record.

Rule deployment, CORS, Gmail SMTP, Cloud Function deployment, live email, and live authenticated uploads must be verified in the Firebase project before public use.

## Local checks

`npm run lint` checks TypeScript, and `npm run build` creates the production bundle. The Functions source uses Node.js 22; run `npm install --prefix functions` before deploying if Firebase CLI reports missing Functions dependencies.
