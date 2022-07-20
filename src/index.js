import $RefParser from '@apidevtools/json-schema-ref-parser';
import jsYaml from 'js-yaml';

// import Swagger from '../../src/index.js';

async function resolver(specUrlOrObject) {
  if (typeof specUrlOrObject === 'object') {
    if (typeof specUrlOrObject.href === 'string') {
      return $RefParser.dereference(specUrlOrObject.toString());
    }

    return $RefParser.dereference(specUrlOrObject);
  }

  try {
    return $RefParser.dereference(JSON.parse(specUrlOrObject));
  } catch (error) {
    /* */
  }

  const loadedYamlDoc = jsYaml.load(specUrlOrObject);
  return $RefParser.dereference(loadedYamlDoc);
}

resolver.resolve = resolver;

export default resolver;
