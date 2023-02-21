import { promises as fs } from 'fs';
import jsYaml from 'js-yaml';

import OpenApiResolver from '../../src/index.js';

test('should resolve description overrides correctly', async () => {
  const testDoc = jsYaml.load(await fs.readFile(__filename.replace('.test.js', '.yaml'), 'utf8'));

  const schema = await OpenApiResolver.resolve(testDoc);
  expect(schema).toEqual({
    components: {
      schemas: {
        'pattern-four': {
          description: 'This is pattern four',
          pattern: 'four',
          type: 'string',
        },
        'pattern-one': {
          description: 'This is pattern one',
          pattern: 'one',
          type: 'string',
        },
        'pattern-three': {
          description: 'This is pattern three',
          pattern: 'three',
          type: 'string',
        },
        'pattern-two': {
          description: 'This is pattern two',
          pattern: 'two',
          type: 'string',
        },
      },
    },
    info: {
      title: 'Tests of combining references with descriptions',
    },
    openapi: '3.1.0',
    paths: {
      '/example/': {
        get: {
          operationId: 'Example',
          responses: {
            200: {
              content: {
                'application/json': {
                  schema: {
                    properties: {
                      nested: {
                        properties: {
                          deeper: {
                            properties: {
                              'double-nested-four-custom': {
                                description: 'Double nested custom description using pattern four',
                                pattern: 'four',
                                type: 'string',
                              },
                              'double-nested-one-default': {
                                description: 'This is pattern one',
                                pattern: 'one',
                                type: 'string',
                              },
                              'double-nested-three-custom': {
                                description: 'Double nested custom description using pattern three',
                                pattern: 'three',
                                type: 'string',
                              },
                              'double-nested-two-custom': {
                                description: 'Double nested custom description using pattern two',
                                pattern: 'two',
                                type: 'string',
                              },
                            },
                            type: 'object',
                          },
                          'nested-four-default': {
                            description: 'This is pattern four',
                            pattern: 'four',
                            type: 'string',
                          },
                          'nested-one-custom': {
                            description: 'Nested custom description using pattern one',
                            pattern: 'one',
                            type: 'string',
                          },
                          'nested-three-default': {
                            description: 'This is pattern three',
                            pattern: 'three',
                            type: 'string',
                          },
                          'nested-two-custom': {
                            description: 'Nested custom description using pattern two',
                            pattern: 'two',
                            type: 'string',
                          },
                        },
                        type: 'object',
                      },
                      'one-custom': {
                        description: 'Top-level custom description using pattern one',
                        pattern: 'one',
                        type: 'string',
                      },
                      'three-custom': {
                        description: 'Top-level custom description using pattern three',
                        pattern: 'three',
                        type: 'string',
                      },
                      'two-default': {
                        description: 'This is pattern two',
                        pattern: 'two',
                        type: 'string',
                      },
                    },
                  },
                },
              },
              description: 'OK',
            },
          },
        },
      },
    },
  });
});
