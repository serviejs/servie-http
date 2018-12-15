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
  '--hostname': String,

  '-h': '--help',
  '-f': '--file',
  '-p': '--port',
  '-H': '--hostname',
  '-k': '--key'
})

const {
  '--port': port = Number(process.env.PORT) || 3000,
  '--help': help,
  '--file': file,
  '--hostname': hostname = '0.0.0.0',
  '--key': key = ''
} = args

if (help) {
  console.log(`
    Description
      Start a HTTP server based on Servie.js
    Usage
      $ servie-http -p <port> -f <script.js> -k default
    Options
      --file, -f      The file to resolve which exports an app to serve over HTTP
      --port, -p      The port number on which to start the application (${port})
      --hostname, -H  The hostname on which to start the application (${hostname})
      --key, -k       The property of "--file" exporting the application (${JSON.stringify(key)})
  `)

  process.exit(0)
}

const pkg = require(join(process.cwd(), file))
const main = key ? pkg[key] : (pkg.__esModule ? pkg.default : pkg)

if (typeof main !== 'function') {
  throw new TypeError(`Invalid "main" function exported: ${JSON.stringify(key)}`)
}

const app = createHandler(main)

createServer(app).listen(port, hostname, (err: Error | null) => {
  if (err) throw err

  console.log(`Server running on http://localhost:${port}`)
})
