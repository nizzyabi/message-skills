#!/usr/bin/env node
/**
 * Records a message demo script to an MP4 (or a PNG) with nothing but Node. The phone is drawn by
 * the renderer bundled in this skill (`../renderer`), in headless Chromium, filmed frame by frame.
 *
 *   node record.mjs demo.json                          # demo.mp4: the phone on white, 1080 x 1350
 *   node record.mjs demo.json --format 9:16 --backdrop sky --out story.mp4
 *   node record.mjs demo.json --png                    # demo.png: the finished thread, same framing
 *
 * The first run installs Playwright and Chromium into `.runtime/` next to this skill (a minute,
 * one time); later runs take about as long as the video.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { basename, dirname, extname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const PLAYWRIGHT = '1.63.0'
const FORMATS = ['4:5', '1:1', '9:16', '16:9']
const BACKDROPS = ['white', 'mist', 'sky', 'peach', 'mint', 'lilac', 'paper', 'graphite']
const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.avif': 'image/avif', '.woff2': 'font/woff2',
}

const skill = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const renderer = join(skill, 'renderer')
const runtime = join(skill, '.runtime')

const args = process.argv.slice(2)
const option = (name, fallback) => {
  const at = args.indexOf(`--${name}`)
  return at >= 0 && args[at + 1] ? args[at + 1] : fallback
}
const file = args.find((arg, i) => !arg.startsWith('--') && !/^--(out|format|backdrop)$/.test(args[i - 1] ?? ''))
if (!file) fail('Usage: node record.mjs demo.json [--png] [--format 4:5|1:1|9:16|16:9] [--backdrop white|mist|…] [--out file]')
const png = args.includes('--png')
const format = option('format', '4:5')
const backdrop = option('backdrop', 'white')
if (!FORMATS.includes(format)) fail(`--format must be one of ${FORMATS.join(', ')}`)
if (!BACKDROPS.includes(backdrop)) fail(`--backdrop must be one of ${BACKDROPS.join(', ')}`)
if (!existsSync(join(renderer, 'index.html'))) fail(`The renderer is missing from ${renderer}. Download the whole message-demo folder.`)

const scriptPath = resolve(file)
if (!existsSync(scriptPath)) fail(`No script at ${scriptPath}`)
let script
try {
  script = JSON.parse(readFileSync(scriptPath, 'utf8'))
} catch (error) {
  fail(`${basename(scriptPath)} is not valid JSON: ${error.message}`)
}
const out = resolve(option('out', join(dirname(scriptPath), `${basename(scriptPath, extname(scriptPath))}.${png ? 'png' : 'mp4'}`)))

// Images named relative to the script are served from its folder (never above it).
const MEDIA = '/__media/'
const isRelative = (url) => typeof url === 'string' && !/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(url)
const served = (url) => (isRelative(url) ? MEDIA + url.split('/').map(encodeURIComponent).join('/') : url)
if (script.contact?.avatar) script.contact.avatar = served(script.contact.avatar)
for (const message of script.messages ?? []) {
  if (message.images) message.images = message.images.map(served)
  if (message.link?.image) message.link.image = served(message.link.image)
  if (message.link?.icon) message.link.icon = served(message.link.icon)
  for (const product of message.products ?? []) if (product.image) product.image = served(product.image)
}

const { chromium } = await playwright()
const mediaRoot = dirname(scriptPath)
const server = createServer((request, response) => {
  const path = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname)
  const media = path.startsWith(MEDIA)
  const root = media ? mediaRoot : renderer
  const target = media ? resolve(mediaRoot, path.slice(MEDIA.length)) : resolve(renderer, `.${path === '/' ? '/index.html' : path}`)
  if (relative(root, target).startsWith('..') || !existsSync(target)) {
    response.writeHead(404).end()
    return
  }
  response.writeHead(200, { 'content-type': TYPES[extname(target).toLowerCase()] ?? 'application/octet-stream' }).end(readFileSync(target))
})
await new Promise((ready) => server.listen(0, '127.0.0.1', ready))
const query = new URLSearchParams({ backdrop, format })
if (png) query.set('t', 'end')
const url = `http://127.0.0.1:${server.address().port}/?${query}#${Buffer.from(JSON.stringify(script)).toString('base64url')}`

const browser = await chromium.launch()
try {
  const open = async (viewport) => {
    const problems = []
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 })
    page.on('pageerror', (error) => problems.push(error.message))
    await page.goto(url)
    const drawn = await page.waitForFunction(() => window.messageUi?.ready === true, undefined, { timeout: 15000 }).then(() => true, () => false)
    if (!drawn) fail(`The script didn't draw. Check it against the field table in SKILL.md.${problems.length ? `\n${problems.join('\n')}` : ''}`)
    await page.waitForLoadState('networkidle')
    await page.evaluate(() => document.fonts.ready.then(() => undefined))
    return page
  }
  // The stage is drawn at the output's pixel size; size the page to it so nothing is cropped.
  const probe = await open({ width: 1920, height: 1920 })
  const box = await probe.locator('.render-stage').boundingBox()
  await probe.close()
  if (!box) fail('The renderer drew nothing.')
  const page = await open({ width: Math.ceil(box.width), height: Math.ceil(box.height) })
  if (png) {
    await page.locator('.render-stage').screenshot({ path: out, animations: 'disabled' })
  } else {
    const base64 = await page.evaluate(() => window.messageUi.record())
    writeFileSync(out, Buffer.from(base64, 'base64'))
  }
  console.log(out)
} finally {
  await browser.close()
  server.close()
}

/** Playwright from `.runtime/` next to this skill, installed (with Chromium) on first use. */
async function playwright() {
  const entry = join(runtime, 'node_modules', 'playwright-core', 'index.mjs')
  if (!existsSync(entry)) {
    console.error('First run: installing Playwright for recording (one time)…')
    run('npm', ['install', '--prefix', runtime, '--no-audit', '--no-fund', '--loglevel=error', `playwright-core@${PLAYWRIGHT}`])
  }
  const module = await import(pathToFileURL(entry).href)
  if (!existsSync(module.chromium.executablePath())) {
    console.error('First run: downloading Chromium (one time)…')
    run(process.execPath, [join(runtime, 'node_modules', 'playwright-core', 'cli.js'), 'install', 'chromium'])
  }
  return module
}

function run(command, commandArgs) {
  const step = spawnSync(command, commandArgs, { stdio: ['ignore', 'inherit', 'inherit'], shell: process.platform === 'win32' })
  if (step.status !== 0) fail(`\`${command} ${commandArgs.join(' ')}\` failed.`)
}

function fail(message) {
  console.error(message)
  process.exit(1)
}
