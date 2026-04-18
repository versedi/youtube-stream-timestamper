# YouTube Stream Timestamper

A Firefox extension that brings back the ability to share a moment from a YouTube live stream — like the Clips feature, but manual and instant.

Press a button while watching a stream (or any video), and a shareable link with the exact timestamp is copied to your clipboard.

---

## Installation

Firefox does not yet distribute this extension through the add-ons store, so you load it directly.

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on...**
3. Browse to the folder where you downloaded this extension and select the `manifest.json` file
4. The extension is now active — it will remain loaded until you restart Firefox

> **Note:** Temporary add-ons are removed when Firefox closes. For a permanent install, the extension would need to be signed by Mozilla. Until then, repeat the steps above each session, or look into using [Firefox Developer Edition](https://www.mozilla.org/firefox/developer/) which allows unsigned extensions permanently via `about:config` → `xpinstall.signatures.required = false`.

---

## Usage

1. Open any YouTube video or live stream
2. Look for the **clock icon** in the bottom-right player controls (next to the volume and fullscreen buttons)
3. Click it at the moment you want to share
4. A link is copied to your clipboard — paste it anywhere

The toast notification at the bottom of the screen confirms the copy and shows the timestamp (e.g. `Timestamp copied — 1h23m45s`).

### Sharing the link

The copied link looks like:

```
https://www.youtube.com/watch?v=VIDEO_ID&t=SECONDS
```

When someone opens it, YouTube will jump directly to that point in the video or stream replay.

---

## Notes

- Works on **live streams**, **past streams (replays)**, and **regular videos**
- For live streams, the timestamp captures your current position in the DVR buffer — if you are watching live (not rewound), the timestamp points to the live edge at the moment you clicked
- The button is injected automatically whenever you open a YouTube watch page; no action required

---

## Troubleshooting

**The clock button does not appear**
- Refresh the page and wait for the player to fully load
- Make sure the extension is still loaded (`about:debugging` → confirm it is listed under Temporary Extensions)

**The link does not copy**
- Your browser may have blocked clipboard access — try clicking the button while the video player is focused
- As a fallback, the raw URL is shown in the toast notification so you can copy it manually

**The button disappears after navigating to another video**
- It re-injects automatically within a second or two; wait for the player controls to appear
