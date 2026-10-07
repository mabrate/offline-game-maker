# Prototype validation — October 6, 2026

Chrome browser tests passed:

- Starter preview drew expected nontransparent background pixels.
- Editor recovered modified code after a page reload.
- Stop remained responsive during `while (true) {}` in student code.
- A thrown error appeared in the editor console.
- Standalone exported HTML opened from a local file and ran without errors.
- Uploaded SVG was embedded in a saved project and restored on import.
- Invalid project import preserved current code.
- Finish session cleared browser recovery and restored initial assets.
- A 390-pixel viewport had no horizontal page overflow.
- No JavaScript page errors after the runtime escaping fix.

JavaScript syntax checks, Python compilation, and deployment shell syntax checks passed.

Still requires classroom verification: Pi/laptop boot service and SSH deployment, LAN access from student devices, iPad touch controls, a real disconnected-internet lesson, and actual arcade launcher/control compatibility. No hardware deployment was performed.

## Line numbers and syntax highlighting

Chrome checks passed with all outside-network requests blocked (zero attempted):
- Local JavaScript highlighting and line numbers, including the trailing empty line.
- Native Tab editing and asset insertion synchronized with the highlighted layer.
- Horizontal and vertical scrolling kept coloring and gutter aligned.
- Recovery, starter replacement, and project import refreshed highlighting.
- Game preview still rendered; no JavaScript page errors.
- Mobile viewport had no horizontal page overflow.

The feature uses only local editor.js and style.css. LAN server access remains required to load the website; no outside internet is required.

## Student error locations

Chrome checks passed with outside-network requests blocked:
- Exact main.js line numbers for top-level errors, setup, update, draw, nested functions, syntax errors, and rejected async functions.
- Go to line selected the correct source line; edited code refused navigation using stale error locations.
- Corrected code reran with the previous error cleared.
- Infinite-loop Stop remained responsive.
- Exported HTML showed the same student line number.
- No browser page errors or outside requests in the final run.

Locations come from browser diagnostics; if no student location is available the UI says so. Missing closing brackets can be reported at the final source line. Safari/iPad error formatting still needs hardware verification.

## Python terminal multiplication quiz

Chrome tests passed with outside requests blocked:
- Demo completed five random questions, accepting four correct answers and one incorrect answer with a 4/5 score.
- Nonnumeric input retried the same question with a helpful message.
- Python highlighting, main.py labels, language-aware help and terminal display.
- Refresh recovery and project save/open preserved Python language and source.
- NameError, ValueError and SyntaxError reported expected student line numbers.
- Stop interrupted an infinite loop and cancelled a waiting input; rerun accepted new input.
- JavaScript canvas projects still ran after switching back.
- Python ZIP included main.py, terminal files, Skulpt and its license.
- The unzipped export ran independently on a separate static server and completed interactive input with zero outside requests.
- No page errors in the final Python workflow run.

Runtime: locally bundled Skulpt 1.2.0 Python 3 mode (educational subset, not full CPython). Actual iPad/Pi/arcade hardware testing remains outstanding.

## Python lesson framework

Nine paths, 26 runnable steps. All examples compiled as desktop Python and ran to completion in the bundled browser Python worker.

Chrome checks passed with outside-network requests blocked:
- Choosing paths and Previous/Next left editor code unchanged.
- Loading examples ran them; returning to a step resumed edited source.
- Use step example and Undo code change preserved and restored edits.
- Refresh restored active path, step, and draft code.
- Save/open preserved progress, step drafts, and the starting source checkpoint.
- Original quiz restored canonical working source; Return to my starting code restored the student's source and title.
- Invalid imported progress preserved the current workspace.
- A 390-pixel viewport had no horizontal overflow.
- JavaScript projects hid the lesson panel and still ran.
- Zero browser page errors and zero outside requests.

Lesson content is in lessons.js; reusable navigation and state validation are in lesson-ui.js. SSH deployment includes both files. Playable exports contain current program code, while .gameproject files carry lesson progress and checkpoints. Classroom hardware still needs verification.

## Pi and GitHub Pages static hosting

- Built the allowlisted static distribution twice; its files exactly matched the public-file list and excluded repository metadata and deployment scripts.
- Builder rejected source-directory output and an unrelated directory, preserving its existing file.
- Browser tests served the built site at both `/` and `/offline-game-maker/` on an ordinary static HTTP server.
- Python input/output, lesson steps, recovery after reload, project import/save, and Python ZIP export worked at both URLs.
- Worker and Skulpt URLs stayed under the repository subdirectory.
- A separate repository path on the same origin did not read the first editor's recovery.
- JavaScript preview and HTML export still worked.
- Zero outside-network requests and zero browser page errors.
- SSH deployment packaging passed using local mock SSH/SCP commands; no Pi was contacted.
- Pages workflow YAML, job dependencies, permissions, JavaScript syntax, Python compilation, and shell syntax passed local checks.

GitHub Actions/Pages publication and physical Pi deployment have not been run. This workspace has no initialized Git repository or configured remote. Pages needs internet to load; the Pi remains classroom-LAN-only. Save/Open is the portable project transfer between installations.
