---
name: message-demo
description: Write and record a phone-accurate demo video (MP4) or still (PNG) of a text conversation on an iPhone, in iMessage, green-bubble SMS, Apple Messages for Business, WhatsApp or Telegram, with iOS 26 motion (messages typed into the composer, the typing pill, bubbles springing in), reply lines, tapbacks, photo stacks, link previews, voice notes, Apple Pay with Face ID, list pickers, quick replies and documents. Use when someone asks for a demo video of a text conversation, an agent or bot texting a customer, a fake or mock text thread, an iMessage screenshot, a launch or social clip of a chat, or "make it look like a real phone".
---

# Message demo

A demo is one JSON **script**: which app, who the conversation is with, and the messages. You write
it, **record** it to an MP4 with one command, look at a still, and hand over the file. The phone is
drawn to the point (iPhone 17 Pro, iOS 26 Messages) and moves the way Messages does, so the script
is the only thing you design.

When someone says "make a demo of …", do the whole thing: write the script from what they describe,
reach for the native pieces below wherever they make it read as real, record it, check a still, and
give them the MP4's path.

This skill's folder (where this SKILL.md lives) holds `examples/` (working scripts per app, images in
`examples/media/`), `scripts/record.mjs`, `scripts/link.mjs`, `reference/imessage-playbook.md`, and
`renderer/`, the phone itself, which `record.mjs` films.
**Read the playbook before writing a script**: Apple's tail rule, which reply line each pairing
draws, tapbacks, links, Apple Pay, voice notes, and the timing that makes it feel smooth.

## 1. Write the script

Save it as `<name>.json` in the user's project. Start from the closest file in `examples/`
(`imessage-booking.json` and `imessage-replies.json` show most of iMessage at once). Media fields
take image URLs, or paths relative to the script (copy any example images you reuse next to it).

```json
{
  "channel": "imessage",
  "contact": { "name": "Maison Solenne", "avatar": "media/maison-solenne.svg" },
  "messages": [
    { "from": "me", "text": "anything in cognac under $600?" },
    { "from": "agent", "images": ["media/bag-cognac.webp", "media/bag-black.webp", "media/bag-wine.webp"], "text": "Three that fit. The cognac is the bestseller:" },
    { "from": "me", "text": "the cognac, gift wrapped please", "reaction": "heart" },
    { "from": "agent", "text": "Lovely choice.", "payment": { "amount": "$480.00", "merchant": "Maison Solenne", "label": "Cognac tote", "sheet": true } },
    { "from": "agent", "voice": { "duration": "0:09" } },
    { "from": "me", "text": "legend", "replyTo": 3 }
  ]
}
```

- `channel`: `imessage` (blue), `sms` (green), `amb` (Apple Messages for Business: square logo,
  verified seal), `whatsapp`, `telegram`.
- `from`: `me` is the person holding the phone (right); `agent` is the agent or business they are
  texting (left).
- Everything a message can carry is optional and combinable:

| field | draws |
| --- | --- |
| `text` | the bubble; URLs in it are underlined. One to three emoji alone draw big with no bubble |
| `images: [url, …]` | one photo, or Messages' stacked carousel that swipes through after it lands (a grid on WhatsApp/Telegram). Put the caption in `text`: photos first, then the bubble |
| `link: { url, title, image, icon, siteName, description }` | a rich link with the share image; with `icon` and no `image`, iMessage's compact card |
| `voice: { duration, transcript }` | an audio message: play button, waveform and length, on every app. With `transcript`, the words show under the waveform in smaller text, as Messages transcribes audio |
| `payment: { amount, merchant, label, sheet }` | the Apple Pay card; `sheet: true` raises the iOS 26 Apple Pay sheet, confirms with Face ID ("Done"), drops it, and the card turns Paid. An invoice on WhatsApp/Telegram |
| `picker: { title, subtitle, options: [{ label, detail, applePay }] }` | Apple's list picker, a WhatsApp list message, Telegram inline buttons |
| `buttons: [label, …]` | quick replies: suggestion chips, WhatsApp reply buttons, a Telegram keyboard |
| `schedule: { title, subtitle, weekday, day }` | Apple's time picker card |
| `file: { name, detail }` | a document card |
| `products: [{ title, price, image, picked }]` | a row of product cards. Not native to iMessage: show products as `images` there, and keep cards for Business Chat |
| `replyTo: <index>` | an inline reply. iMessage draws iOS 26's line: a curl or hook to the message right above, a loop back to a message two up, and a faded copy above the reply for anything older. WhatsApp/Telegram quote it |
| `selected: "Late checkout"` | marks a reply as the answer to a picker: "✓ Late checkout" over it |
| `reaction` | a tapback after it lands: `heart`, `like`, `dislike`, `laugh`, `emphasize`, `question`, or any emoji (`"🔥"`), in Apple's artwork |
| `reactionBy: "me" \| "agent"` | who taps it back (default: the other side) |
| `timestamp: "Today 6:04 PM"` | a time header above the message; it also starts a new group |

