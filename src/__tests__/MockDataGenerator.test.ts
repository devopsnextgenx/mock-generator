import { MockDataGenerator } from '../MockDataGenerator';
import { JSONSchema } from '../types';

describe('MockDataGenerator', () => {
  let generator: MockDataGenerator;

  beforeEach(() => {
    generator = new MockDataGenerator({ seed: 12345 });
  });

  describe('generateFromSchema', () => {
    it('should generate the correct number of records', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          name: { type: 'string', faker: 'name.firstName' },
          age: { type: 'integer', minimum: 18, maximum: 65 },
        },
      };

      const result = generator.generateFromSchema(schema, 5);
      expect(result).toHaveLength(5);
    });

    it('should generate string fields correctly', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          name: { type: 'string', faker: 'name.firstName' },
          description: { type: 'string' },
        },
      };

      const result = generator.generateFromSchema(schema, 1);
      const record = result[0];

      expect(typeof record.email).toBe('string');
      expect(record.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(typeof record.name).toBe('string');
      expect(typeof record.description).toBe('string');
    });

    it('should generate number fields correctly', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          age: { type: 'integer', minimum: 18, maximum: 65 },
          price: { type: 'number', minimum: 10.5, maximum: 99.9 },
        },
      };

      const result = generator.generateFromSchema(schema, 1);
      const record = result[0];

      expect(typeof record.age).toBe('number');
      expect(record.age).toBeGreaterThanOrEqual(18);
      expect(record.age).toBeLessThanOrEqual(65);
      expect(Number.isInteger(record.age)).toBe(true);

      expect(typeof record.price).toBe('number');
      expect(record.price).toBeGreaterThanOrEqual(10.5);
      expect(record.price).toBeLessThanOrEqual(99.9);
    });

    it('should generate boolean fields correctly', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          isActive: { type: 'boolean' },
        },
      };

      const result = generator.generateFromSchema(schema, 1);
      const record = result[0];

      expect(typeof record.isActive).toBe('boolean');
    });

    it('should handle enum fields correctly', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['active', 'inactive', 'pending'] },
        },
      };

      const result = generator.generateFromSchema(schema, 10);

      result.forEach((record) => {
        expect(['active', 'inactive', 'pending']).toContain(record.status);
      });
    });

    it('should handle array fields correctly', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            items: { type: 'string', faker: 'lorem.word' },
          },
        },
      };

      const result = generator.generateFromSchema(schema, 1);
      const record = result[0];

      expect(Array.isArray(record.tags)).toBe(true);
      expect(record.tags.length).toBeGreaterThan(0);
      record.tags.forEach((tag: any) => {
        expect(typeof tag).toBe('string');
      });
    });

    it('should handle nested object fields correctly', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          address: {
            type: 'object',
            properties: {
              street: { type: 'string', faker: 'address.streetAddress' },
              city: { type: 'string', faker: 'address.city' },
            },
          },
        },
      };

      const result = generator.generateFromSchema(schema, 1);
      const record = result[0];

      expect(typeof record.address).toBe('object');
      expect(typeof record.address.street).toBe('string');
      expect(typeof record.address.city).toBe('string');
    });

    it('should handle const values correctly', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          version: { type: 'string', const: '1.0.0' },
          type: { type: 'string', const: 'user' },
        },
      };

      const result = generator.generateFromSchema(schema, 3);

      result.forEach((record) => {
        expect(record.version).toBe('1.0.0');
        expect(record.type).toBe('user');
      });
    });

    it('should generate values based on percentage distribution', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          active: {
            type: 'integer',
            enum: [0, 1],
            default: 1,
            percentage: {
              '1': 80,
              '0': 20
            }
          },
          is_deleted: {
            type: 'integer',
            enum: [0, 1],
            default: 0,
            percentage: {
              '0': 90,
              '1': 10
            }
          }
        },
      };

      // Generate a larger sample to test distribution
      const result = generator.generateFromSchema(schema, 100);
      
      const activeCount = result.filter(r => r.active === 1).length;
      const deletedCount = result.filter(r => r.is_deleted === 1).length;

      // Allow some variance in the distribution (within reasonable bounds)
      // For 80%, expect between 65-95% with sample size of 100
      expect(activeCount).toBeGreaterThan(65); 
      expect(activeCount).toBeLessThan(95);
      
      // For 10%, expect between 2-25% with sample size of 100
      expect(deletedCount).toBeGreaterThan(2); 
      expect(deletedCount).toBeLessThan(25);

      // Verify all values are from the enum
      result.forEach(record => {
        expect([0, 1]).toContain(record.active);
        expect([0, 1]).toContain(record.is_deleted);
      });
    });
  });

  describe('generateFromConfig', () => {
    it('should generate data from simple config', () => {
      const config = {
        name: 'name.fullName',
        email: 'internet.email',
        age: 'number.int',
      };

      const result = generator.generateFromConfig(config, 3);

      expect(result).toHaveLength(3);
      result.forEach((record) => {
        expect(typeof record.name).toBe('string');
        expect(typeof record.email).toBe('string');
        expect(typeof record.age).toBe('number');
      });
    });
  });

  describe('exportToFormat', () => {
    const testData = [
      { name: 'John', age: 25, email: 'john@example.com' },
      { name: 'Jane', age: 30, email: 'jane@example.com' },
    ];

    it('should export to JSON format', () => {
      const result = generator.exportToFormat(testData, 'json');
      const parsed = JSON.parse(result);

      expect(parsed).toEqual(testData);
    });

    it('should export to CSV format', () => {
      const result = generator.exportToFormat(testData, 'csv');
      const lines = result.split('\n');

      expect(lines[0]).toBe('name,age,email');
      expect(lines[1]).toBe('"John",25,"john@example.com"');
      expect(lines[2]).toBe('"Jane",30,"jane@example.com"');
    });

    it('should export to TSV format', () => {
      const result = generator.exportToFormat(testData, 'tsv');
      const lines = result.split('\n');

      expect(lines[0]).toBe('name\tage\temail');
      expect(lines[1]).toBe('John\t25\tjohn@example.com');
      expect(lines[2]).toBe('Jane\t30\tjane@example.com');
    });
  });

  describe('sequential number generation', () => {
    it('should generate sequential numbers starting from specified value', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            sequential: {
              start: 100,
              step: 1,
              counterName: 'test_id',
            },
          },
          name: { type: 'string', faker: 'person.firstName' },
        },
      };

      const result = generator.generateFromSchema(schema, 5);

      expect(result).toHaveLength(5);
      expect(result[0].id).toBe(100);
      expect(result[1].id).toBe(101);
      expect(result[2].id).toBe(102);
      expect(result[3].id).toBe(103);
      expect(result[4].id).toBe(104);
    });

    it('should generate sequential numbers with custom step', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            sequential: {
              start: 1000,
              step: 10,
              counterName: 'custom_step_id',
            },
          },
        },
      };

      const result = generator.generateFromSchema(schema, 3);

      expect(result[0].id).toBe(1000);
      expect(result[1].id).toBe(1010);
      expect(result[2].id).toBe(1020);
    });

    it('should handle multiple sequential counters independently', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          user_id: {
            type: 'integer',
            sequential: {
              start: 1,
              step: 1,
              counterName: 'users',
            },
          },
          order_id: {
            type: 'integer',
            sequential: {
              start: 100,
              step: 5,
              counterName: 'orders',
            },
          },
        },
      };

      const result = generator.generateFromSchema(schema, 3);

      expect(result[0].user_id).toBe(1);
      expect(result[0].order_id).toBe(100);
      expect(result[1].user_id).toBe(2);
      expect(result[1].order_id).toBe(105);
      expect(result[2].user_id).toBe(3);
      expect(result[2].order_id).toBe(110);
    });
  });
});
