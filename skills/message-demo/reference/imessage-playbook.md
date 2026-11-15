# iMessage playbook

How to write scripts that read as a real iPhone, and what the renderer does for you. Most of it
applies to SMS and Apple Messages for Business too; WhatsApp and Telegram notes are at the end.

## Bubbles and tails

- The renderer applies Apple's rule: messages from one sender in a row form a **group**, and only
  the **last bubble of the group** has a tail. You never set tails.
- A group breaks when the sender changes or a message has a `timestamp` ("Today 6:04 PM"). Use a
  timestamp for a real gap in time; it also gives the bubble above its tail back.
- While the agent is typing, the typing pill joins their group and takes the tail from their last
  bubble. Your own bubbles never lose a tail to it.
- Photos and cards don't carry tails, and a card under the text (Apple Pay, a list picker, a time card)
  ends the run, so that text has no tail either. A link preview is a bubble and takes the tail.
- One to three emoji alone (`"🙏"`, `"☕️🎉"`) draw big with no bubble. Mix words in to keep a bubble.
- Split long replies into two or three agent messages. Two short bubbles in a group look more real
  than one wall of text, and the tail lands on the last.

## Reply lines

`replyTo: <index>` makes an inline reply. The renderer draws it the way iOS 26 does in the
conversation, measured from one-to-one iOS 26 screenshots and screen recordings. The connector lives in the agent's (left) column, 16.7pt inside its bubble edge, and its arm
points right, level with the middle of the blue bubble it joins.

