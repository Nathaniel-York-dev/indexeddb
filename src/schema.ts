export interface Property {
    type: string;
    primary?: boolean;
    default?: string;
  }
  
  export interface Schema {
    primaryKey: string;
    properties: Record<string, Property>;
    required: string[];
  }