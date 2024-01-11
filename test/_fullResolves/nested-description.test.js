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
                        title: 'pattern-one',
                        description: 'Top-level custom description using pattern one',
                        type: 'string',
                        pattern: 'one',
                      },
                      'two-default': {
                        title: 'pattern-two',
                        type: 'string',
                        pattern: 'two',
                        description: 'This is pattern two',
                      },
                      'three-custom': {
                        title: 'pattern-three',
                        description: 'Top-level custom description using pattern three',
                        type: 'string',
                        pattern: 'three',
                      },
                      nested: {
                        type: 'object',
                        properties: {
                          'nested-one-custom': {
                            title: 'pattern-one',
                            description: 'Nested custom description using pattern one',
                            type: 'string',
                            pattern: 'one',
                          },
                          'nested-two-custom': {
                            title: 'pattern-two',
                            type: 'string',
                            pattern: 'two',
                            description: 'Nested custom description using pattern two',
                          },
                          'nested-three-default': {
                            title: 'pattern-three',
                            type: 'string',
                            pattern: 'three',
                            description: 'This is pattern three',
                          },
                          'nested-four-default': {
                            title: 'pattern-four',
                            type: 'string',
                            pattern: 'four',
                            description: 'This is pattern four',
                          },
                          deeper: {
                            type: 'object',
                            properties: {
                              'double-nested-one-default': {
                                title: 'pattern-one',
                                type: 'string',
                                pattern: 'one',
                                description: 'This is pattern one',
                              },
                              'double-nested-two-custom': {
                                title: 'pattern-two',
                                type: 'string',
                                pattern: 'two',
                                description: 'Double nested custom description using pattern two',
                              },
                              'double-nested-three-custom': {
                                title: 'pattern-three',
                                type: 'string',
                                pattern: 'three',
                                description: 'Double nested custom description using pattern three',
                              },
                              'double-nested-four-custom': {
                                title: 'pattern-four',
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
