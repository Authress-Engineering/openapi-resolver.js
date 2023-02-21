import $Refs from '@apidevtools/json-schema-ref-parser/lib/refs.js';
import _parse from '@apidevtools/json-schema-ref-parser/lib/parse.js';
import normalizeArgs from '@apidevtools/json-schema-ref-parser/lib/normalize-args.js';
import resolveExternal from '@apidevtools/json-schema-ref-parser/lib/resolve-external.js';
import * as url from '@apidevtools/json-schema-ref-parser/lib/util/url.js';
import {
  JSONParserError,
  InvalidPointerError,
  MissingPointerError,
  ResolverError,
  ParserError,
  UnmatchedParserError,
  UnmatchedResolverError,
  isHandledError,
  JSONParserErrorGroup,
} from '@apidevtools/json-schema-ref-parser/lib/util/errors.js';

import _dereference from './dereference.js';
// import type { ParserOptions } from "./options.js";
// import type { $RefsCallback, JSONSchema, SchemaCallback } from "./types/index.js";

export { JSONParserError };
export { InvalidPointerError };
export { MissingPointerError };
export { ResolverError };
export { ParserError };
export { UnmatchedParserError };
export { UnmatchedResolverError };

// type RefParserSchema = string | JSONSchema;

/**
 * This class parses a JSON schema, builds a map of its JSON references and their resolved values,
 * and provides methods for traversing, manipulating, and dereferencing those references.
 *
 * @class
 */
export class $RefParser {
  /**
   * The parsed (and possibly dereferenced) JSON schema object
   *
   * @type {object}
   * @readonly
   */
  // public schema: JSONSchema | null = null;

  /**
   * The resolved JSON references
   *
   * @type {$Refs}
   * @readonly
   */
  // $refs = new $Refs();

  /**
   * Parses the given JSON schema.
   * This method does not resolve any JSON references.
   * It just reads a single file in JSON or YAML format, and parse it as a JavaScript object.
   *
   * @param [path] - The file path or URL of the JSON schema
   * @param [schema] - A JSON schema object. This object will be used instead of reading from `path`.
   * @param [options] - Options that determine how the schema is parsed
   * @param [callback] - An error-first callback. The second parameter is the parsed JSON schema object.
   * @returns - The returned promise resolves with the parsed JSON schema object.
   */
  // public parse(
  //   baseUrl: string,
  //   schema: RefParserSchema,
  //   options: ParserOptions,
  //   callback: SchemaCallback,
  // ): Promise<void>;
  // public parse(baseUrl, schema, options, callback)

  async parse() {
    const args = normalizeArgs(arguments);
    let promise;

    if (!args.path && !args.schema) {
      const err = ono(`Expected a file path, URL, or object. Got ${args.path || args.schema}`);
      return maybe(args.callback, Promise.reject(err));
    }

    // Reset everything
    this.schema = null;
    this.$refs = new $Refs();

    // If the path is a filesystem path, then convert it to a URL.
    // NOTE: According to the JSON Reference spec, these should already be URLs,
    // but, in practice, many people use local filesystem paths instead.
    // So we're being generous here and doing the conversion automatically.
    // This is not intended to be a 100% bulletproof solution.
    // If it doesn't work for your use-case, then use a URL instead.
    let pathType = 'http';
    if (url.isFileSystemPath(args.path)) {
      args.path = url.fromFileSystemPath(args.path);
      pathType = 'file';
    }

    // Resolve the absolute path of the schema
    args.path = url.resolve(url.cwd(), args.path);

    if (args.schema && typeof args.schema === 'object') {
      // A schema object was passed-in.
      // So immediately add a new $Ref with the schema object as its value
      const $ref = this.$refs._add(args.path);
      $ref.value = args.schema;
      $ref.pathType = pathType;
      promise = Promise.resolve(args.schema);
    } else {
      // Parse the schema file/url
      promise = _parse(args.path, this.$refs, args.options);
    }

    try {
      const result = await promise;

      if (result !== null && typeof result === 'object' && !Buffer.isBuffer(result)) {
        this.schema = result;
        return maybe(args.callback, Promise.resolve(this.schema));
      }
      if (args.options.continueOnError) {
        this.schema = null; // it's already set to null at line 79, but let's set it again for the sake of readability
        return maybe(args.callback, Promise.resolve(this.schema));
      }
      throw ono.syntax(`"${this.$refs._root$Ref.path || result}" is not a valid JSON Schema`);
    } catch (err) {
      if (!args.options.continueOnError || !isHandledError(err)) {
        return maybe(args.callback, Promise.reject(err));
      }

      if (this.$refs._$refs[url.stripHash(args.path)]) {
        this.$refs._$refs[url.stripHash(args.path)].addError(err);
      }

      return maybe(args.callback, Promise.resolve(null));
    }
  }