- Tails follow Apple's rule, so you never set them: only the last bubble of a run from one sender
  has one, and a card after the text (Apple Pay, a picker) ends the run with no tail.
- Timing, optional per message: `delay` (ms before it), `typing` (`false` to send at once, or ms).
  Script-level: `contact.avatar`, `contact.subtitle` (WhatsApp/Telegram), `contact.verified`,
  `time` (status bar clock, default `9:41`), `hold` (ms the finished thread stays, default 2500).

## 2. What moves (you get all of it for free)

Every beat below is automatic; the script decides which ones happen.

1. **Your messages are typed.** Each `me` message with words types into the composer a character
   at a time (about 55 ms a key, uneven like a thumb, never more than 2 s), the mic turns into the
   blue send button, and after a beat the bubble rises out of the composer on iOS's send spring.
2. **The agent types back.** The typing pill shows (sized to the reply's length), then the reply
   grows out of it on the receive spring.
3. **The thread scrolls like a phone.** Older messages glide up as new ones land; once the thread
   outgrows the screen it scrolls under the header.
4. **Rich pieces have their own entrance.** A photo stack swipes through twice, reply lines draw
   in with their reply, a tapback builds dot, disc, then glyph pop about 0.9 s after its message.
5. **Apple Pay is a scene.** The sheet rises over the thread, Face ID turns into a check and
   "Done", the sheet drops, and the card's Pay button becomes "Paid".
6. **It loops clean.** After `hold` the thread eases out to an empty screen, so a looping video or
   a replay starts without a cut.

Under `prefers-reduced-motion` (in the editor) everything fades instead of moving.

## 3. Make it land

- **One job, end to end.** Ask, clarify with a native piece (photos, a picker or quick replies),
  confirm, pay, thank. 4 to 8 messages, 10 to 25 seconds of video.
- **Native beats prose.** A choice is `buttons` or a `picker`, a purchase is `payment` with `sheet`,
  a product is a photo stack, a booking answer is a `selected` reply, an address is a compact
  `link`. These read as the real app far more than a sentence does.
- **Voice is texture.** One voice note (often the agent's) breaks up a wall of bubbles. Keep it
  short (0:04 to 0:15), and give it a `transcript` when what it says matters to the story: viewers
  read it, since a video has no sound.
- **Reactions are the payoff.** One tapback per three or four messages: the person hearts the
  confirmation, HA HA on a joke, 🔥 on a great result.
- **Replies show attention.** One `replyTo` per demo: the agent answering a specific question, or
  the person coming back to something earlier.
- **Voice of each side.** The person writes short and lowercase; the agent writes clear full
  sentences and splits long answers into two bubbles.
- **Real specifics.** Times, prices, room numbers and order IDs beat generic copy. Never use real
  people's names or brands' logos the user doesn't own.

## 4. Record it

```sh
node <this skill's folder>/scripts/record.mjs demo.json
```

It writes `demo.mp4` next to the script: the phone playing the conversation on a white backdrop,
1080 × 1350 (4:5), 30 fps, filmed frame by frame so every frame is smooth. Options:

- `--format 4:5 | 1:1 | 9:16 | 16:9` (feed post, square, story or reel, landscape)
- `--backdrop white | mist | sky | peach | mint | lilac | paper | graphite`
- `--out <file>`
- `--png` for the finished thread as a still in the same framing

It needs only Node 18 or newer. The first run installs Playwright and Chromium into `.runtime/`
inside this skill's folder (about 100 MB, a minute, one time); later runs take about as long as the
video.

**Check before you hand it over.** Render `--png` and look at it: nothing important scrolled off
under the header, images loaded, reply lines and tapbacks where you meant them, no tail on text
above a card. Fix the script and record again if not. A still is the finished thread, so the typing,
the Apple Pay sheet and the motion only show in the video.

Map requests onto the script: "with a reply line" is `replyTo`, "they heart it" is
`reaction: "heart"`, "pays with Apple Pay" is `payment` with `sheet: true`, "sends a voice note" is
`voice`, "shows the options" is `images` or `buttons`, "make it a story" is `--format 9:16`.

## 5. Or share it as a link (no install)

```sh
node <this skill's folder>/scripts/link.mjs demo.json
```

It prints a link to the editor at https://onkeiki.com/message-demo with the script (and its local
images) packed into the URL. The conversation plays on the phone, they can tweak any message, and
**Download video** records the same MP4 in their browser. Use it when the user wants to edit by hand,
or when nothing can be installed where you are running.
