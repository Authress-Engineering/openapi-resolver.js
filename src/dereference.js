import $Ref from '@apidevtools/json-schema-ref-parser/lib/ref.js';
import Pointer from '@apidevtools/json-schema-ref-parser/lib/pointer.js';
import { resolve } from '@apidevtools/json-schema-ref-parser/lib/util/url.js';

export default dereference;

/**
 * Crawls the JSON schema, finds all JSON references, and dereferences them.
 * This method mutates the JSON schema object, replacing JSON references with their resolved value.
 *
 * @param parser
 * @param options
 */
function dereference(parser, options) {
  // console.log('Dereferencing $ref pointers in %s', parser.$refs._root$Ref.path);
  // eslint-disable-next-line no-underscore-dangle
  const result = crawl(parser.schema, parser.$refs._root$Ref.path, '#', new Set(), parser.$refs, options);
  parser.schema = result.value;
}

const mergeRefObject = (refObject, newObject) => {
  const refKeys = Object.keys(refObject);
  const filteredKeys = refKeys.filter((key) => key !== '$ref' && !(key in newObject));
  const extraKeys = filteredKeys.reduce((acc, key) => {
    acc[key] = refObject[key];
    return acc;
  }, {});
  return { ...newObject, ...extraKeys };
};

/**
 * Recursively crawls the given value, and dereferences any JSON references.
 *
 * @param obj - The value to crawl. If it's not an object or array, it will be ignored.
 * @param globallyUniqueFqdnPath - The full path of `obj`, possibly with a JSON Pointer in the hash
 * @param pathFromTopOfDocument - The path of `obj` from the schema root
 * @param alreadyResolvedObjects - An array of the parent objects that have already been dereferenced
 * @param $refs
 * @param options
 * @returns
 */
function crawl(obj, globallyUniqueFqdnPath, pathFromTopOfDocument, alreadyResolvedObjects, $refs, options) {
  // function crawl(obj: any, path: string, pathFromRoot: string, parents: Set<any>, pathList: Array<string>, $refs: $Refs, options: $RefParserOptions, ) : any {
  if (!obj || typeof obj !== 'object' || ArrayBuffer.isView(obj) || (options && options.dereference && options.dereference.excludedPathMatcher(pathFromTopOfDocument))) {
    return { value: obj, circular: false };
  }

  if (alreadyResolvedObjects.has(obj)) {
    foundCircularReference(globallyUniqueFqdnPath, $refs, options);
    return { value: obj, circular: true };
  }

  // If it is a $ref
  if ($Ref.isAllowed$Ref(obj, options)) {
    const $refPath = resolve(globallyUniqueFqdnPath, obj.$ref);

    let pointer;
    try {
      // eslint-disable-next-line no-underscore-dangle
      pointer = $refs._resolve($refPath, globallyUniqueFqdnPath, options);
    } catch (error) {
      if (error.code === "EUNKNOWN" || error.code === "EPARSER" || error.code === "EUNMATCHEDPARSER" || error.code === "ERESOLVER"
        || error.code === "EUNMATCHEDRESOLVER" || error.code === "EMISSINGPOINTER" || error.code === "EINVALIDPOINTER") {
        const resolutionError = new Error(`${obj.$ref} is not a valid $ref - ${error.message} - ${error.code}`);
        resolutionError.code = 'InvalidRef';
        throw resolutionError;
      }

      const resolutionError = new Error(`Failed to resolve $ref: ${obj.$ref} - ${error.message} - ${error.code}`);
      resolutionError.code = 'InvalidRef';
      throw resolutionError;
    }
    if (!pointer) {
      return { value: null };
    }

    // Merge the title into the object, we need to update the object, so that the update propagates forward and also ends up in the cache
    obj.title = obj.title || obj.$ref.split('/').slice(-1)[0];

    // Dereference the JSON reference
    const dereferencedValue = mergeRefObject(obj, $Ref.dereference(obj, pointer.value));

    if (pointer.circular) {
      // The pointer is a DIRECT circular reference (i.e. it references itself).
      // So replace the $ref path with the absolute path from the JSON Schema root
      dereferencedValue.$ref = pathFromTopOfDocument;

      foundCircularReference(globallyUniqueFqdnPath, $refs, options);
      return { value: dereferencedValue, circular: true };
    }

    if (options.dereference.onDereference) {
      options.dereference.onDereference(pathFromTopOfDocument, dereferencedValue);
    }

    const result = crawl(dereferencedValue, pointer.path, pathFromTopOfDocument, new Set(alreadyResolvedObjects).add(obj), $refs, options);
    if (result.circular && options && options.dereference && options.dereference.circular && options.dereference.circular === 'ignore') {
      return {
        circular: false,
        value: {
          ...obj,
          circularReference: { $ref: obj.$ref, name: obj.$ref.split('/').slice(-1)[0] },
        },
      };
    }
    return result;
  }

  // If it is an Array
  if (Array.isArray(obj)) {
    let circular;
    const arrayResult = [];
    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const arrayIndex in obj) {
      const keyPath = Pointer.join(globallyUniqueFqdnPath, arrayIndex);
      const keyPathFromRoot = Pointer.join(pathFromTopOfDocument, arrayIndex);

      const result = crawl(obj[arrayIndex], keyPath, keyPathFromRoot, new Set(alreadyResolvedObjects).add(obj), $refs, options);
      circular = circular || result.circular;
      arrayResult.push(result.value);
    }
    return { value: arrayResult, circular };
  }

  // Otherwise it is an object
  let circular;
  // eslint-disable-next-line no-restricted-syntax
  for (const key of Object.keys(obj)) {
    const keyPath = Pointer.join(globallyUniqueFqdnPath, key);
    const keyPathFromRoot = Pointer.join(pathFromTopOfDocument, key);

    const result = crawl(obj[key], keyPath, keyPathFromRoot, new Set(alreadyResolvedObjects).add(obj), $refs, options);
    circular = circular || result.circular;
    obj[key] = result.value;
  }
  return { value: obj, circular };
}

/**
 * Called when a circular reference is found.
 * It sets the {@link $Refs#circular} flag, and throws an error if options.dereference.circular is false.
 *
 * @param keyPath - The JSON Reference path of the circular reference
 * @param $refs
 * @param options
 * @returns - always returns true, to indicate that a circular reference was found
 */
// function foundCircularReference(keyPath: string | undefined, $refs: any, options: $RefParserOptions) {
function foundCircularReference(keyPath, $refs, options) {
  $refs.circular = true;
  if (options.dereference && !options.dereference.circular) {
    throw Error(`Circular $ref pointer found at ${keyPath}`);
  }
  return true;
}
