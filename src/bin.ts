#!/usr/bin/env node

import arg = require('arg')
import { join } from 'path'
import { createServer } from 'http'
import { createHandler } from './index'

const args = arg({
  '--help': Boolean,
  '--file': String,
  '--port': Number,
  '--key': String,

  '-h': '--help',
  '-f': '--file',
  '-p': '--port',
  '-k': '--key'
})

const {
  '--port': port = process.env.PORT || 3000,
  '--help': help,
  '--file': file,
  '--key': key = ''
} = args

if (help) {
  console.log(`
    Description
      Start a HTTP server based on Servie.js
    Usage
      $ servie-http -p <port> -f <script.js> -k default
    Options
      --file, -f    A file to resolve exporting an app and serve over HTTP
      --key, -k     A property of "--file" with the application (${JSON.stringify(key)})
      --port, -p    A port number on which to start the application (${port})
  `)

  process.exit(0)
}

const pkg = require(join(process.cwd(), file))
const main = key ? pkg[key] : (pkg.__esModule ? pkg.default : pkg)

if (typeof main !== 'function') {
  throw new TypeError(`Invalid "main" function exported: ${JSON.stringify(key)}`)
}

const handler = createHandler(main)

createServer(handler).listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
