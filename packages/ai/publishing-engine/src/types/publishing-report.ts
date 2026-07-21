export interface PublishingReport {
  summary: string;
  passed: boolean;
  rendered: FormatReport[];
  exported: FormatReport[];
  validation: ValidationReport;
  metadata: MetadataPackage;
}

export interface FormatReport {
  format: string;
  status: 'success' | 'failed' | 'skipped';
  size: number;
  durationMs: number;
  error?: string;
}

export interface ValidationReport {
  passed: boolean;
  checks: ValidationCheck[];
}

export interface ValidationCheck {
  name: string;
  passed: boolean;
  severity: 'low' | 'medium' | 'high';
  details: string;
}

export interface MetadataPackage {
  title: string;
  subtitle?: string;
  author: string;
  language: string;
  genre: string[];
  tags: string[];
  description: string;
  keywords: string[];
  version: string;
  revision: string;
  copyright: string;
  license: string;
  isbn?: string;
  publisher: string;
  publicationDate: string;
  series?: string;
  volume?: number;
}

export interface CoverMetadata {
  title: string;
  subtitle?: string;
  author: string;
  series?: string;
  volume?: number;
  backCover?: string;
  spine?: string;
}
