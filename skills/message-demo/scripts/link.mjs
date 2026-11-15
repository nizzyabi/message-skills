#!/usr/bin/env node
/**
 * Prints a link that opens a script in the Message UI editor, where it plays on the phone and can
 * be downloaded as a video or PNG. No install: plain Node, no dependencies.
 *
 *   node link.mjs demo.json [--base https://onkeiki.com/message-demo]
 *
 * Images named by a path relative to the script are embedded in the link, so it works anywhere.
 */
import { readFileSync } from 'node:fs'
import { dirname, extname, resolve } from 'node:path'

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.avif': 'image/avif' }
const DEFAULT_BASE = 'https://onkeiki.com/message-demo'

const args = process.argv.slice(2)
const file = args.find((arg) => !arg.startsWith('--'))
const baseIndex = args.indexOf('--base')
const base = baseIndex >= 0 ? args[baseIndex + 1] : DEFAULT_BASE
if (!file) {
  console.error('Usage: node link.mjs demo.json [--base <editor url>]')
  process.exit(1)
}

const scriptPath = resolve(file)
const folder = dirname(scriptPath)
const script = JSON.parse(readFileSync(scriptPath, 'utf8'))

const isRelative = (url) => !/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(String(url))
const embed = (url) => {
  if (!isRelative(url)) return url
  const type = MIME[extname(url).toLowerCase()]
  if (!type) throw new Error(`Unsupported image type: ${url}`)
  return `data:${type};base64,${readFileSync(resolve(folder, url)).toString('base64')}`
}

if (script.contact?.avatar) script.contact.avatar = embed(script.contact.avatar)
for (const message of script.messages ?? []) {
  if (message.images) message.images = message.images.map(embed)
  if (message.link?.image) message.link.image = embed(message.link.image)
  if (message.link?.icon) message.link.icon = embed(message.link.icon)
  for (const product of message.products ?? []) if (product.image) product.image = embed(product.image)
}

const link = `${base}#${Buffer.from(JSON.stringify(script)).toString('base64url')}`
if (link.length > 1_500_000) console.error(`Warning: the link is ${(link.length / 1e6).toFixed(1)} MB because of embedded images; use image URLs instead to shorten it.`)
console.log(link)
