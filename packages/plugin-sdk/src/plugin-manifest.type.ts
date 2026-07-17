export type PluginManifest = {
  name: string;
  version: string;
  description?: string;
  entryPoint: string;
  dependencies?: string[];
  hooks?: string[];
};
