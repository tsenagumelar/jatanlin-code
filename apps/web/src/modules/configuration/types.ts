import type { GetConfigsQuery } from '@/src/graphql/hooks/configuration';

// Configuration types
export type ConfigData = NonNullable<GetConfigsQuery['master_config'][0]>;

export interface ConfigFormData {
  config_value: string;
}

export interface ConfigFilterData {
  search: string;
  config_type: string;
  is_active: string;
}

export interface ConfigurationModuleProps {
  // Props for ConfigurationModule component if needed
}
