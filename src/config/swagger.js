const swaggerUi = require('swagger-ui-express');

const docs = {
  openapi: '3.0.0',
  info: {
    title: 'Cybernauts Network API',
    version: '1.0.0',
    description: 'API for user relationships, hobby networking, and personalized recommendations.',
  },
  servers: [{ url: 'http://localhost:5000/api' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', example: 'john@example.com' },
          hobbies: { type: 'array', items: { type: 'string' } },
        },
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          statusCode: { type: 'number' },
          message: { type: 'string' },
          data: { type: 'object' }
        }
      }
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register User',
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, password: { type: 'string' }, hobbies: { type: 'array', items: { type: 'string' } } } } } } },
        responses: { 201: { description: 'Created' } },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } } } } },
        responses: { 200: { description: 'Success' } },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get Profile',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'List Users',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
        ],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/users/{id}': {
      put: {
        tags: ['Users'],
        summary: 'Update User',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, hobbies: { type: 'array', items: { type: 'string' } } } } } } },
        responses: { 200: { description: 'Success' } },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete User',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/users/{id}/link': {
      post: {
        tags: ['Friendships'],
        summary: 'Link Users',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { targetId: { type: 'string' } } } } } },
        responses: { 200: { description: 'Success' } },
      },
    },
    '/users/{id}/unlink': {
      delete: {
        tags: ['Friendships'],
        summary: 'Unlink Users',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { targetId: { type: 'string' } } } } } },
        responses: { 200: { description: 'Success' } },
      },
    },
    '/users/{id}/recommendations': {
      get: {
        tags: ['Recommendations'],
        summary: 'Get Recommendations',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Success' } },
      },
    },
    '/users/{id}/recommendations/feedback': {
      post: {
        tags: ['Recommendations'],
        summary: 'Record Feedback',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { targetId: { type: 'string' }, targetType: { type: 'string', enum: ['USER', 'HOBBY'] }, action: { type: 'string', enum: ['ACCEPT', 'REJECT', 'DISMISS'] } } } } } },
        responses: { 200: { description: 'Success' } },
      },
    },
    '/graph': {
      get: {
        tags: ['Social Graph'],
        summary: 'Get Network Graph',
        responses: { 200: { description: 'Success' } },
      },
    },
    '/hobbies': {
      get: {
        tags: ['Hobbies'],
        summary: 'Get Hobbies',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }
        ],
        responses: { 200: { description: 'Success' } },
      },
      post: {
        tags: ['Hobbies'],
        summary: 'Create Hobby',
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, category: { type: 'string' } } } } } },
        responses: { 201: { description: 'Created' } },
      },
    },
  },
};

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(docs, {
    swaggerOptions: { 
      persistAuthorization: true,
      requestInterceptor: (req) => { req.credentials = 'include'; return req; }
    }
  }));
};

module.exports = setupSwagger;
