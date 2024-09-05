<p align="center">
  <img height="300px" src="https://authress.io/static/images/media-banner.png" alt="Authress media banner">
</p>

# OpenAPI Resolver

<p align="center">
    <a href="https://authress.io" alt="Authress Engineering">
      <img src="https://img.shields.io/static/v1?label=Authress+Engineering&message=OpenAPI%20Explorer&color=%23FBAF0B&logo=androidauto&logoColor=%23FBAF0B"></a>
    <a href="./LICENSE" alt="apache 2.0 license">
      <img src="https://img.shields.io/badge/license-Apache%202.0-blue.svg"></a>
    <a href="https://badge.fury.io/js/openapi-resolver" alt="npm version">
        <img src="https://badge.fury.io/js/openapi-resolver.svg"></a>
    <a href="https://authress.io/community" alt="npm version">
      <img src="https://img.shields.io/badge/community-Discord-purple.svg"></a>
</p>

**OpenAPI Resolver** is a JavaScript module that allows you to fetch, resolve, and interact with Swagger/OpenAPI documents.

## New!

**This is the new version of swagger-js, 3.x.** The OpenAPI Resolver replaces swagger-js.

## Compatibility
The OpenAPI Specification has undergone multiple revisions since initial creation in 2010. 
Compatibility between OpenAPI Resolver and the OpenAPI Specification is as follows:

OpenAPI Resolver Version | Release Date | OpenAPI Spec compatibility | Notes
------------------ | ------------ | -------------------------- | -----
4.x    | 2022-07-24 | 2.0, 3.0.0, 3.0.1, 3.0.2, 3.0.3, 3.1.0 |
3.10.x | 2020-01-17 | 2.0, 3.0.0 |

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

- Node.js: lts
- `openapi-resolver` works in the latest versions of Chrome, Safari, Firefox, and Edge.

## Security contact

Please disclose any security-related issues or vulnerabilities by emailing [security@authress.io](mailto:security@authress.io), instead of using the public issue tracker.
