# MyTV — browser prototype

MyTV is a static, remote-first web app intended to run directly in an LG webOS TV browser. It needs no local server or Mac mini after deployment.

## Prototype capabilities

- Five linear-style channels, including three distinct Kids channels for actual channel switching tests.
- H.264/AAC MP4 sample films with an automatic legal Blender Open Movie mirror if the primary source fails.
- Time-based scheduling: each channel calculates the current programme and seeks into it when you tune in.
- LG remote support: Left/Right switches channel, Up opens the guide, Down opens viewing modes, OK plays/pauses. Each panel also has a visible, clickable **× Close** button; do not rely on the browser Back button.
- Normal, Kids, and Simple modes. Kids mode filters channel choices but cannot prevent leaving the browser/app via the TV's system controls.
- **Channel Manager:** visit `/manage/` on a phone or laptop to create, edit, delete, and reorder playlist videos; set channel number, icon, colour, Kids, and Simple visibility; and add a direct MP4/HLS URL with browser preview.
- Device-local persistence plus JSON export/import. The TV uses its own browser storage, so export/import is the supported first-milestone way to transfer a configuration between phone and TV.

## Limitations and next steps

- Browser autoplay policies require an initial user action. MyTV now always presents an explicit Play button, waits for the file to be ready, and reports loading failures with Retry instead of leaving a black screen.
- Schedules and the selected mode are currently local to that browser. A future small hosted JSON/API service can share them between TVs and a phone manager.
- Uploading personal videos and automatic multi-TV sync are intentionally not configured yet: both require hosted storage and an authenticated backend. No credentials or storage tokens are included in this public repository.
- Netflix cannot legally be embedded or re-streamed in MyTV. YouTube playback must use official YouTube mechanisms and comply with their Terms; protected content is not downloaded or bypassed.
- A browser web app cannot intercept the TV Home button; a packaged webOS app improves launch experience but still cannot claim to be an un-exitable parental lock.

## Local check

From this directory, serve it using any static web server, for example `python3 -m http.server 8080`, then visit `http://localhost:8080`.

## Automated checks

Run `npm install` once, then `npm test`. The Playwright suite covers successful media readiness and a user-initiated play, deliberate media failure/retry, channel switching, panel close/Back handling, and all three viewing modes. It is a Chromium browser test, not a substitute for testing on the physical LG TV.

## Deployment

This is deliberately dependency-free and can be deployed to a free static host (for example GitHub Pages or Cloudflare Pages). Deployment is kept separate because it needs an existing approved hosting account or an explicit account setup choice.
