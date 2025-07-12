import { MockDataGenerator } from '../MockDataGenerator';
import { JSONSchema } from '../types';

describe('MockDataGenerator - Foreign Key Relationships', () => {
  let generator: MockDataGenerator;

  beforeEach(() => {
    generator = new MockDataGenerator({
      seed: 12345 // For reproducible tests
    });
  });

  const usersSchema: JSONSchema = {
    type: 'object',
    schemaName: 'users',
    properties: {
      id: {
        type: 'integer',
        sequential: {
          start: 1000,
          step: 1,
          counterName: 'user_id'
        }
      },
      name: {
        type: 'string',
        faker: 'person.fullName'
      },
      email: {
        type: 'string',
        faker: 'internet.email'
      }
    },
    required: ['id', 'name', 'email']
  };

  const userContactsSchema: JSONSchema = {
    type: 'object',
    schemaName: 'user_contacts',
    dependentRecords: {
      parentSchema: 'users',
      minPerParent: 1,
      maxPerParent: 3
    },
    properties: {
      id: {
        type: 'integer',
        sequential: {
          start: 1,
          step: 1,
          counterName: 'contact_id'
        }
      },
      user_id: {
        type: 'integer',
        foreignKey: {
          schema: 'users',
          field: 'id'
        }
      },
      contact_type: {
        type: 'string',
        enum: ['email', 'phone', 'address']
      },
      contact_value: {
        type: 'string',
        faker: 'internet.email'
      }
    },
    required: ['id', 'user_id', 'contact_type', 'contact_value']
  };

  describe('generateRelatedSchemas', () => {
    it('should generate parent and child records with valid foreign keys', () => {
      const schemas = {
        users: usersSchema,
        user_contacts: userContactsSchema
      };

      const results = generator.generateRelatedSchemas(schemas, {
        users: 5,
        user_contacts: 0 // Auto-generated
      });

      // Verify users were generated
      expect(results.users).toBeDefined();
      expect(results.users.length).toBe(5);
      expect(results.users[0]).toHaveProperty('id');
      expect(results.users[0]).toHaveProperty('name');
      expect(results.users[0]).toHaveProperty('email');

      // Verify user contacts were generated
      expect(results.user_contacts).toBeDefined();
      expect(results.user_contacts.length).toBeGreaterThan(0);

      // Verify foreign key relationships
      const userIds = results.users.map((user: any) => user.id);
      const contactUserIds = results.user_contacts.map((contact: any) => contact.user_id);
      
      contactUserIds.forEach(userId => {
        expect(userIds).toContain(userId);
      });
    });

    it('should respect min/max per parent constraints', () => {
      const schemas = {
        users: usersSchema,
        user_contacts: {
          ...userContactsSchema,
          dependentRecords: {
            parentSchema: 'users',
            minPerParent: 2,
            maxPerParent: 2
          }
        }
      };

      const results = generator.generateRelatedSchemas(schemas, {
        users: 3,
        user_contacts: 0
      });

      // Each user should have exactly 2 contacts
      expect(results.user_contacts.length).toBe(6); // 3 users * 2 contacts each

      // Verify distribution
      const contactsPerUser: { [key: number]: number } = {};
      results.user_contacts.forEach((contact: any) => {
        contactsPerUser[contact.user_id] = (contactsPerUser[contact.user_id] || 0) + 1;
      });

      Object.values(contactsPerUser).forEach(count => {
        expect(count).toBe(2);
      });
    });

    it('should handle sequential IDs correctly across related schemas', () => {
      const schemas = {
        users: usersSchema,
        user_contacts: userContactsSchema
      };

      const results = generator.generateRelatedSchemas(schemas, {
        users: 3,
        user_contacts: 0
      });

      // Verify user IDs are sequential starting from 1000
      const userIds = results.users.map((user: any) => user.id).sort();
      expect(userIds).toEqual([1000, 1001, 1002]);

      // Verify contact IDs are sequential starting from 1
      const contactIds = results.user_contacts.map((contact: any) => contact.id).sort();
      expect(contactIds[0]).toBe(1);
      expect(contactIds[contactIds.length - 1]).toBe(contactIds.length);
    });

    it('should throw error when parent schema data is not available', () => {
      const orphanedSchema: JSONSchema = {
        type: 'object',
        schemaName: 'orphaned',
        dependentRecords: {
          parentSchema: 'nonexistent',
          minPerParent: 1,
          maxPerParent: 2
        },
        properties: {
          id: { type: 'integer' },
          parent_id: {
            type: 'integer',
            foreignKey: {
              schema: 'nonexistent',
              field: 'id'
            }
          }
        }
      };

      expect(() => {
        generator.generateFromSchema(orphanedSchema, 5);
      }).toThrow('Parent schema \'nonexistent\' data not found');
    });
  });

  describe('foreign key value generation', () => {
    it('should generate foreign key values from existing parent data', () => {
      // Generate parent data first
      const users = generator.generateFromSchema(usersSchema, 3);
      
      // Generate child data
      const contacts = generator.generateFromSchema(userContactsSchema, 5);

      // Verify all contact user_ids reference existing users
      const userIds = users.map((user: any) => user.id);
      contacts.forEach((contact: any) => {
        expect(userIds).toContain(contact.user_id);
      });
    });

    it('should handle conditional template generation', () => {
      const contactSchemaWithTemplates: JSONSchema = {
        ...userContactsSchema,
        properties: {
          ...userContactsSchema.properties,
          contact_value: {
            type: 'string',
            template: '{{contact_type_value}}'
          }
        }
      };

      // Generate parent data first
      generator.generateFromSchema(usersSchema, 2);
      
      // Generate child data with templates
      const contacts = generator.generateFromSchema(contactSchemaWithTemplates, 3);

      contacts.forEach((contact: any) => {
        expect(contact.contact_value).toBeDefined();
        expect(typeof contact.contact_value).toBe('string');
        expect(contact.contact_value.length).toBeGreaterThan(0);
      });
    });
  });

  describe('data management methods', () => {
    it('should store and retrieve generated data', () => {
      const users = generator.generateFromSchema(usersSchema, 3);
      
      const retrievedUsers = generator.getGeneratedData('users');
      expect(retrievedUsers).toEqual(users);
    });

    it('should clear generated data', () => {
      generator.generateFromSchema(usersSchema, 3);
      expect(generator.getGeneratedData('users').length).toBe(3);
      
      generator.clearGeneratedData();
      expect(generator.getGeneratedData('users').length).toBe(0);
    });
  });
});
