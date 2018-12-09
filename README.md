# Servie Http

[![NPM version](https://img.shields.io/npm/v/servie-http.svg?style=flat)](https://npmjs.org/package/servie-http)
[![NPM downloads](https://img.shields.io/npm/dm/servie-http.svg?style=flat)](https://npmjs.org/package/servie-http)
[![Build status](https://img.shields.io/travis/serviejs/servie-http.svg?style=flat)](https://travis-ci.org/serviejs/servie-http)
[![Test coverage](https://img.shields.io/coveralls/serviejs/servie-http.svg?style=flat)](https://coveralls.io/r/serviejs/servie-http?branch=master)

> Servie transport for HTTP(s).

## Installation

```
npm install servie-http --save
```

## Usage

```ts
import { createServer } from 'http'
import { createHandler } from 'servie-http'
import { get } from 'servie-route'

const handler = createHandler(get('/test', (req) => {
  return new Response({ statusCode: 200 }))
})

createServer(handler).listen(3000)
```

### CLI

```
servie-http -f index.js -p 4000

servie-http --help
```

## TypeScript

This project is written using [TypeScript](https://github.com/Microsoft/TypeScript) and publishes the definitions directly to NPM.

## License

Apache 2.0
