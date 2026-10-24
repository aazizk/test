# Exports — pandoc setup

This sandbox does not have `pandoc` installed (`which pandoc` returned nothing, checked 2026-10-19), and the `course-book` skill does not attempt to install it here — no sudo/package-manager access is assumed or forced in this environment.

To build the EPUB yourself, install `pandoc` in **your own terminal** (not this sandbox) with whichever applies:

```bash
# Debian / Ubuntu / WSL
sudo apt update && sudo apt install -y pandoc

# macOS (Homebrew)
brew install pandoc

# Windows
winget install --id JohnMacFarlane.Pandoc
```

Verify it installed:

```bash
pandoc --version
```

Then re-run the `course-book` skill in export mode (or run the pandoc command documented in `~/.claude/skills/course-book/references/export-guide.md` directly) to produce `security-tutor-book.epub` in this directory.

The print manuscript (`security-tutor-book-print-manuscript.md`) does **not** require pandoc — it's generated as plain Markdown regardless of whether pandoc is available, since it's meant to be imported into a layout tool (Word, Vellum, Atticus, Affinity Publisher) for actual KDP print formatting anyway.
