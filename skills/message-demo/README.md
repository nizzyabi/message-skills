# message-demo

An agent skill that turns a description of a text conversation into a phone-accurate demo video:
iMessage, SMS, Apple Messages for Business, WhatsApp or Telegram on an iPhone 17 Pro, moving the way
iOS 26 Messages does (messages typed into the composer, the typing pill, springs, reply lines,
tapbacks, photo stacks, voice notes with transcripts, Apple Pay with Face ID).

The agent writes a small JSON script, runs one command, checks a still and hands back an MP4 (or a
PNG). Everything it needs is in this folder: the instructions (`SKILL.md`), a playbook, working
examples, and the phone renderer. Nothing to clone, no account, no API key.

## Install

Copy this folder, named `message-demo`, to where your agent reads skills:

| Agent | Folder |
| --- | --- |
| Claude Code | `~/.claude/skills/message-demo` (all projects) or `.claude/skills/message-demo` (one project) |
| Codex and other agents that read `.agents/skills` | `~/.agents/skills/message-demo` or `.agents/skills/message-demo` |
| Claude (claude.ai, the desktop app) | zip the folder and add it under Settings › Capabilities › Skills |

Then ask for it in plain words: "make a demo video of a customer booking a table with our agent on
iMessage", "a WhatsApp demo where the agent sends a voice note", "same thing as a 9:16 story".

## Requirements

Node 18 or newer. The first recording installs Playwright and Chromium into `.runtime/` inside this
folder (about 100 MB, one time). Where nothing can be installed, the skill prints a link to the web
editor at https://onkeiki.com/message-demo instead, which plays and records the same demo in the
browser.

## What's inside

- `SKILL.md`: what the agent reads: the script format, what moves, how to make a demo land, how to record.
- `reference/imessage-playbook.md`: Apple's rules the renderer follows (tails, reply lines, tapbacks, Apple Pay, voice notes, timing).
- `examples/`: working scripts for each app, with their images.
- `scripts/record.mjs`: records a script to an MP4 or PNG. `scripts/link.mjs`: prints an editor link instead.
- `renderer/`: the phone itself, a small static web page that `record.mjs` films.

The phone frame is an original drawing, and every example image is original or fictional. The
names Apple, iMessage, WhatsApp and Telegram identify which app's look a demo follows; this project
isn't affiliated with any of them.
