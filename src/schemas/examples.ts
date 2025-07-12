import { JSONSchema } from '../types';

export const userSchema: JSONSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'integer',
      minimum: 1,
      maximum: 10000,
    },
    firstName: {
      type: 'string',
      faker: 'name.firstName',
    },
    lastName: {
      type: 'string',
      faker: 'name.lastName',
    },
    email: {
      type: 'string',
      format: 'email',
    },
    age: {
      type: 'integer',
      minimum: 18,
      maximum: 80,
    },
    address: {
      type: 'object',
      properties: {
        street: {
          type: 'string',
          faker: 'address.streetAddress',
        },
        city: {
          type: 'string',
          faker: 'address.city',
        },
        country: {
          type: 'string',
          faker: 'address.country',
        },
        zipCode: {
          type: 'string',
          faker: 'address.zipCode',
        },
      },
    },
    phoneNumber: {
      type: 'string',
      faker: 'phone.phoneNumber',
    },
    isActive: {
      type: 'boolean',
    },
    tags: {
      type: 'array',
      items: {
        type: 'string',
        faker: 'lorem.word',
      },
    },
    role: {
      type: 'string',
      enum: ['admin', 'user', 'moderator', 'guest'],
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
    },
  },
  required: ['id', 'firstName', 'lastName', 'email'],
};

export const productSchema: JSONSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      faker: 'datatype.uuid',
    },
    name: {
      type: 'string',
      faker: 'commerce.productName',
    },
    description: {
      type: 'string',
      faker: 'commerce.productDescription',
    },
    price: {
      type: 'number',
      minimum: 1,
      maximum: 1000,
    },
    category: {
      type: 'string',
      enum: ['electronics', 'clothing', 'books', 'home', 'sports'],
    },
    inStock: {
      type: 'boolean',
    },
    rating: {
      type: 'number',
      minimum: 1,
      maximum: 5,
    },
    reviews: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          userId: {
            type: 'integer',
            minimum: 1,
            maximum: 1000,
          },
          comment: {
            type: 'string',
            faker: 'lorem.sentence',
          },
          rating: {
            type: 'integer',
            minimum: 1,
            maximum: 5,
          },
        },
      },
    },
  },
  required: ['id', 'name', 'price', 'category'],
};

export const orderSchema: JSONSchema = {
  type: 'object',
  properties: {
    orderId: {
      type: 'string',
      faker: 'datatype.uuid',
    },
    customerId: {
      type: 'integer',
      minimum: 1,
      maximum: 10000,
    },
    orderDate: {
      type: 'string',
      format: 'date-time',
    },
    status: {
      type: 'string',
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          productId: {
            type: 'string',
            faker: 'datatype.uuid',
          },
          quantity: {
            type: 'integer',
            minimum: 1,
            maximum: 10,
          },
          price: {
            type: 'number',
            minimum: 1,
            maximum: 500,
          },
        },
      },
    },
    totalAmount: {
      type: 'number',
      minimum: 1,
      maximum: 5000,
    },
    shippingAddress: {
      type: 'object',
      properties: {
        street: {
          type: 'string',
          faker: 'address.streetAddress',
        },
        city: {
          type: 'string',
          faker: 'address.city',
        },
        state: {
          type: 'string',
          faker: 'address.state',
        },
        zipCode: {
          type: 'string',
          faker: 'address.zipCode',
        },
        country: {
          type: 'string',
          faker: 'address.country',
        },
      },
    },
  },
  required: ['orderId', 'customerId', 'orderDate', 'status', 'totalAmount'],
};
