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

console.log(args)

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
      --export, -e  The key of "--file" to use as the application
      --port, -p    A port number on which to start the application
  `)

  process.exit(0)
}

const pkg = require(join(process.cwd(), file))
const main = key ? pkg[key] : (pkg.__esModule ? pkg.default : pkg)
const handler = createHandler(main)

createServer(handler).listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
