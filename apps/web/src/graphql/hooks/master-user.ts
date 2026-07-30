import * as Types from '../schema/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetUsersQueryVariables = Types.Exact<{
  limit: Types.Scalars['Int']['input'];
  offset: Types.Scalars['Int']['input'];
  where?: Types.InputMaybe<Types.Master_User_Bool_Exp>;
}>;


export type GetUsersQuery = { master_user: Array<{ id: any, code: string, username: string, full_name: string, badge_no?: string | null, phone_number?: string | null, email?: string | null, role_id: any, profile_picture?: string | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, master_role: { id: any, code: string, role_name: string, description?: string | null } }>, master_user_aggregate: { aggregate?: { count: number } | null } };

export type GetUserByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
}>;


export type GetUserByIdQuery = { master_user_by_pk?: { id: any, code: string, username: string, full_name: string, badge_no?: string | null, phone_number?: string | null, email?: string | null, role_id: any, profile_picture?: string | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, master_role: { id: any, code: string, role_name: string, description?: string | null } } | null };

export type InsertUserMutationVariables = Types.Exact<{
  object: Types.Master_User_Insert_Input;
}>;


export type InsertUserMutation = { insert_master_user_one?: { id: any, code: string, username: string, full_name: string, badge_no?: string | null, phone_number?: string | null, email?: string | null, role_id: any, profile_picture?: string | null, is_active?: boolean | null, created_by?: any | null, created_date?: any | null } | null };

export type UpdateUserMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  set: Types.Master_User_Set_Input;
}>;


export type UpdateUserMutation = { update_master_user_by_pk?: { id: any, code: string, username: string, full_name: string, badge_no?: string | null, phone_number?: string | null, email?: string | null, role_id: any, profile_picture?: string | null, is_active?: boolean | null, updated_by?: any | null, updated_date?: any | null } | null };

export type SoftDeleteUserMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  updated_by: Types.Scalars['uuid']['input'];
}>;


export type SoftDeleteUserMutation = { update_master_user_by_pk?: { id: any, code: string, username: string, is_deleted?: boolean | null, is_active?: boolean | null, updated_by?: any | null, updated_date?: any | null } | null };

export type RestoreUserMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  updated_by: Types.Scalars['uuid']['input'];
}>;


export type RestoreUserMutation = { update_master_user_by_pk?: { id: any, code: string, username: string, is_deleted?: boolean | null, updated_by?: any | null, updated_date?: any | null } | null };

export type CheckUsernameExistsQueryVariables = Types.Exact<{
  username: Types.Scalars['String']['input'];
}>;


export type CheckUsernameExistsQuery = { master_user: Array<{ id: any, username: string }> };


export const GetUsersDocument = gql`
    query GetUsers($limit: Int!, $offset: Int!, $where: master_user_bool_exp = {}) {
  master_user(
    where: {_and: [{is_deleted: {_eq: false}}, $where]}
    limit: $limit
    offset: $offset
    order_by: {created_date: desc}
  ) {
    id
    code
    username
    full_name
    badge_no
    phone_number
    email
    role_id
    profile_picture
    is_active
    is_deleted
    created_by
    created_date
    updated_by
    updated_date
    master_role {
      id
      code
      role_name
      description
    }
  }
  master_user_aggregate(where: {_and: [{is_deleted: {_eq: false}}, $where]}) {
    aggregate {
      count
    }
  }
}
    `;

/**
 * __useGetUsersQuery__
 *
 * To run a query within a React component, call `useGetUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUsersQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetUsersQuery(baseOptions: Apollo.QueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
      }
export function useGetUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
        }
export type GetUsersQueryHookResult = ReturnType<typeof useGetUsersQuery>;
export type GetUsersLazyQueryHookResult = ReturnType<typeof useGetUsersLazyQuery>;
export const GetUserByIdDocument = gql`
    query GetUserById($id: uuid!) {
  master_user_by_pk(id: $id) {
    id
    code
    username
    full_name
    badge_no
    phone_number
    email
    role_id
    profile_picture
    is_active
    is_deleted
    created_by
    created_date
    updated_by
    updated_date
    master_role {
      id
      code
      role_name
      description
    }
  }
}
    `;

/**
 * __useGetUserByIdQuery__
 *
 * To run a query within a React component, call `useGetUserByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetUserByIdQuery(baseOptions: Apollo.QueryHookOptions<GetUserByIdQuery, GetUserByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserByIdQuery, GetUserByIdQueryVariables>(GetUserByIdDocument, options);
      }
export function useGetUserByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserByIdQuery, GetUserByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserByIdQuery, GetUserByIdQueryVariables>(GetUserByIdDocument, options);
        }
export type GetUserByIdQueryHookResult = ReturnType<typeof useGetUserByIdQuery>;
export type GetUserByIdLazyQueryHookResult = ReturnType<typeof useGetUserByIdLazyQuery>;
export const InsertUserDocument = gql`
    mutation InsertUser($object: master_user_insert_input!) {
  insert_master_user_one(object: $object) {
    id
    code
    username
    full_name
    badge_no
    phone_number
    email
    role_id
    profile_picture
    is_active
    created_by
    created_date
  }
}
    `;

/**
 * __useInsertUserMutation__
 *
 * To run a mutation, you first call `useInsertUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertUserMutation, { data, loading, error }] = useInsertUserMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useInsertUserMutation(baseOptions?: Apollo.MutationHookOptions<InsertUserMutation, InsertUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertUserMutation, InsertUserMutationVariables>(InsertUserDocument, options);
      }
export type InsertUserMutationHookResult = ReturnType<typeof useInsertUserMutation>;
export const UpdateUserDocument = gql`
    mutation UpdateUser($id: uuid!, $set: master_user_set_input!) {
  update_master_user_by_pk(pk_columns: {id: $id}, _set: $set) {
    id
    code
    username
    full_name
    badge_no
    phone_number
    email
    role_id
    profile_picture
    is_active
    updated_by
    updated_date
  }
}
    `;

/**
 * __useUpdateUserMutation__
 *
 * To run a mutation, you first call `useUpdateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserMutation, { data, loading, error }] = useUpdateUserMutation({
 *   variables: {
 *      id: // value for 'id'
 *      set: // value for 'set'
 *   },
 * });
 */
