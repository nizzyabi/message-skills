# message-skills

Agent skills for making phone-accurate demos of text conversations.

## message-demo

Describe a conversation and your agent makes the video: iMessage, SMS, Apple Messages for Business,
WhatsApp or Telegram on an iPhone, moving the way iOS 26 Messages does.

- Your messages are typed into the composer, then spring up into the thread.
- The other side shows the typing pill, then replies.
- Reply lines, tapbacks (Apple's six or any emoji), photo stacks, link previews, voice notes with
  transcripts, list pickers, quick replies, documents, and Apple Pay with Face ID.
- Out comes an MP4 (4:5, 1:1, 9:16 or 16:9, on eight backdrops) or a PNG, ready to post.

Ask in plain words:

> Make a demo video of a customer booking a table with our agent on iMessage. Add a voice note and
> make it a 9:16 story.

The agent writes a small JSON script, records it with one command, checks a still and hands you the
file. See [`skills/message-demo/SKILL.md`](skills/message-demo/SKILL.md) for everything it can draw.

## Install

Clone the repository and copy the skill to where your agent reads skills:

```sh
git clone https://github.com/nizzyabi/message-skills
cp -R message-skills/skills/message-demo ~/.claude/skills/
```

| Agent | Put `skills/message-demo` in |
| --- | --- |
| Claude Code | `~/.claude/skills/` (every project) or `.claude/skills/` (one project) |
| Codex and agents that read `.agents/skills` | `~/.agents/skills/` or `.agents/skills/` |
| Claude (claude.ai, the desktop app) | zip the `message-demo` folder and add it under Settings › Capabilities › Skills |

No clone? Download the repository as a ZIP from the green **Code** button and copy the same folder.

## Requirements

Node 18 or newer. The first recording installs Playwright and Chromium inside the skill's folder
(about 100 MB, one time). Nothing else: no account, no API key, no build step.

## License

MIT. The iMessage bubble tail is adapted from [Message UI](https://imessage.swerdlow.dev) (MIT); see
[LICENSE](LICENSE). The phone frame is an original drawing and the example images are original or
fictional. Apple, iMessage, WhatsApp and Telegram are named only to say which app's look a demo
follows; this project isn't affiliated with any of them.
