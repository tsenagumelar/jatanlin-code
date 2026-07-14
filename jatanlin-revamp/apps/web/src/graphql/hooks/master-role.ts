import * as Types from '../schema/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetRolesQueryVariables = Types.Exact<{
  limit: Types.Scalars['Int']['input'];
  offset: Types.Scalars['Int']['input'];
  where?: Types.InputMaybe<Types.Master_Role_Bool_Exp>;
}>;


export type GetRolesQuery = { master_role: Array<{ id: any, code: string, role_name: string, description?: string | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null }>, master_role_aggregate: { aggregate?: { count: number } | null } };

export type GetRoleByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
}>;


export type GetRoleByIdQuery = { master_role_by_pk?: { id: any, code: string, role_name: string, description?: string | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null } | null };

export type InsertRoleMutationVariables = Types.Exact<{
  object: Types.Master_Role_Insert_Input;
}>;


export type InsertRoleMutation = { insert_master_role_one?: { id: any, code: string, role_name: string, description?: string | null, is_active?: boolean | null, created_by?: any | null, created_date?: any | null } | null };

export type UpdateRoleMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  set: Types.Master_Role_Set_Input;
}>;


export type UpdateRoleMutation = { update_master_role_by_pk?: { id: any, code: string, role_name: string, description?: string | null, is_active?: boolean | null, updated_by?: any | null, updated_date?: any | null } | null };

export type SoftDeleteRoleMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  updated_by: Types.Scalars['uuid']['input'];
}>;


export type SoftDeleteRoleMutation = { update_master_role_by_pk?: { id: any, code: string, role_name: string, is_deleted?: boolean | null, is_active?: boolean | null, updated_by?: any | null, updated_date?: any | null } | null };

export type RestoreRoleMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  updated_by: Types.Scalars['uuid']['input'];
}>;


export type RestoreRoleMutation = { update_master_role_by_pk?: { id: any, code: string, role_name: string, is_deleted?: boolean | null, updated_by?: any | null, updated_date?: any | null } | null };

export type CheckRoleCodeExistsQueryVariables = Types.Exact<{
  code: Types.Scalars['String']['input'];
}>;


export type CheckRoleCodeExistsQuery = { master_role: Array<{ id: any, code: string }> };

export type CheckRoleNameExistsQueryVariables = Types.Exact<{
  role_name: Types.Scalars['String']['input'];
}>;


export type CheckRoleNameExistsQuery = { master_role: Array<{ id: any, role_name: string }> };


export const GetRolesDocument = gql`
    query GetRoles($limit: Int!, $offset: Int!, $where: master_role_bool_exp = {}) {
  master_role(
    where: {_and: [{is_deleted: {_eq: false}}, $where]}
    limit: $limit
    offset: $offset
    order_by: {created_date: desc}
  ) {
    id
    code
    role_name
    description
    is_active
    is_deleted
    created_by
    created_date
    updated_by
    updated_date
  }
  master_role_aggregate(where: {_and: [{is_deleted: {_eq: false}}, $where]}) {
    aggregate {
      count
    }
  }
}
    `;

/**
 * __useGetRolesQuery__
 *
 * To run a query within a React component, call `useGetRolesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRolesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRolesQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetRolesQuery(baseOptions: Apollo.QueryHookOptions<GetRolesQuery, GetRolesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRolesQuery, GetRolesQueryVariables>(GetRolesDocument, options);
      }
export function useGetRolesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRolesQuery, GetRolesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRolesQuery, GetRolesQueryVariables>(GetRolesDocument, options);
        }
export type GetRolesQueryHookResult = ReturnType<typeof useGetRolesQuery>;
export type GetRolesLazyQueryHookResult = ReturnType<typeof useGetRolesLazyQuery>;
export const GetRoleByIdDocument = gql`
    query GetRoleById($id: uuid!) {
  master_role_by_pk(id: $id) {
    id
    code
    role_name
    description
    is_active
    is_deleted
    created_by
    created_date
    updated_by
    updated_date
  }
}
    `;

/**
 * __useGetRoleByIdQuery__
 *
 * To run a query within a React component, call `useGetRoleByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRoleByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRoleByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetRoleByIdQuery(baseOptions: Apollo.QueryHookOptions<GetRoleByIdQuery, GetRoleByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRoleByIdQuery, GetRoleByIdQueryVariables>(GetRoleByIdDocument, options);
      }
export function useGetRoleByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRoleByIdQuery, GetRoleByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRoleByIdQuery, GetRoleByIdQueryVariables>(GetRoleByIdDocument, options);
        }
export type GetRoleByIdQueryHookResult = ReturnType<typeof useGetRoleByIdQuery>;
export type GetRoleByIdLazyQueryHookResult = ReturnType<typeof useGetRoleByIdLazyQuery>;
export const InsertRoleDocument = gql`
    mutation InsertRole($object: master_role_insert_input!) {
  insert_master_role_one(object: $object) {
    id
    code
    role_name
    description
    is_active
    created_by
    created_date
  }
}
    `;

/**
 * __useInsertRoleMutation__
 *
 * To run a mutation, you first call `useInsertRoleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertRoleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertRoleMutation, { data, loading, error }] = useInsertRoleMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useInsertRoleMutation(baseOptions?: Apollo.MutationHookOptions<InsertRoleMutation, InsertRoleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertRoleMutation, InsertRoleMutationVariables>(InsertRoleDocument, options);
      }
export type InsertRoleMutationHookResult = ReturnType<typeof useInsertRoleMutation>;
export const UpdateRoleDocument = gql`
    mutation UpdateRole($id: uuid!, $set: master_role_set_input!) {
  update_master_role_by_pk(pk_columns: {id: $id}, _set: $set) {
    id
    code
    role_name
    description
    is_active
    updated_by
    updated_date
  }
}
    `;

/**
 * __useUpdateRoleMutation__
 *
 * To run a mutation, you first call `useUpdateRoleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateRoleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateRoleMutation, { data, loading, error }] = useUpdateRoleMutation({
 *   variables: {
 *      id: // value for 'id'
 *      set: // value for 'set'
 *   },
 * });
 */
