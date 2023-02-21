import jsYaml from 'js-yaml';

import OpenApiResolver from '../../src/index.js';

test('should resolve circular references correctly', async () => {
  const testDoc = jsYaml.load(`openapi: 3.0.1
info:
  title: Test API
  description: Test
  license:
    name: Apache 2.0
    url: http://www.apache.org/licenses/LICENSE-2.0.html
  version: "0.1"
paths:
  /comments:
    get:
      summary: List comments
      responses:
        200:
          description: Successful operation
          content:
            'application/json':
              schema:
                $ref: '#/components/schemas/CommentList'
components:
  schemas:
    CommentList:
      type: array
      items:
        $ref: '#/components/schemas/Comment'
    Comment:
      type: object
      properties:
        author:
          type: string
          example: exampleAuthor
        message:
          $ref: '#/components/schemas/Message'
        replies:
          type: array
          items:
            $ref: '#/components/schemas/Comment'
    Message:
      type: object
      properties:
        text:
          type: string
        linkedMessage:
          $ref: '#/components/schemas/Message'`);

  const expectedResult = {
    components: {
      schemas: {
        Comment: {
          properties: {
            author: { example: 'exampleAuthor', type: 'string' },
            message: {
              properties: {
                linkedMessage: {
                  $ref: '#/components/schemas/Message',
                  circularReference: { $ref: '#/components/schemas/Message', name: 'Message' },
                },
                text: {
                  type: 'string',
                },
              },
              type: 'object',
            },
            replies: {
              items: {
                $ref: '#/components/schemas/Comment',
                circularReference: {
                  $ref: '#/components/schemas/Comment',
                  name: 'Comment',
                },
              },
              type: 'array',
            },
          },
          type: 'object',
        },
        CommentList: {
          items: {
            properties: {
              author: { example: 'exampleAuthor', type: 'string' },
              message: {
                properties: {
                  linkedMessage: {
                    $ref: '#/components/schemas/Message',
                    circularReference: {
                      $ref: '#/components/schemas/Message',
                      name: 'Message',
                    },
                  },
                  text: {
                    type: 'string',
                  },
                },
                type: 'object',
              },
              replies: {
                items: {
                  $ref: '#/components/schemas/Comment',
                  circularReference: {
                    $ref: '#/components/schemas/Comment',
                    name: 'Comment',
                  },
                },
                type: 'array',
              },
            },
            type: 'object',
          },
          type: 'array',
        },
        Message: {
          properties: {
            linkedMessage: {
              $ref: '#/components/schemas/Message',
              circularReference: {
                $ref: '#/components/schemas/Message',
                name: 'Message',
              },
            },
            text: {
              type: 'string',
            },
          },
          type: 'object',
        },
      },
    },
    info: {
      description: 'Test',
      license: {
        name: 'Apache 2.0',
        url: 'http://www.apache.org/licenses/LICENSE-2.0.html',
      },
      title: 'Test API',
      version: '0.1',
    },
    openapi: '3.0.1',
    paths: {
      '/comments': {
        get: {
          responses: {
            200: {
              content: {
                'application/json': {
                  schema: {
                    items: {
                      properties: {
                        author: {
                          example: 'exampleAuthor',
                          type: 'string',
                        },
                        message: {
                          properties: {
                            linkedMessage: {
                              $ref: '#/components/schemas/Message',
                              circularReference: {
                                $ref: '#/components/schemas/Message',
                                name: 'Message',
                              },
                            },
                            text: {
                              type: 'string',
                            },
                          },
                          type: 'object',
                        },
                        replies: {
                          items: {
                            $ref: '#/components/schemas/Comment',
                            circularReference: {
                              $ref: '#/components/schemas/Comment',
                              name: 'Comment',
                            },
                          },
                          type: 'array',
                        },
                      },
                      type: 'object',
                    },
                    type: 'array',
                  },
                },
              },
              description: 'Successful operation',
            },
          },
          summary: 'List comments',
        },
      },
    },
  };

  const schema = await OpenApiResolver.resolve(testDoc);

  expect(schema).toEqual(expectedResult);
});