| who replies | to | what iOS draws |
| --- | --- | --- |
| you | the agent's message right above | **curl**: drops from under the agent bubble's tail and curls right, ending level with your reply's middle, short of it |
| agent | your message right above | **hook**: the curl flipped, from the agent's side only: a short arm level with your bubble's middle curves down the left column onto the agent's reply; it never runs across to your bubble |
| agent | its own message from two back, past one of yours | **loop**: down the left column from under the old bubble, a small loop beside your message in between, on to the reply |
| you | your own message from two back, past one of the agent's | **loop**, mirrored in your right column |
| either | their own message from further up | the **stub** (below) on their own side, joined to the reply by a short stem; no line runs up the thread |
| either | the other side's *older* message | a **stub**: the original's own bubble, colour and tail, tinted to 55% opacity at 0.76 scale (11pt text, up to three lines), above the reply on the original's side, joined by the curl or hook |
| agent | your reply to the agent, right above | the hook and your curl part around your bubble (yours ends just above its middle, the agent's starts just below) with extra room, so they never touch |
| either | their own message one or two back, with only their bubbles between | a straight **stem**, mostly hidden; rarely worth scripting |

Use them where a real person would: the agent answering a specific question (hook), coming back to
its own point after you said something (loop), or you answering something from earlier (copy). One
or two per demo; `examples/imessage-replies.json` uses a hook and a loop.

## Tapbacks

- `reaction` takes Apple's six classic tapbacks by name: `heart`, `like`, `dislike`, `laugh`
  (HA HA), `emphasize` (!!), `question` (?). They draw as Apple's glyphs. Any emoji also works
  (`"🔥"`, `"📦"`), as in iOS 18.
- The other side reacts by default; set `reactionBy: "me"` or `"agent"` to choose. Your tapbacks are
  blue with a white glyph, theirs grey.
- When it lands, the room above the bubble opens smoothly first, then the balloon builds into it
  in iOS's order: small dot, larger dot, disc, glyph pop. It sits on the bubble's top corner away
  from the tail, about 0.9 s after its message.
- Every emoji (in bubbles, jumbo, tapbacks, reactions) is drawn as Apple's artwork on any device,
  so demos look like an iPhone on Windows and Android and in recorded video.
- Good uses: the person hearts the agent's confirmation, the agent likes a request it will act on,
  HA HA on a joke. One per three or four messages at most.

## Links and images

- `link: { url, title, image }` is a rich link: a large share image over the title and domain,
  exactly like a pasted URL in Messages. Use the page's real OG image (1.91:1 works best).
- `link: { url, title, icon }` without `image` is the compact card with the site icon at the end
  (Apple Maps, App Store style).
- `images: [...]`: one photo draws on its own; two or more draw Messages' stacked carousel, which
  swipes through after it lands (top card flicks away, the next comes forward, up to twice) before
  the thread moves on. Put the caption in `text` on the same message: photos first, then the bubble.
  The first photo is on top in a still image.
- Media can be URLs or paths next to the script. In the editor, pasting a URL fetches its title and
  OG image automatically.

## Voice notes

- `voice: { duration: "0:09" }` is an audio message, as Messages draws one: a play button, the
  waveform and the length, in the sender's bubble colour. It works on every app.
- A voice note has no words to type, so yours sends at once (no composer typing). The agent's still
  shows the typing pill first; set `typing: false` on it if it should simply arrive.
- `voice: { duration, transcript }` adds the transcript iOS shows under an audio message: the bubble
  widens and the words sit under the waveform in smaller secondary text (white on your blue). Add it
  whenever the words matter, since a demo video plays silent; leave it out for a quick "on my way".
- Keep them short (0:04 to 0:15) and use one per demo: it breaks up a run of text bubbles and reads
  as a real person or a capable agent. Put `text` on the same message only for a caption.

## Commerce and Business Chat

- `products` draws a row of cards; mark the chosen one `picked: true`. iMessage has no product-card
  row of its own, so on `imessage` show products as `images` (the photo stack) with a caption, and
  keep `products` for Business Chat (`amb`).
- `payment: { amount, label, merchant, sheet: true }` draws the Apple Pay card and then raises the
  iOS 26 Apple Pay sheet (from Apple's Human Interface Guidelines): the merchant and total, the card,
  Change Payment Method, the card row and the summary, with Face ID over "Confirm with Side Button".
  Face ID folds into a check and "Done", the sheet slides down, and as it uncovers the card the black
  Pay button settles into a white "Paid" capsule with a green check. Follow it with the agent's
  confirmation. The text above the card has no tail: the card ends the run.
- `picker` is Apple's list picker (options can carry an Apple Pay chip); answer it with a `me`
  message that has `selected: "<picker title>"`, which draws "✓ Late checkout" over the reply.
- `schedule` is the time picker card. Use `amb` (verified seal, square logo) for a business.

## Timing (what makes it feel smooth)

- Defaults are tuned: agent messages type first, sized to their length (0.8–2.4 s); your messages
  arrive about 1 s after the agent's.
- `delay` adds a pause before a message; use 300–600 ms to send two of your own bubbles in quick
  succession, or 1.2 s+ before a time jump.
- Your messages are typed into the composer a character at a time, then send; the agent's show the
  typing pill first. `typing: false` for messages that arrive instantly (reminders, receipts, a
  photo you just send); a number sets the typing time in ms.
- `hold` is how long the finished thread stays (default 2.5 s). Then it eases out to an empty screen,
  so a replay and a looping video start without a cut.
- Motion is Apple's: your words type into the composer and the bubble rises on the iOS send spring,
  replies grow out of the typing pill, the thread glides up as messages land, reply lines draw in,
  tapbacks pop. Nothing to configure.

## Writing

- 4 to 8 messages. The person writes short and lowercase; the agent writes clear full sentences.
- Show one job done end to end: ask, clarify with a picker or quick replies, confirm, pay, thank.
- Real-looking specifics (times, prices, room numbers) beat generic copy.
- Don't use real people's names, or brands' logos the user doesn't own.

## WhatsApp and Telegram

Same script. The time sits inside each bubble, "typing…" shows in the header instead of a bubble,
replies quote the original in the bubble (no lines), classic tapbacks become their emoji, `buttons`
become WhatsApp reply buttons or a Telegram inline keyboard, and `picker` becomes a WhatsApp list
message or Telegram buttons.
