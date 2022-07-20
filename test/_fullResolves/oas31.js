import $RefParser from '@apidevtools/json-schema-ref-parser';
import path from 'path';
import { promises as fs } from 'fs';
import jsYaml from 'js-yaml';

// import Swagger from '../../src/index.js';

test.only('should resolve description overrides correctly', async () => {
  // const testDoc = jsYaml.load(await fs.readFile(path.join(__dirname, 'oas31.yaml'), 'utf8'));
  const testDoc = jsYaml.load(await fs.readFile(path.join(__dirname, 'oas31.yaml'), 'utf8'));
  // const res = await Swagger.resolve({ spec: testDoc, allowMetaPatches: false });

  const schema = await $RefParser.dereference(testDoc);

  expect(schema).toEqual({
    openapi: '3.2.0',
    info: {
      version: '1.0.0',
      title: 'Example.com',
      termsOfService: 'https://example.com/terms/',
      contact: {
        email: 'contact@example.com',
        url: 'http://example.com/contact',
      },
      license: {
        name: 'Apache 2.0',
        url: 'http://www.apache.org/licenses/LICENSE-2.0.html',
      },
      description:
        'This is an **example** API to demonstrate features of the OpenAPI\nspecification.\n',
    },
    servers: [
      {
        url: 'https://example.com/api/v1',
      },
    ],
    paths: {
      '/users': {
        parameters: [
          {
            name: 'userId',
            in: 'path',
            description: 'The user identifier.',
            required: true,
            schema: {
              type: 'int',
            },
          },
        ],

        post: {
          summary: 'user',
          description: 'User.',
          operationId: 'createUser',
          responses: {
            200: {
              description: 'OK',
            },
          },
          requestBody: {
            description: 'Updated user object',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  description: 'Names and Numbers (specific)',
                  properties: {
                    names: {
                      type: 'object',
                      description: 'names description',
                      properties: {
                        oneName: {
                          type: 'string',
                          description: 'One name (specific).',
                        },
                        otherName: {
                          type: 'string',
                          description: 'Other name (specific).',
                        },
                      },
                    },
                    numbers: {
                      type: 'object',
                      description: 'numbers description',
                      properties: {
                        oneNumber: {
                          type: 'integer',
                          description: 'One number (specific)',
                        },
                        otherNumber: {
                          type: 'integer',
                          description: 'Other number (specific)',
                        },
                      },
                    },
                  },
                },
              },
            },
            required: true,
          },
        },
      },
    },
    components: {
      schemas: {
        Name: {
          type: 'string',
          description: 'Generic Name.',
        },
        Number: {
          type: 'integer',
        },
        Names: {
          type: 'object',
          description: 'names description',
          properties: {
            oneName: {
              type: 'string',
              description: 'One name (specific).',
            },
            otherName: {
              type: 'string',
              description: 'Other name (specific).',
            },
          },
        },
        Numbers: {
          type: 'object',
          description: 'numbers description',
          properties: {
            oneNumber: {
              type: 'integer',
              description: 'One number (specific)',
            },
            otherNumber: {
              type: 'integer',
              description: 'Other number (specific)',
            },
          },
        },
        NamesAndNumbers: {
          type: 'object',
          description: 'names and numbers description',
          properties: {
            names: {
              type: 'object',
              description: 'names description',
              properties: {
                oneName: {
                  type: 'string',
                  description: 'One name (specific).',
                },
                otherName: {
                  type: 'string',
                  description: 'Other name (specific).',
                },
              },
            },
            numbers: {
              type: 'object',
              description: 'numbers description',
              properties: {
                oneNumber: {
                  type: 'integer',
                  description: 'One number (specific)',
                },
                otherNumber: {
                  type: 'integer',
                  description: 'Other number (specific)',
                },
              },
            },
          },
        },
      },
    },
  });
});
