import swaggerJSDoc from 'swagger-jsdoc';
import { env } from './env';

type OperationOptions = {
  protected?: boolean;
  refreshCookie?: boolean;
  created?: boolean;
  body?: Record<string, unknown>;
  parameters?: Record<string, unknown>[];
};

const authenticated = [{ bearerAuth: [] }, { cookieAuth: [] }];
const idParameter = {
  name: 'id', in: 'path', required: true,
  schema: { type: 'string', format: 'uuid' },
};
const jsonBody = (schema: Record<string, unknown>) => ({
  required: true,
  content: { 'application/json': { schema } },
});
const operation = (tag: string, summary: string, options: OperationOptions = {}) => ({
  tags: [tag],
  summary,
  ...(options.protected ? { security: authenticated } : {}),
  ...(options.refreshCookie ? { security: [{ refreshCookie: [] }] } : {}),
  ...(options.body ? { requestBody: jsonBody(options.body) } : {}),
  ...(options.parameters ? { parameters: options.parameters } : {}),
  responses: {
    [options.created ? 201 : 200]: { description: options.created ? 'Created successfully' : 'Successful response' },
    400: { description: 'Validation error' },
    401: { description: 'Authentication required or token expired' },
    403: { description: 'Insufficient permissions' },
    404: { description: 'Resource not found' },
    429: { description: 'Rate limit exceeded' },
  },
});

