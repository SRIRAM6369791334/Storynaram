export type SchemaCategory = 'core' | 'domain' | 'ai' | 'workflow' | 'validation';

export type SchemaId = string & { readonly __brand: 'SchemaId' };

export interface SchemaMeta {
  $id: SchemaId;
  title: string;
  description?: string;
  $schema?: string;
  version?: string;
  category: SchemaCategory;
  filePath: string;
  dependencies: SchemaId[];
  dependents: SchemaId[];
  byteSize: number;
  lastModified?: Date;
}

export interface SchemaIndexEntry {
  schemaId: SchemaId;
  title: string;
  category: SchemaCategory;
  filePath: string;
  version?: string;
  depCount: number;
}

export interface RegistryStats {
  totalSchemas: number;
  categories: Record<SchemaCategory, number>;
  totalCompiled: number;
  cacheHitRate: number;
  cacheMissRate: number;
  uptime: number;
  lastReload?: Date;
}

export interface RegistryConfig {
  schemaPaths?: Record<SchemaCategory, string>;
  autoLoad?: boolean;
  lazyCompile?: boolean;
  cacheMaxSize?: number;
  strictValidation?: boolean;
}

export interface DiscoveryResult {
  found: number;
  categories: SchemaCategory[];
  paths: string[];
  errors: string[];
  duration: number;
}

export interface CompilationResult {
  success: boolean;
  schemaId: SchemaId;
  errors?: string[];
  duration: number;
}

export interface ReferenceInfo {
  from: SchemaId;
  to: SchemaId;
  refPath: string;
  resolved: boolean;
}

export interface SchemaSearchQuery {
  title?: string;
  category?: SchemaCategory;
  limit?: number;
  offset?: number;
}
