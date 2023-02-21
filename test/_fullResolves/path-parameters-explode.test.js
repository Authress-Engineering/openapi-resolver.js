import { promises as fs } from 'fs';
import jsYaml from 'js-yaml';

import OpenApiResolver from '../../src/index.js';

test('should resolve description overrides correctly', async () => {
  const testDoc = jsYaml.load(await fs.readFile(__filename.replace('.test.js', '.yaml'), 'utf8'));

  const schema = await OpenApiResolver.resolve(testDoc);
  expect(schema).toEqual({
    components: {
      schemas: {
        ApiKey: {
          properties: {
            key: {
              type: 'string',
            },
          },
          type: 'object',
        },
        LoginRequest: {
          properties: {
            id: {
              type: 'string',
            },
            idPresent: {
              type: 'boolean',
            },
            passwordPresent: {
              type: 'boolean',
            },
            secret: {
              type: 'string',
            },
          },
          type: 'object',
        },
      },
    },
    info: {
      title: 'Title',
      version: 'Version',
    },
    openapi: '3.0.1',
    paths: {
      '/api/{ver}/login': {
        post: {
          description: 'Allow a user to login with a valid id and secret.',
          operationId: 'login_1',
          parameters: [
            {
              description: 'The version of the endpoint',
              example: 'v2',
              in: 'path',
              name: 'ver',
              required: true,
              schema: {
                type: 'string',
              },
            },
            {
              in: 'header',
              name: 'Realm',
              required: true,
              schema: {
                type: 'string',
              },
            },
            {
              explode: true,
              in: 'header',
              name: 'x-api-key',
              schema: {
                properties: {
                  key: {
                    type: 'string',
                  },
                },
                type: 'object',
              },
            },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  properties: {
                    id: {
                      type: 'string',
                    },
                    idPresent: {
                      type: 'boolean',
                    },
                    passwordPresent: {
                      type: 'boolean',
                    },
                    secret: {
                      type: 'string',
                    },
                  },
                  type: 'object',
                },
              },
            },
            required: true,
          },
          responses: {
            201: {
              description: 'A user was successfully authenticated.',
            },
            404: {
              description: 'A user failed to login.',
            },
          },
          summary: 'Login with secret',
          tags: ['User'],
        },
      },
    },
  });
});
