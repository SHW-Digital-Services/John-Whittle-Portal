# Shared picture gallery and audio uploads

The cog and upload popup are restricted to the verified Firebase account `scotthw1984@gmail.com`. Use Google sign-in for this account, or verify its email before using password login. The gallery and shared audio list require a real Firebase login. Pictures and audio are shared with other authenticated members. Uploads are stored in Cloud Storage; metadata is saved in the named Firestore database. John’s portrait stays fixed.

## Firebase setup before live use

Enable Cloud Storage in project `gen-lang-client-0404715781`, using bucket `gen-lang-client-0404715781.firebasestorage.app`. Confirm the project’s storage billing requirements before enabling it.

Review and deploy the included Firestore and Storage rules using a Firebase CLI signed into this project:

```powershell
firebase deploy --only firestore:rules,storage --project gen-lang-client-0404715781
```

The Firebase config targets Firestore database `ai-studio-whisperstojohnal-5fa1ef06-4468-4362-823c-8e3d99debb65`. The new `media` collection and files under `memorial-media` require authentication. The Storage rules deny access to other file paths; review any existing bucket usage before deploying them.

The gallery and audio player use authenticated `getBlob` requests rather than public download links. Configure bucket CORS for these requests. Add the exact deployed portal origin to `storage.cors.json` before production, then apply it using a Google Cloud CLI signed into this project:

```powershell
gcloud storage buckets update gs://gen-lang-client-0404715781.firebasestorage.app --cors-file=storage.cors.json
```

Local development and preview origins are already listed. CORS does not grant file access; the Storage rules enforce that boundary.

## Verification

1. Sign in with the verified `scotthw1984@gmail.com` account and use the cog to upload a JPEG/PNG/WebP/GIF (up to 10 MB), and an MP3/M4A/WAV/OGG/WebM/FLAC (up to 50 MB).
2. Open Gallery and check the caption and full-size picture. Reload and confirm it persists. Sign in as a second member and confirm the picture appears, but the cog, Add a picture and Upload tracks controls do not. Direct uploads and media-record creation must be denied for that member.
3. Expand the music player, choose the uploaded track and press Play. Check pause, volume, mute and returning to temple chimes.
4. Sign out: Gallery, uploads and shared tracks must disappear and playback must stop. In a separate signed-out browser, verify that direct Firebase SDK reads of `media` and `memorial-media` fail with permission denied.
5. Check invalid file types and oversized files are rejected, and an interrupted upload reports an error without showing success.

Rule deployment, bucket CORS and live authenticated uploads have not been verified locally.

## Local checks

`npm run check:media` verifies file type and size boundaries. `npm run lint` checks TypeScript, and `npm run build` creates the production bundle.

`scripts/qa-media.cjs` uses Playwright against the running dev server. Install/provide Playwright separately or set `PLAYWRIGHT_PACKAGE_PATH` to an existing Playwright package directory. It verifies signed-out restrictions against the real app, then uses the isolated fixture in `scripts/fixtures/media.html` with mocked Firebase services to check gallery, uploads and audio UI on desktop and mobile. The fixture is not part of the production build. It does not validate Firebase permissions, CORS or live persistence. Screenshots are saved in `scripts/artifacts`.

Uploaded audio is the site background playlist for logged-in members. The latest upload is selected automatically when the member signs in. Playback starts with Play, continues across portal pages, advances through the tracks and repeats. Uploaded media retains its login requirement.
