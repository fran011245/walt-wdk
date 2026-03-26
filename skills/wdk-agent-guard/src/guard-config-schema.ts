/**
 * JSON Schema subset for ~/.walt-wdk/config.json `guard` section.
 */
export const guardConfigSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  additionalProperties: true,
  properties: {
    enabled: {
      type: 'boolean',
    },
    dailyLimit: {
      type: 'object',
      additionalProperties: false,
      properties: {
        amount: {
          type: 'string',
          pattern: '^[0-9]+(\\.[0-9]+)?$',
        },
        currency: {
          type: 'string',
          enum: ['USDT', 'USDC'],
        },
      },
      required: ['amount', 'currency'],
    },
    perTransactionLimit: {
      type: 'object',
      additionalProperties: false,
      properties: {
        amount: {
          type: 'string',
          pattern: '^[0-9]+(\\.[0-9]+)?$',
        },
        currency: {
          type: 'string',
          enum: ['USDT', 'USDC'],
        },
      },
      required: ['amount', 'currency'],
    },
    requireApproval: {
      type: 'object',
      additionalProperties: false,
      properties: {
        overAmount: {
          type: 'string',
          pattern: '^[0-9]+(\\.[0-9]+)?$',
        },
        notifyVia: {
          type: 'string',
          enum: ['telegram', 'email', 'discord'],
        },
        timeout: {
          type: 'string',
        },
        approvalChannel: {
          type: 'string',
          enum: ['file', 'console'],
        },
      },
      required: ['overAmount'],
    },
    whitelist: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          address: {
            type: 'string',
            minLength: 1,
          },
          name: {
            type: 'string',
          },
          skipApproval: {
            type: 'boolean',
          },
        },
        required: ['address'],
      },
    },
    blacklist: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1,
      },
    },
  },
} as const;
