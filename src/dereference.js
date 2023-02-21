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
  const result = crawl(parser.schema, parser.$refs._root$Ref.path, '#', new Set(), [], parser.$refs, options);
  parser.schema = result.value;
}

const mergeRefObject = (refObject, newObject) => {
  const refKeys = Object.keys(refObject);
  if (refKeys.length < 2) {
    return newObject;
  }

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
 * @param path - The full path of `obj`, possibly with a JSON Pointer in the hash
 * @param pathFromRoot - The path of `obj` from the schema root
 * @param parents - An array of the parent objects that have already been dereferenced
 * @param {array<string>} pathList - An array of the list of parents reference points for error handling
 * @param $refs
 * @param options
 * @returns
 */
function crawl(obj, path, pathFromRoot, parents, pathList, $refs, options) {
  // function crawl(obj: any, path: string, pathFromRoot: string, parents: Set<any>, pathList: Array<string>, $refs: $Refs, options: $RefParserOptions, ) : any {
  // @ts-ignore TS2722
  if (!obj || Array.isArray(obj) || typeof obj !== 'object' || ArrayBuffer.isView(obj) || (options && options.dereference && options.dereference.excludedPathMatcher(pathFromRoot))) {
    return { value: obj, circular: false };
  }

  if (parents.has(obj)) {
    foundCircularReference(pathList.pop(), $refs, options);
    return { value: obj, circular: true };
  }

  if ($Ref.isAllowed$Ref(obj, options)) {
    const $refObject = obj;
    const $refPath = resolve(path, $refObject.$ref);

    // eslint-disable-next-line no-underscore-dangle
    const pointer = $refs._resolve($refPath, path, options);
    if (!pointer) {
      return { value: null };
    }

    // Dereference the JSON reference
    const dereferencedValue = mergeRefObject($refObject, $Ref.dereference($refObject, pointer.value));

    if (pointer.circular) {
      // The pointer is a DIRECT circular reference (i.e. it references itself).
      // So replace the $ref path with the absolute path from the JSON Schema root
      dereferencedValue.$ref = pathFromRoot;

      foundCircularReference(path, $refs, options);
      return { value: dereferencedValue, circular: true };
    }

    if (options.dereference.onDereference) {
      options.dereference.onDereference(pathFromRoot, dereferencedValue);
    }

    const result = crawl(dereferencedValue, pointer.path, pathFromRoot, new Set(parents).add(obj), pathList.concat(path), $refs, options);
    if (result.circular && options && options.dereference && options.dereference.circular && options.dereference.circular === 'ignore') {
      return {
        circular: false,
        value: {
          ...$refObject,
          circularReference: { $ref: $refObject.$ref, name: $refObject.$ref.split('/').slice(-1)[0] },
        },
      };
    }
    return result;
  }

  let circular;
  const keys = Object.keys(obj);
  // eslint-disable-next-line no-restricted-syntax
  for (const key of keys) {
    const keyPath = Pointer.join(path, key);
    const keyPathFromRoot = Pointer.join(pathFromRoot, key);

    const result = crawl(obj[key], keyPath, keyPathFromRoot, new Set(parents).add(obj), pathList.concat(path), $refs, options);
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
