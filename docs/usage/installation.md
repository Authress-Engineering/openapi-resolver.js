# Installation

## Distribution channels

### NPM Registry

We publish single module to npm: [openapi-resolver](https://www.npmjs.com/package/openapi-resolver).
`openapi-resolver` is meant for consumption by any JavaScript engine (node.js, browser, etc...).
The npm package contains transpiled and minified ES5 compatible code.

```shell script
 $ npm install openapi-resolver
``` 

After installed successfully:

[ES6 imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)
```js
import OpenApiResolver from 'openapi-resolver';
```

[CommonJS imports](https://en.wikipedia.org/wiki/CommonJS)
```js
const OpenApiResolver = require('openapi-resolver');
```

### unpkg

You can embed OpenAPI Resolver UI's code directly in your HTML by using [unpkg's](https://unpkg.com/) interface.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>OpenApiResolver test</title>
    <script src="https://unpkg.com/openapi-resolver"></script>
    <script>
      new OpenApiResolver('http://petstore.swagger.io/v2/swagger.json')
        .then(
          client => client.apis.pet.addPet({ id: 1, body: { name: "bobby" } }),
          reason => console.error('failed to load the spec: ' + reason)
        )
        .then(
          addPetResult => console.log(addPetResult.body),
          reason => console.error('failed on api call: ' + reason)
        );
    </script>
  </head>
  <body>
    check console in browser's dev. tools
  </body>
</html>
```

See unpkg's main page for more information on how to use [unpkg](https://unpkg.com/).

### Static files without HTTP or HTML

Once swagger-ui has successfully generated the `/dist` directory, 
you can copy files from that directory to your own file system and host from there.