const emailBody = {
  type: 'object', required: ['email'],
  properties: { email: { type: 'string', format: 'email' } },
};
const serviceBody = {
  type: 'object', required: ['title', 'description'],
  properties: {
    title: { type: 'string', minLength: 2, maxLength: 100 },
    description: { type: 'string', minLength: 10, maxLength: 5000 },
    image: { type: 'string', format: 'uri' },
    isActive: { type: 'boolean' },
  },
};
const paginationParameters = [
  { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
  { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
  { name: 'search', in: 'query', schema: { type: 'string' } },
];

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Monta Foam API',
      version: '1.0.0',
      description: 'REST API for the Monta Foam services and administration platform.',
    },
    servers: [{ url: `${env.API_URL}/api/v1`, description: `${env.NODE_ENV} server` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        cookieAuth: { type: 'apiKey', in: 'cookie', name: 'accessToken' },
        refreshCookie: { type: 'apiKey', in: 'cookie', name: 'refreshToken' },
      },
      schemas: {
        Error: {
          type: 'object', required: ['success', 'message'],
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            code: { type: 'string', nullable: true },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' }, fullName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['MASTER_ADMIN', 'ADMIN', 'USER'] },
            isVerified: { type: 'boolean' }, isSuspended: { type: 'boolean' },
          },
        },
        Service: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' }, title: { type: 'string' }, slug: { type: 'string' },
            description: { type: 'string' }, image: { type: 'string', format: 'uri', nullable: true },
            isActive: { type: 'boolean' },
          },
        },
        ServiceRequest: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' }, fullName: { type: 'string' },
            email: { type: 'string', format: 'email' }, phone: { type: 'string' }, notes: { type: 'string' },
            status: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] },
          },
        },
      },
    },
    tags: [
      { name: 'Auth' }, { name: 'Users' }, { name: 'Services' }, { name: 'Requests' },
      { name: 'Notifications' }, { name: 'Analytics' }, { name: 'System' },
    ],
    paths: {
      '/auth/register': { post: operation('Auth', 'Register with email and password', {
        created: true,
        body: {
          type: 'object', required: ['fullName', 'email', 'password'],
          properties: {
            fullName: { type: 'string', minLength: 2 }, email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password', minLength: 8 },
          },
        },
      }) },
      '/auth/verify-email': { post: operation('Auth', 'Verify an email OTP and issue tokens', {
        body: {
          type: 'object', required: ['email', 'code'],
          properties: { email: { type: 'string', format: 'email' }, code: { type: 'string', pattern: '^\\d{6}$' } },
        },
      }) },
      '/auth/resend-otp': { post: operation('Auth', 'Resend an email verification OTP', { body: emailBody }) },
      '/auth/login': { post: operation('Auth', 'Log in with email and password', {
        body: {
          type: 'object', required: ['email', 'password'],
          properties: { email: { type: 'string', format: 'email' }, password: { type: 'string', format: 'password' } },
        },
      }) },
      '/auth/google': { post: operation('Auth', 'Log in or register with a Google ID token', {
        body: { type: 'object', required: ['idToken'], properties: { idToken: { type: 'string' } } },
      }) },
      '/auth/google/start': {
        get: {
          tags: ['Auth'],
          summary: 'Start the server-side Google OAuth flow',
          responses: {
            302: { description: 'Redirect to Google authorization' },
            429: { description: 'Rate limit exceeded' },
            503: { description: 'Google OAuth is not configured' },
          },
        },
      },
      '/auth/google/callback': {
        get: {
          tags: ['Auth'],
          summary: 'Complete Google OAuth and redirect to the frontend',
          parameters: [
            { name: 'code', in: 'query', schema: { type: 'string' } },
            { name: 'state', in: 'query', schema: { type: 'string' } },
            { name: 'error', in: 'query', schema: { type: 'string' } },
          ],
          responses: { 302: { description: 'Redirect to the frontend callback page' } },
        },
      },
      '/auth/refresh': { post: operation('Auth', 'Rotate tokens', { refreshCookie: true }) },
      '/auth/logout': { post: operation('Auth', 'Revoke the current session', { protected: true }) },
      '/auth/forgot-password': { post: operation('Auth', 'Request a password reset OTP', { body: emailBody }) },
      '/auth/reset-password': { post: operation('Auth', 'Reset a password with an OTP', {
        body: {
          type: 'object', required: ['email', 'code', 'newPassword'],
          properties: {
            email: { type: 'string', format: 'email' }, code: { type: 'string', pattern: '^\\d{6}$' },
            newPassword: { type: 'string', format: 'password', minLength: 8 },
          },
        },
      }) },
      '/auth/me': { get: operation('Auth', 'Get the authenticated user', { protected: true }) },
      '/services': {
        get: operation('Services', 'List active services'),
        post: operation('Services', 'Create a service', { protected: true, created: true, body: serviceBody }),
      },
      '/services/admin/all': { get: operation('Services', 'List all services', { protected: true }) },
      '/services/{id}': {
        get: operation('Services', 'Get a service by UUID or slug', { parameters: [idParameter] }),
        patch: operation('Services', 'Update a service', { protected: true, parameters: [idParameter], body: serviceBody }),
        delete: operation('Services', 'Delete a service', { protected: true, parameters: [idParameter] }),
      },
      '/requests': {
        post: operation('Requests', 'Submit a guest or authenticated service request', {
          created: true,
          body: {
            type: 'object', required: ['fullName', 'email', 'phone'],
            properties: {
              fullName: { type: 'string' }, email: { type: 'string', format: 'email' }, phone: { type: 'string' },
              serviceId: { type: 'string', description: 'Service UUID or slug' }, notes: { type: 'string', maxLength: 1000 },
            },
          },
        }),
        get: operation('Requests', 'List service requests', {
          protected: true,
          parameters: [...paginationParameters, {
            name: 'status', in: 'query',
            schema: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] },
          }],
        }),
      },
      '/requests/me': { get: operation('Requests', 'List the current user’s requests', { protected: true }) },
      '/requests/{id}': { get: operation('Requests', 'Get a service request', { protected: true, parameters: [idParameter] }) },
      '/requests/{id}/status': { patch: operation('Requests', 'Update request status', {
        protected: true, parameters: [idParameter],
        body: {
          type: 'object', required: ['status'],
          properties: { status: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] } },
        },
      }) },
      '/users': { get: operation('Users', 'List users', { protected: true, parameters: paginationParameters }) },
      '/users/{id}': {
        get: operation('Users', 'Get a user', { protected: true, parameters: [idParameter] }),
        delete: operation('Users', 'Delete a user (MASTER_ADMIN)', { protected: true, parameters: [idParameter] }),
      },
      '/users/{id}/role': { patch: operation('Users', 'Change a user role (MASTER_ADMIN)', {
        protected: true, parameters: [idParameter],
        body: {
          type: 'object', required: ['role'], properties: { role: { type: 'string', enum: ['ADMIN', 'USER'] } },
        },
      }) },
      '/users/{id}/suspend': { patch: operation('Users', 'Suspend or unsuspend a user', { protected: true, parameters: [idParameter] }) },
      '/notifications': { get: operation('Notifications', 'List current-user notifications', { protected: true, parameters: paginationParameters.slice(0, 2) }) },
      '/notifications/read-all': { patch: operation('Notifications', 'Mark all notifications as read', { protected: true }) },
      '/notifications/{id}/read': { patch: operation('Notifications', 'Mark one notification as read', { protected: true, parameters: [idParameter] }) },
      '/notifications/{id}': { delete: operation('Notifications', 'Delete one notification', { protected: true, parameters: [idParameter] }) },
      '/analytics/stats': { get: operation('Analytics', 'Get dashboard statistics', { protected: true }) },
      '/health': { get: operation('System', 'API health check') },
    },
  },
  apis: [],
});
