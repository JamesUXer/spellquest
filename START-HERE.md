# SpellQuest first-level test build

This is the complete first-level prototype for review on a Chromebook. It ends when the child receives the awakened pen and returns to the forest. Later pen abilities and further levels are not included. Artwork, the riddle and recorded voices are still provisional.

## Open the build

Unzip the package. Serve the contents of `spellquest-stage-one` from a static web server and open its `index.html` (or the folder's web address). Keep the files and subfolders together. No installation, account, build step, external service or runtime dependency is required on the child's device.

For a local check on a computer with Python 3, open a terminal in the extracted folder and run:

```
python3 -m http.server 55407 --bind 127.0.0.1
```

Keep that terminal open and visit http://127.0.0.1:55407/. Stop the server with Ctrl+C when finished. If the port is occupied, use a different unused port and update the address accordingly. If the connection is refused, check that the server is running before reopening the page.

Opening the HTML file directly with `file://` will not reliably load the game's JavaScript modules. A localhost address works only on the computer running that server. For a separate Chromebook, upload the extracted game to your school's approved static web hosting and use its HTTPS address. This ZIP has not been published and does not provide a shared link by itself.

The game works below a hosting subfolder, provided relative paths remain intact and JavaScript, WAV and PNG files are served normally. Serve `build-info.json` too; its `build_id` identifies the exact build. Avoid reusing an old cached deployment for a new test session.

## Start a fresh session

Open the forest entry, not the workshop preview. Use Start again in the forest before each participant. This clears collected letters, position, encounter progress and received-pen ownership on that browser. Check that the pouch shows 0 / 4 and the explorer is back at the beginning.

Progress saves locally in the same browser profile and web address. It does not transfer between devices, browsers, private sessions or hosting addresses. Unfinished workshop arrangements and tracing reset on reload. Received pen ownership survives reload unless storage is blocked. Do not refresh during a workshop attempt unless testing recovery.

## What the child can do

- Explore with arrow keys or WASD. Touch controls are also available.
- Meet the forest characters using E / Space nearby, the interaction button, or a click. Listen, read or leave a conversation whenever they choose.
- Collect four letters and enter the owl's workshop. Visiting with missing letters allows a return to the forest.
- Read the owl's riddle and hear the key word. Only the word is recorded. Choosing the pen plays it on first bench entry; Hear the word repeats it and Stop listening stops it.
- Build the spell using physical letter blocks. Drag them between frame spaces or back to the tray, swap them, use Undo, or Start again. Click fills the next empty space. Keyboard users can choose letters with Tab and Enter/Space, then select a placed block and its destination to rearrange it.
- Pick up the pen to trace each chosen letter. Let go before starting the next. Keyboard users focus the pen, hold Right Arrow, then release between letters. Edit spell unlocks the blocks and clears tracing while retaining the arrangement.
- Revise another attempted spelling, or awaken the pen after completely tracing curious. Watch, pause or replay the brief question-mark/cat sequence, take the pen and return to the forest.

## Physical Chromebook check before child sessions

Record the build ID, Chromebook model, Chrome version, viewport/display scaling and input used. This is a functional preflight, not a substitute for observing children later.

- Load from the intended shared address. Check that all illustrations and recorded speech load, and that device volume is audible. Sound failure should leave the riddle readable and the game operable.
- Walk the forest, approach the visible path edges and tree outlines, collect all four letters, enter the workshop and return without losing progress. Open-looking ground should not stop movement; tree outlines, bushes, rocks and water should. Trees must stay opaque and the explorer must not enter their drawn shapes. Check any classroom network restrictions.
- Move, swap and return blocks using the actual trackpad. Confirm the word and Undo/reset match the arrangement. Repeat with keyboard, and touch if the device supports it.
- Trace i, clockwise o, u and s. Check forgiving curves, release/resume, the stop between letters and fresh pickup for the next. Switch tabs mid-drag, then return; input must not remain stuck.
- Try a different ordering, revise it, complete curious and watch the awakening. Pause, replay, receive the pen and return to the forest. Reload to check ownership, then Start again to check reset.
- Check the caption and controls at the intended Chromebook resolution. Narrow views may scroll vertically. Try reduced motion in the device's accessibility preferences.
- Note slow frames, missed input, unclear steps and sound problems. Include the action immediately before the issue and a screenshot where useful. Do not record children's names in build notes.

## Current limits

Automated Chrome checks are run on macOS, with touch and reduced motion emulated. They do not establish physical Chromebook performance or child usability. The browser checks advance game time to exercise the complete journey; normal play timing and the trackpad's feel still need device review. No analytics or session-recording service is included. Staff should keep observation notes separately.
