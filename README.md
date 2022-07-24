# OpenAPI Resolver

[![Build Status](https://github.com/rhosys/openapi-resolver.js/actions/workflows/nodejs.yml/badge.svg)](https://github.com/rhosys/openapi-resolver.js/actions)

**OpenAPI Resolver** is a JavaScript module that allows you to fetch, resolve, and interact with Swagger/OpenAPI documents.

## New!

**This is the new version of swagger-js, 3.x.** The OpenAPI Resolver replaces swagger-js.

## Compatibility
The OpenAPI Specification has undergone multiple revisions since initial creation in 2010. 
Compatibility between OpenAPI Resolver and the OpenAPI Specification is as follows:

OpenAPI Resolver Version | Release Date | OpenAPI Spec compatibility | Notes
------------------ | ------------ | -------------------------- | -----
3.10.x | 2020-01-17 | 2.0, 3.0.0 |
4.x    | 2022-07-24 | 2.0, 3.0.0, 3.0.1, 3.0.2, 3.0.3, 3.1.0 |

## Installation

We publish single module to npm: [openapi-resolver](https://www.npmjs.com/package/openapi-resolver).
`openapi-resolver` is meant for consumption by any JavaScript engine (node.js, browser, etc...).
The npm package contains transpiled and minified ES5 compatible code.

```shell script
 $ npm install openapi-resolver
``` 

After installed successfully:

[ES6 imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)
```js
import openApiResolver from 'openapi-resolver';
```

[CommonJS imports](https://en.wikipedia.org/wiki/CommonJS)
```js
const openApiResolver = require('openapi-resolver');
```


## Usage

```js
import openApiResolver from 'openapi-resolver';

const spec = await openApiResolver('http://petstore.swagger.io/v2/swagger.json');
```


### Runtime 

- Node.js `>=` 14.x
- `openapi-resolver` works in the latest versions of Chrome, Safari, Firefox, and Edge.

## Security contact

Please disclose any security-related issues or vulnerabilities by emailing [security@rhosys.ch](mailto:security@rhosys.ch), instead of using the public issue tracker.
