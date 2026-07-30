import type { GetRolesQuery } from "@/src/graphql/hooks/master-role";
import type { GetUsersQuery } from "@/src/graphql/hooks/master-user";

export type V3UserRow = NonNullable<GetUsersQuery["master_user"][0]>;
export type V3RoleOption = NonNullable<GetRolesQuery["master_role"][0]>;

export interface V3UserFilters {
  search: string;
  roleId: string;
  status: string;
}

export interface V3UserFormData {
  username: string;
  fullName: string;
  badgeNo: string;
  email: string;
  phone: string;
  roleId: string;
  password: string;
  profilePicture: string;
  isActive: boolean;
}

export type V3UserModalMode = "create" | "edit";

export interface V3UserModalState {
  isOpen: boolean;
  mode: V3UserModalMode;
  user: V3UserRow | null;
}
