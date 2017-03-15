# Servie Http

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

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
  return new Response({ body: 'hello world' }))
})

createServer(handler).listen(3000)
```

## TypeScript

This project is written using [TypeScript](https://github.com/Microsoft/TypeScript) and publishes the definitions directly to NPM.

## License

Apache 2.0

[npm-image]: https://img.shields.io/npm/v/servie-http.svg?style=flat
[npm-url]: https://npmjs.org/package/servie-http
[downloads-image]: https://img.shields.io/npm/dm/servie-http.svg?style=flat
[downloads-url]: https://npmjs.org/package/servie-http
[travis-image]: https://img.shields.io/travis/blakeembrey/node-servie-http.svg?style=flat
[travis-url]: https://travis-ci.org/blakeembrey/node-servie-http
[coveralls-image]: https://img.shields.io/coveralls/blakeembrey/node-servie-http.svg?style=flat
[coveralls-url]: https://coveralls.io/r/blakeembrey/node-servie-http?branch=master
