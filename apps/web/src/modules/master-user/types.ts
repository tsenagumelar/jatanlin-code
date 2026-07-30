import { GetRolesQuery } from '@/src/graphql/hooks/master-role';
import type { GetUsersQuery } from '@/src/graphql/hooks/master-user';

// User types
export type UserData = NonNullable<GetUsersQuery['master_user'][0]>;
export type RoleData = NonNullable<GetRolesQuery['master_role'][0]>;

export interface UserFormData {
  username: string;
  full_name: string;
  badge_no: string;
  phone_number: string;
  email: string;
  role_id: string;
  password_hash: string;
  is_active: boolean;
  profile_picture?: string;
}

export interface UserFilterData {
  search: string;
  role_id: string;
  is_active: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MasterUserModuleProps {
  // Props for MasterUserModule component if needed
}
