import path from 'path';
import { promises as fs } from 'fs';
import jsYaml from 'js-yaml';

import OpenApiResolver from '../../src/index.js';

test('should resolve description overrides correctly', async () => {
  const testDoc = jsYaml.load(await fs.readFile(path.join(__dirname, 'nested-description.yaml'), 'utf8'));

  const schema = await OpenApiResolver.resolve(testDoc);

  expect(schema).toEqual({
    openapi: '3.1.0',
    info: {
      title: 'Tests of combining references with descriptions',
    },
    paths: {
      '/example/': {
        get: {
          operationId: 'Example',
          responses: {
            200: {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {
                    properties: {
                      'one-custom': {
                        description: 'Top-level custom description using pattern one',
                        type: 'string',
                        pattern: 'one',
                      },
                      'two-default': {
                        type: 'string',
                        pattern: 'two',
                        description: 'This is pattern two',
                      },
                      'three-custom': {
                        description: 'Top-level custom description using pattern three',
                        type: 'string',
                        pattern: 'three',
                      },
                      nested: {
                        type: 'object',
                        properties: {
                          'nested-one-custom': {
                            description: 'Nested custom description using pattern one',
                            type: 'string',
                            pattern: 'one',
                          },
                          'nested-two-custom': {
                            type: 'string',
                            pattern: 'two',
                            description: 'Nested custom description using pattern two',
                          },
                          'nested-three-default': {
                            type: 'string',
                            pattern: 'three',
                            description: 'This is pattern three',
                          },
                          'nested-four-default': {
                            type: 'string',
                            pattern: 'four',
                            description: 'This is pattern four',
                          },
                          deeper: {
                            type: 'object',
                            properties: {
                              'double-nested-one-default': {
                                type: 'string',
                                pattern: 'one',
                                description: 'This is pattern one',
                              },
                              'double-nested-two-custom': {
                                type: 'string',
                                pattern: 'two',
                                description: 'Double nested custom description using pattern two',
                              },
                              'double-nested-three-custom': {
                                type: 'string',
                                pattern: 'three',
                                description: 'Double nested custom description using pattern three',
                              },
                              'double-nested-four-custom': {
                                type: 'string',
                                pattern: 'four',
                                description: 'Double nested custom description using pattern four',
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        'pattern-one': {
          type: 'string',
          pattern: 'one',
          description: 'This is pattern one',
        },
        'pattern-two': {
          type: 'string',
          pattern: 'two',
          description: 'This is pattern two',
        },
        'pattern-three': {
          type: 'string',
          pattern: 'three',
          description: 'This is pattern three',
        },
        'pattern-four': {
          type: 'string',
          pattern: 'four',
          description: 'This is pattern four',
        },
      },
    },
  });
});