export function useUpdateRoleMutation(baseOptions?: Apollo.MutationHookOptions<UpdateRoleMutation, UpdateRoleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateRoleMutation, UpdateRoleMutationVariables>(UpdateRoleDocument, options);
      }
export type UpdateRoleMutationHookResult = ReturnType<typeof useUpdateRoleMutation>;
export const SoftDeleteRoleDocument = gql`
    mutation SoftDeleteRole($id: uuid!, $updated_by: uuid!) {
  update_master_role_by_pk(
    pk_columns: {id: $id}
    _set: {is_deleted: true, is_active: false, updated_by: $updated_by, updated_date: "now()"}
  ) {
    id
    code
    role_name
    is_deleted
    is_active
    updated_by
    updated_date
  }
}
    `;

/**
 * __useSoftDeleteRoleMutation__
 *
 * To run a mutation, you first call `useSoftDeleteRoleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSoftDeleteRoleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [softDeleteRoleMutation, { data, loading, error }] = useSoftDeleteRoleMutation({
 *   variables: {
 *      id: // value for 'id'
 *      updated_by: // value for 'updated_by'
 *   },
 * });
 */
export function useSoftDeleteRoleMutation(baseOptions?: Apollo.MutationHookOptions<SoftDeleteRoleMutation, SoftDeleteRoleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SoftDeleteRoleMutation, SoftDeleteRoleMutationVariables>(SoftDeleteRoleDocument, options);
      }
export type SoftDeleteRoleMutationHookResult = ReturnType<typeof useSoftDeleteRoleMutation>;
export const RestoreRoleDocument = gql`
    mutation RestoreRole($id: uuid!, $updated_by: uuid!) {
  update_master_role_by_pk(
    pk_columns: {id: $id}
    _set: {is_deleted: false, updated_by: $updated_by, updated_date: "now()"}
  ) {
    id
    code
    role_name
    is_deleted
    updated_by
    updated_date
  }
}
    `;

/**
 * __useRestoreRoleMutation__
 *
 * To run a mutation, you first call `useRestoreRoleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRestoreRoleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [restoreRoleMutation, { data, loading, error }] = useRestoreRoleMutation({
 *   variables: {
 *      id: // value for 'id'
 *      updated_by: // value for 'updated_by'
 *   },
 * });
 */
export function useRestoreRoleMutation(baseOptions?: Apollo.MutationHookOptions<RestoreRoleMutation, RestoreRoleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RestoreRoleMutation, RestoreRoleMutationVariables>(RestoreRoleDocument, options);
      }
export type RestoreRoleMutationHookResult = ReturnType<typeof useRestoreRoleMutation>;
export const CheckRoleCodeExistsDocument = gql`
    query CheckRoleCodeExists($code: String!) {
  master_role(where: {code: {_eq: $code}, is_deleted: {_eq: false}}) {
    id
    code
  }
}
    `;

/**
 * __useCheckRoleCodeExistsQuery__
 *
 * To run a query within a React component, call `useCheckRoleCodeExistsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckRoleCodeExistsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckRoleCodeExistsQuery({
 *   variables: {
 *      code: // value for 'code'
 *   },
 * });
 */
export function useCheckRoleCodeExistsQuery(baseOptions: Apollo.QueryHookOptions<CheckRoleCodeExistsQuery, CheckRoleCodeExistsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CheckRoleCodeExistsQuery, CheckRoleCodeExistsQueryVariables>(CheckRoleCodeExistsDocument, options);
      }
export function useCheckRoleCodeExistsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CheckRoleCodeExistsQuery, CheckRoleCodeExistsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CheckRoleCodeExistsQuery, CheckRoleCodeExistsQueryVariables>(CheckRoleCodeExistsDocument, options);
        }
export type CheckRoleCodeExistsQueryHookResult = ReturnType<typeof useCheckRoleCodeExistsQuery>;
export type CheckRoleCodeExistsLazyQueryHookResult = ReturnType<typeof useCheckRoleCodeExistsLazyQuery>;
export const CheckRoleNameExistsDocument = gql`
    query CheckRoleNameExists($role_name: String!) {
  master_role(where: {role_name: {_eq: $role_name}, is_deleted: {_eq: false}}) {
    id
    role_name
  }
}
    `;

/**
 * __useCheckRoleNameExistsQuery__
 *
 * To run a query within a React component, call `useCheckRoleNameExistsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckRoleNameExistsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckRoleNameExistsQuery({
 *   variables: {
 *      role_name: // value for 'role_name'
 *   },
 * });
 */
export function useCheckRoleNameExistsQuery(baseOptions: Apollo.QueryHookOptions<CheckRoleNameExistsQuery, CheckRoleNameExistsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CheckRoleNameExistsQuery, CheckRoleNameExistsQueryVariables>(CheckRoleNameExistsDocument, options);
      }
export function useCheckRoleNameExistsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CheckRoleNameExistsQuery, CheckRoleNameExistsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CheckRoleNameExistsQuery, CheckRoleNameExistsQueryVariables>(CheckRoleNameExistsDocument, options);
        }
export type CheckRoleNameExistsQueryHookResult = ReturnType<typeof useCheckRoleNameExistsQuery>;
export type CheckRoleNameExistsLazyQueryHookResult = ReturnType<typeof useCheckRoleNameExistsLazyQuery>;