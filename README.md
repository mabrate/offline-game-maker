# Pixel Workshop

An offline classroom game-maker prototype. JavaScript and Python editors with line numbers and local syntax highlighting, three JavaScript starter projects, a blank canvas, and a Python multiplication quiz, local image assets, browser recovery, project import/download, and self-contained HTML game export. No accounts, outside-network runtime downloads, telemetry, build step, or student-data endpoints. Runtime dependencies are bundled locally.

## Run

For local development, run directly from this folder. Requires Python 3 on the classroom host:

```sh
python3 scripts/serve.py --port 8080
```

Open `http://localhost:8080` on that host, or `http://HOST-LAN-IP:8080` on student devices. Reserve the host's router address and bookmark it. The host and router must remain available; this prototype does not cache the editor for use after losing the LAN connection. No internet is needed. The server suppresses request logs and serves files read-only. Restrict access to the classroom LAN.

## Student workflow

1. Choose New and a starter, edit JavaScript or Python, and press Run (or Ctrl/Cmd + Enter).
2. For JavaScript, click the game for keyboard focus or use the on-screen controls. For Python, type into Your answer and press Enter.
3. Use Code help for the bundled API. Errors appear in the console and preview with student-code line numbers and debugging hints. Click Go to line to select and scroll to the indicated line. If you edit after an error, run again before jumping to its location.
4. Save project downloads a `.gameproject` JSON file containing code and all images. Open project reads it locally; no upload request occurs.
5. For JavaScript, Export game downloads one HTML file containing the runtime, code, and assets. Python exports a ZIP containing the website, main.py, and its bundled runtime; unzip it and serve it over HTTP. Put it on any static website or the arcade's web server. Basic games also open directly as local HTML in browsers that support local-file workers.
6. New → Finish session offers a download and clears recovery on shared devices.

Recovery is browser/device/origin-specific IndexedDB storage, not a permanent backup. Keep the same server hostname and port between lessons. Clearing browser data or private browsing can lose recovery. Save project before leaving. Asset imports are capped at 2 MB each; project import is capped at 20 MB and 100 images. Untrusted project code runs only when Run is pressed.

## Teaching API

The canvas is 640 × 480. Define `update(dt)` and `draw()`; optionally define `setup()`. `dt` is elapsed seconds, capped at 0.05. Use `game.keys` for input, `game.clear`, `rect`, `circle`, `text`, `sprite` for drawing, `overlap` for rectangle collisions, and `random` and `log`. All API signatures are in the editor's Code help. Built-in images were created for this project and may be reused freely.

## One static editor, two hosts

All student execution happens in the browser. The Pi supplies files over the classroom LAN; GitHub Pages supplies the same files over HTTPS. There is no Python backend, upload API, database, or account requirement. The Python interpreter is bundled JavaScript, so GitHub Pages does not need to run Python on the server.

Build the static site without downloading dependencies:

```sh
python3 scripts/build_site.py
```

This copies an explicit list of public editor files into `dist/`, including workers, lessons, dependency licenses, and bundled Python libraries. It excludes Git metadata, deployment scripts, local project backups, and unrelated files. `dist/` is generated and ignored by Git. The builder refuses to overwrite a directory containing unrelated files.

Preview that exact bundle:

```sh
python3 scripts/serve.py --directory dist --port 8080
```

Links and worker/export resources resolve relative to the installed editor directory. Both root URLs and repository URLs such as `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/` work with the same bundle.

### GitHub Pages

1. Put this source, including `.github/workflows/pages.yml` and `vendor/`, in your GitHub repository. Student `.gameproject` downloads should stay on student devices, outside the source repository.
2. In the repository's **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source.
3. Push to `main`, or run **Publish editor to GitHub Pages** manually from the Actions tab. If your default branch has another name, update the workflow's `branches` setting.
4. Open the Pages URL shown by the completed deployment. Use the trailing slash on a repository URL, or `index.html`.