export function useUpdateUserMutation(baseOptions?: Apollo.MutationHookOptions<UpdateUserMutation, UpdateUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateUserMutation, UpdateUserMutationVariables>(UpdateUserDocument, options);
      }
export type UpdateUserMutationHookResult = ReturnType<typeof useUpdateUserMutation>;
export const SoftDeleteUserDocument = gql`
    mutation SoftDeleteUser($id: uuid!, $updated_by: uuid!) {
  update_master_user_by_pk(
    pk_columns: {id: $id}
    _set: {is_deleted: true, is_active: false, updated_by: $updated_by, updated_date: "now()"}
  ) {
    id
    code
    username
    is_deleted
    is_active
    updated_by
    updated_date
  }
}
    `;

/**
 * __useSoftDeleteUserMutation__
 *
 * To run a mutation, you first call `useSoftDeleteUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSoftDeleteUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [softDeleteUserMutation, { data, loading, error }] = useSoftDeleteUserMutation({
 *   variables: {
 *      id: // value for 'id'
 *      updated_by: // value for 'updated_by'
 *   },
 * });
 */
export function useSoftDeleteUserMutation(baseOptions?: Apollo.MutationHookOptions<SoftDeleteUserMutation, SoftDeleteUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SoftDeleteUserMutation, SoftDeleteUserMutationVariables>(SoftDeleteUserDocument, options);
      }
export type SoftDeleteUserMutationHookResult = ReturnType<typeof useSoftDeleteUserMutation>;
export const RestoreUserDocument = gql`
    mutation RestoreUser($id: uuid!, $updated_by: uuid!) {
  update_master_user_by_pk(
    pk_columns: {id: $id}
    _set: {is_deleted: false, updated_by: $updated_by, updated_date: "now()"}
  ) {
    id
    code
    username
    is_deleted
    updated_by
    updated_date
  }
}
    `;

/**
 * __useRestoreUserMutation__
 *
 * To run a mutation, you first call `useRestoreUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRestoreUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [restoreUserMutation, { data, loading, error }] = useRestoreUserMutation({
 *   variables: {
 *      id: // value for 'id'
 *      updated_by: // value for 'updated_by'
 *   },
 * });
 */
export function useRestoreUserMutation(baseOptions?: Apollo.MutationHookOptions<RestoreUserMutation, RestoreUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RestoreUserMutation, RestoreUserMutationVariables>(RestoreUserDocument, options);
      }
export type RestoreUserMutationHookResult = ReturnType<typeof useRestoreUserMutation>;
export const CheckUsernameExistsDocument = gql`
    query CheckUsernameExists($username: String!) {
  master_user(where: {username: {_eq: $username}, is_deleted: {_eq: false}}) {
    id
    username
  }
}
    `;

/**
 * __useCheckUsernameExistsQuery__
 *
 * To run a query within a React component, call `useCheckUsernameExistsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckUsernameExistsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckUsernameExistsQuery({
 *   variables: {
 *      username: // value for 'username'
 *   },
 * });
 */
export function useCheckUsernameExistsQuery(baseOptions: Apollo.QueryHookOptions<CheckUsernameExistsQuery, CheckUsernameExistsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CheckUsernameExistsQuery, CheckUsernameExistsQueryVariables>(CheckUsernameExistsDocument, options);
      }
export function useCheckUsernameExistsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CheckUsernameExistsQuery, CheckUsernameExistsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CheckUsernameExistsQuery, CheckUsernameExistsQueryVariables>(CheckUsernameExistsDocument, options);
        }
export type CheckUsernameExistsQueryHookResult = ReturnType<typeof useCheckUsernameExistsQuery>;
export type CheckUsernameExistsLazyQueryHookResult = ReturnType<typeof useCheckUsernameExistsLazyQuery>;