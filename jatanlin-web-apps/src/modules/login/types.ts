import type { LoginQuery } from '@/src/graphql/hooks/auth';

export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginModuleProps {
  // Props for LoginModule component if needed in the future
}

// User type aligned with Hasura master_user schema
export type UserData = NonNullable<LoginQuery['master_user'][0]>;

export interface UserRole {
  id: string;
  code: string;
  role_name: string;
  description: string | null;
}

export interface User {
  id: string;
  code: string;
  badge_no: string | null;
  username: string;
  email: string | null;
  full_name: string;
  profile_picture: string | null;
  is_active: boolean | null;
  master_role: UserRole;
}