The workflow checks JavaScript syntax, packages `dist/`, uploads that artifact, and deploys it using the official Pages actions. No npm install or third-party runtime downloads are needed during packaging. See [GitHub's custom workflow instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

GitHub Pages needs internet access to initially load the editor. The Pi version needs only the local router and server. Neither version caches the whole editor for disconnected browsing after losing its host connection.

Recovery belongs to the browser, origin, and installation path. The Pi and GitHub Pages do not synchronize projects. Use **Save project** on one and **Open project** on the other to move source, assets, lesson progress, and checkpoints. Root installations retain the existing recovery database; separate repository paths use separate recovery databases even on the same GitHub Pages domain.

## SSH installation and updates

Python 3 and SSH must already be available on the Pi. On the teacher computer:

```sh
bash scripts/deploy.sh teacher@raspberrypi.local
```

Replace the SSH destination with the real classroom host. The SSH script first builds the same static bundle used by Pages, then copies it into a versioned release under `site/` and installs the read-only server under `scripts/`. No dependency installation or internet access is needed on the Pi. Each deployment creates a versioned release and switches `~/pixel-workshop/current`. Active browser pages keep their loaded editor until refreshed. Downloaded games contain their own runtime; project format is versioned.

For automatic startup, create `~/.config/systemd/user/pixel-workshop.service` on the host:

```ini
[Unit]
Description=Pixel Workshop classroom server
After=network.target

[Service]
ExecStart=/usr/bin/python3 %h/pixel-workshop/current/scripts/serve.py --port 8080
Restart=on-failure

[Install]
WantedBy=default.target
```

Then run on the host:

```sh
systemctl --user daemon-reload
systemctl --user enable --now pixel-workshop
sudo loginctl enable-linger "$USER"
```

After an update, restart with `systemctl --user restart pixel-workshop`. Roll back by pointing `current` to a previous directory under `releases` and restarting. Deploy during a break to avoid a refresh fetching files across a release switch.

## Prototype boundaries

This uses an original small Canvas runtime rather than Phaser. The JavaScript game API is dependency-free. Python uses locally bundled Skulpt and ZIP export uses locally bundled JSZip. No block editor, turtle, Python sprites, audio, physics engine, autocomplete, multi-file editing, or arcade launcher adapter yet. The arcade export is playable HTML; its launcher/control mapping still needs testing on your actual box.

JavaScript student code runs in a Web Worker inside a sandboxed iframe. Python runs in a separate worker using Skulpt; it cannot directly access the editor DOM. Canvas drawing is relayed to the iframe. Stop destroys that iframe and its worker, including runaway loops. This keeps student code away from editor storage and the DOM, but is not a hardened hostile-code execution service. A busy worker can still consume device CPU until stopped. Exported games need a refresh to stop a loop. There is no cloud AI dependency.

## Checks

```sh
node --check editor.js
node --check app.js
node --check runtime.js
node --check python-worker.js
node --check python-terminal.js
python3 -m py_compile scripts/serve.py scripts/build_site.py
```

Manually check movement/collision, touch input, errors, infinite-loop Stop, recovery after refresh, project round-trip including an uploaded image, invalid-import preservation, Finish session, exported HTML in a separate browser, and a classroom device with outside internet disconnected.

Syntax highlighting is a bundled, dependency-free lexer for JavaScript and Python keywords, strings, comments, numbers, calls, and operators. It tolerates unfinished code; it is coloring, not a parser or syntax validator. No CDN, font download, or internet request is needed. Line numbers and coloring share the native textarea font and scroll position.

Error locations are mapped from browser worker diagnostics to main.js for syntax errors, runtime errors, and unhandled Promise rejections. If the browser does not provide a student-code location, the UI explicitly says the location is unavailable. A missing closing bracket may be reported at the final line: inspect preceding lines too. Exports include the same line numbers and hints.

## Python terminal projects

Choose **Multiplication quiz** in Start with an idea. It asks five random questions, retries nonnumeric input, and reports a score. Change `questions` and `largest_factor` to adjust difficulty. A plain Python copy is in `examples/multiplication-quiz.py`.

Ordinary `input()`, `print()`, loops, functions, `try / except`, and `import random` run locally in Skulpt 1.2.0 with Python 3 mode enabled. Skulpt is an educational browser implementation, not full CPython. Third-party desktop packages, robotics hardware libraries, turtle, and graphics are not supported in this mode. Input waits without blocking the editor or requiring HTTPS/SharedArrayBuffer. Stop terminates the worker and any pending question. Visible terminal output is capped at 60,000 characters.

Python errors include student line numbers and clickable navigation. Save/open and recovery preserve `language: "python"`; old projects without a language field remain JavaScript. Python Tab inserts four spaces.

Python exports include their runtime, worker, terminal UI, source, and license. Run the unzipped folder with `python3 -m http.server 8080`, then open `http://localhost:8080`. Static website and browser-based arcade hosting work the same way. Direct `file://` opening is not supported for these worker-based exports. Nothing calls the original editor server once exported. The SSH deployment script copies the complete vendor folder, so the Pi needs no internet or package installation.

Dependency sources, versions, licenses, and checksums are in `vendor/README.md`.

## Treasure Cave

Choose **New → Treasure Cave** for a working Python terminal adventure. Explore three rooms, collect random treasure, and escape before energy runs out. Invalid choices cost no energy; `quit` ends the game.

Learn includes a six-step Build from scratch path, Make a simpler version, Take it further, and lessons on input, branches, variables, loops, and randomness. Lesson drafts, project recovery, saves, and offline website exports work the same as the multiplication quiz. The standalone source is `examples/treasure-cave.py`. All game and lesson files are bundled for Pi and GitHub Pages.

## Python lesson framework

Choose **New → Multiplication quiz** to open the complete working program. Templates appear only in the New project dialog. New confirms before replacing existing work; Cancel keeps it. Save and Open remain in the compact header, with playable exports under Export. Finish session is available in the New dialog.

The Python editor has **Learn** and **Lesson code** menus directly above the source. Learn offers Build from scratch, Make a simpler version, Take it further, and six key skills. Selecting a lesson checkpoints your current source and title, then immediately loads the first example (or your saved draft) in a separate lesson workspace. Previous/Next load the corresponding step and retain edits to each step. Your project source stays in the checkpoint until you return.

Lesson code contains **Load this step / Resume this step**, **Use fresh example** after edits, **Original quiz**, and **Undo code change**. Loading an example runs it. Learn and step navigation load code automatically; press Run when ready to try it. **Back to my code** is always visible while a starting checkpoint exists; it restores that source and title, closes the lesson, and stops the preview. Done on the final step does the same. Edited step drafts are retained for a later visit. Undo is limited to the current lesson step and is cleared when returning to your project.

The path, step, drafts, starting checkpoint, and latest undo source travel inside `.gameproject` downloads and browser recovery. Finish session clears them with the rest of recovery. Playable exports contain the current program, not lesson navigation. Python projects have no asset sidebar; graphics projects keep their image shelf.

Build from scratch has seven steps: greeting, input, number conversion, conditionals, factor variables, loops and score, and the complete quiz. Older saved build drafts are moved to their corresponding steps when loaded.

`lessons.js` defines content separately from reusable navigation in `lesson-ui.js`. A lesson contains an ID/version, original code, introduction, and paths. Each path has an ID, label, kind (`route` or `skill`), and steps with `title`, `instruction`, `question`, runnable `code`, and a `focus` snippet. Register another lesson under its template ID in the controller's catalog in `app.js`. Keep lesson IDs, path IDs, and step order stable so saved drafts stay attached to their instructions; changing that structure requires a progress migration or a new lesson ID.

All lesson instructions and code are local files. Both Pi deployment and GitHub Pages packaging include them; no internet service or account is needed to execute a lesson after loading the editor.
