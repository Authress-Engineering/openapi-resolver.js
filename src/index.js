/* eslint-disable no-bitwise */
import $RefParser from '@apidevtools/json-schema-ref-parser';
import jsYaml from 'js-yaml';
import cloneDeepWith from 'lodash.clonedeepwith';

async function resolver(specUrlOrObject) {
  const result = await dereference(specUrlOrObject);

  const refStack = [];
  const keyPath = [];
  function handleCircularReferences(objectWithRef, key) {
    if (typeof objectWithRef !== 'object') {
      return undefined;
    }
    if (objectWithRef === null) {
      return null;
    }
    if (!Object.hasOwnProperty.call(objectWithRef, '$ref')) {
      if (Array.isArray(objectWithRef)) {
        return undefined;
      }
      const newObject = {};
      Object.keys(objectWithRef).forEach((objectKey) => {
        keyPath.push(objectKey);
        newObject[objectKey] = cloneDeepWith(objectWithRef[objectKey], handleCircularReferences);
        keyPath.pop();
      });

      return newObject;
    }

    const clonedObject = cloneDeepWith(objectWithRef);
    const ref = clonedObject.$ref;
    delete clonedObject.$ref;

    const keyPathMatch = ref
      .split('/')
      .slice(1)
      .every((part, partIndex) => keyPath[partIndex] === part);
    if (refStack.includes(ref) || keyPathMatch) {
      // eslint-disable-next-line prettier/prettier
      return Object.assign(clonedObject, { circularReference: { $ref: ref, name: ref.split('/').slice(-1)[0] } });
    }

    refStack.push(ref);
    keyPath.push(key);
    const newValue = result.$refs.get(ref);
    const mergedResult = { ...newValue, ...clonedObject };
    const finalResult = cloneDeepWith(mergedResult, handleCircularReferences);
    refStack.pop();
    keyPath.pop();
    return finalResult;
  }

  const specWithReferences = cloneDeepWith(result.schema, handleCircularReferences);
  return specWithReferences;
}

async function dereference(specUrlOrObject) {
  const parser = new $RefParser();

  const options = { dereference: { circular: 'ignore' } };
  if (typeof specUrlOrObject === 'object') {
    if (typeof specUrlOrObject.href === 'string') {
      await dereference(specUrlOrObject.toString(), options);
      return parser;
    }

    await parser.dereference(specUrlOrObject, options);
    return parser;
  }

  try {
    await parser.dereference(JSON.parse(specUrlOrObject), options);
    return parser;
  } catch (error) {
    /* */
  }

  const loadedYamlDoc = await jsYaml.load(specUrlOrObject);
  await parser.dereference(loadedYamlDoc, options);
  return parser;
}

resolver.resolve = resolver;

export default resolver;