  /**
   * *This method is used internally by other methods, such as `bundle` and `dereference`. You probably won't need to call this method yourself.*
   *
   * Resolves all JSON references (`$ref` pointers) in the given JSON Schema file. If it references any other files/URLs, then they will be downloaded and resolved as well. This method **does not** dereference anything. It simply gives you a `$Refs` object, which is a map of all the resolved references and their values.
   *
   * See https://apitools.dev/json-schema-ref-parser/docs/ref-parser.html#resolveschema-options-callback
   *
   * @param schema A JSON Schema object, or the file path or URL of a JSON Schema file. See the `parse` method for more info.
   * @param options (optional)
   */
  // public resolve(baseUrl: string, schema: RefParserSchema, options: ParserOptions): Promise<void>;
  /**
   * Parses the given JSON schema and resolves any JSON references, including references in
   * externally-referenced files.
   *
   * @param [path] - The file path or URL of the JSON schema
   * @param [schema] - A JSON schema object. This object will be used instead of reading from `path`.
   * @param [options] - Options that determine how the schema is parsed and resolved
   * @param [callback]
   * - An error-first callback. The second parameter is a {@link $Refs} object containing the resolved JSON references
   *
   * @returns
   * The returned promise resolves with a {@link $Refs} object containing the resolved JSON references
   */
  async resolve() {
    const args = normalizeArgs(arguments);

    try {
      await this.parse(args.path, args.schema, args.options);
      await resolveExternal(this, args.options);
      finalize(this);
      return maybe(args.callback, Promise.resolve(this.$refs));
    } catch (err) {
      return maybe(args.callback, Promise.reject(err));
    }
  }

  /**
   * Parses the given JSON schema, resolves any JSON references, and dereferences the JSON schema.
   * That is, all JSON references are replaced with their resolved values.
   *
   * @param [path] - The file path or URL of the JSON schema
   * @param [schema] - A JSON schema object. This object will be used instead of reading from `path`.
   * @param [options] - Options that determine how the schema is parsed, resolved, and dereferenced
   * @param [callback] - An error-first callback. The second parameter is the dereferenced JSON schema object
   * @returns - The returned promise resolves with the dereferenced JSON schema object.
   */
  /**
   * Dereferences all `$ref` pointers in the JSON Schema, replacing each reference with its resolved value. This results in a schema object that does not contain any `$ref` pointers. Instead, it's a normal JavaScript object tree that can easily be crawled and used just like any other JavaScript object. This is great for programmatic usage, especially when using tools that don't understand JSON references.
   *
   * The dereference method maintains object reference equality, meaning that all `$ref` pointers that point to the same object will be replaced with references to the same object. Again, this is great for programmatic usage, but it does introduce the risk of circular references, so be careful if you intend to serialize the schema using `JSON.stringify()`. Consider using the bundle method instead, which does not create circular references.
   *
   * See https://apitools.dev/json-schema-ref-parser/docs/ref-parser.html#dereferenceschema-options-callback
   *
   * @param schema A JSON Schema object, or the file path or URL of a JSON Schema file. See the `parse` method for more info.
   * @param options (optional)
   */
  // public dereference(baseUrl: string, schema: RefParserSchema): Promise<JSONSchema>;
  // public dereference(schema: RefParserSchema, options: ParserOptions): Promise<JSONSchema>;
  async dereference() {
    // eslint-disable-next-line prefer-rest-params
    const args = normalizeArgs(arguments);

    try {
      await this.resolve(args.path, args.schema, args.options);
      _dereference(this, args.options);
      finalize(this);
      return maybe(args.callback, Promise.resolve(this.schema));
    } catch (err) {
      return maybe(args.callback, Promise.reject(err));
    }
  }
}
export default $RefParser;

function finalize(parser) {
  const errors = JSONParserErrorGroup.getParserErrors(parser);
  if (errors.length > 0) {
    throw new JSONParserErrorGroup(parser);
  }
}

function maybe(result) {
  return result;
}
