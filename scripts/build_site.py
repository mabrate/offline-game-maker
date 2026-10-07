#!/usr/bin/env python3
"""Package the same static editor for GitHub Pages or the classroom Pi."""
import argparse
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parent.parent
SITE_FILES = (
    'index.html', 'style.css', 'terminal.css', 'app.js', 'editor.js',
    'runtime.js', 'python-terminal.js', 'python-worker.js', 'lessons.js', 'treasure-lessons.js', 'lesson-ui.js',
    'vendor/skulpt/skulpt.min.js', 'vendor/skulpt/skulpt-stdlib.js', 'vendor/skulpt/LICENSE',
    'vendor/jszip/jszip.min.js', 'vendor/jszip/LICENSE.markdown', 'vendor/README.md',
    'examples/multiplication-quiz.py', 'examples/treasure-cave.py',
)

def build(output):
    output = Path(output).resolve()
    if output == ROOT or output in ROOT.parents:
        raise ValueError('Choose a separate output directory, not the source or its parents.')
    allowed = set(SITE_FILES) | {'.nojekyll'}
    # Never clean or overwrite an unrelated folder. Rebuilding our own bundle is safe.
    if output.exists():
        for path in output.rglob('*'):
            if path.is_symlink():
                raise ValueError(f'Output contains a symbolic link: {path}')
            if path.is_file() and path.relative_to(output).as_posix() not in allowed:
                raise ValueError(f'Output contains an unrelated file: {path}; use another directory.')
    for name in SITE_FILES:
        if not (ROOT / name).is_file():
            raise FileNotFoundError(f'Missing bundled site file: {name}')
    output.mkdir(parents=True, exist_ok=True)
    for name in SITE_FILES:
        destination = output / name
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ROOT / name, destination)
    (output / '.nojekyll').write_text('')
    return output

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, default=ROOT / 'dist')
    args = parser.parse_args()
    try:
        result = build(args.output)
    except (ValueError, OSError) as error:
        parser.exit(1, f'Build failed: {error}\n')
    print(f'Static editor packaged in {result}')
