export interface MockGeneratorOptions {
  count?: number;
  locale?: string;
  seed?: number;
  customProviders?: Record<string, () => any>;
  sequentialCounters?: Record<string, number>;
  generatedData?: Record<string, any[]>; // Store generated data for references
}

export interface SchemaProperty {
  type: string;
  format?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enum?: any[];
  items?: SchemaProperty;
  properties?: Record<string, SchemaProperty>;
  required?: string[];
  faker?: string;
  chance?: string;
  const?: any;
  default?: any;
  sequential?: {
    start?: number;
    step?: number;
    counterName?: string;
  };
  template?: string;
  transform?: 'lowercase' | 'uppercase' | 'capitalize';
  percentage?: {
    [key: string]: number; // value -> percentage (0-100)
  };
  foreignKey?: {
    schema: string; // reference to another schema name
    field: string;  // field name in the referenced schema
  };
  modulo?: {
    divisor: number; // the number that the generated value should be divisible by (e.g., 5, 10, 100)
    remainder?: number; // optional remainder (default: 0) - for patterns like (x % 5 = 2)
  };
}

export interface JSONSchema {
  type: 'object';
  properties: Record<string, SchemaProperty>;
  required?: string[];
  additionalProperties?: boolean;
  schemaName?: string; // identifier for the schema
  dependentRecords?: {
    minPerParent?: number; // minimum records per parent record
    maxPerParent?: number; // maximum records per parent record
    parentSchema?: string; // parent schema name for dependent records
    parentSchemas?: Array<{
      schema: string;
      minPerParent?: number;
      maxPerParent?: number;
      oneToOne?: boolean; // if true, each parent record gets exactly one child record
    }>; // support for multiple parent schemas
  };
  uniqueConstraints?: Array<{
    columns: string[]; // array of column names that should be unique together
    name?: string; // optional constraint name
  }>;
}
