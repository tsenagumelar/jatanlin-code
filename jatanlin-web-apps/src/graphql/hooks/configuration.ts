import * as Types from '../schema/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetConfigsQueryVariables = Types.Exact<{
  limit: Types.Scalars['Int']['input'];
  offset: Types.Scalars['Int']['input'];
  where?: Types.InputMaybe<Types.Master_Config_Bool_Exp>;
}>;


export type GetConfigsQuery = { master_config: Array<{ id: any, code: string, config_type: string, config_key: string, config_value?: string | null, description?: string | null, sort_order?: number | null, parent_code?: string | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null }>, master_config_aggregate: { aggregate?: { count: number } | null } };

export type GetConfigByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
}>;


export type GetConfigByIdQuery = { master_config_by_pk?: { id: any, code: string, config_type: string, config_key: string, config_value?: string | null, description?: string | null, sort_order?: number | null, parent_code?: string | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null } | null };

export type GetConfigsByTypeQueryVariables = Types.Exact<{
  config_type: Types.Scalars['String']['input'];
}>;


export type GetConfigsByTypeQuery = { master_config: Array<{ id: any, code: string, config_key: string, config_value?: string | null, description?: string | null, sort_order?: number | null, parent_code?: string | null }> };

export type InsertConfigMutationVariables = Types.Exact<{
  object: Types.Master_Config_Insert_Input;
}>;


export type InsertConfigMutation = { insert_master_config_one?: { id: any, code: string, config_type: string, config_key: string, config_value?: string | null, description?: string | null, sort_order?: number | null, parent_code?: string | null, is_active?: boolean | null, created_by?: any | null, created_date?: any | null } | null };

export type UpdateConfigMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  set: Types.Master_Config_Set_Input;
}>;


export type UpdateConfigMutation = { update_master_config_by_pk?: { id: any, code: string, config_type: string, config_key: string, config_value?: string | null, description?: string | null, sort_order?: number | null, parent_code?: string | null, is_active?: boolean | null, updated_by?: any | null, updated_date?: any | null } | null };

export type SoftDeleteConfigMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  updated_by: Types.Scalars['uuid']['input'];
}>;


export type SoftDeleteConfigMutation = { update_master_config_by_pk?: { id: any, code: string, config_key: string, is_deleted?: boolean | null, is_active?: boolean | null, updated_by?: any | null, updated_date?: any | null } | null };

export type RestoreConfigMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  updated_by: Types.Scalars['uuid']['input'];
}>;


export type RestoreConfigMutation = { update_master_config_by_pk?: { id: any, code: string, config_key: string, is_deleted?: boolean | null, updated_by?: any | null, updated_date?: any | null } | null };

export type CheckConfigCodeExistsQueryVariables = Types.Exact<{
  code: Types.Scalars['String']['input'];
}>;


export type CheckConfigCodeExistsQuery = { master_config: Array<{ id: any, code: string }> };

export type CheckConfigKeyExistsQueryVariables = Types.Exact<{
  config_type: Types.Scalars['String']['input'];
  config_key: Types.Scalars['String']['input'];
}>;


export type CheckConfigKeyExistsQuery = { master_config: Array<{ id: any, config_type: string, config_key: string }> };


export const GetConfigsDocument = gql`
    query GetConfigs($limit: Int!, $offset: Int!, $where: master_config_bool_exp = {}) {
  master_config(
    where: {_and: [{is_deleted: {_eq: false}}, $where]}
    limit: $limit
    offset: $offset
    order_by: [{sort_order: asc}, {created_date: desc}]
  ) {
    id
    code
    config_type
    config_key
    config_value
    description
    sort_order
    parent_code
    is_active
    is_deleted
    created_by
    created_date
    updated_by
    updated_date
  }
  master_config_aggregate(where: {_and: [{is_deleted: {_eq: false}}, $where]}) {
    aggregate {
      count
    }
  }
}
    `;

/**
 * __useGetConfigsQuery__
 *
 * To run a query within a React component, call `useGetConfigsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetConfigsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetConfigsQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetConfigsQuery(baseOptions: Apollo.QueryHookOptions<GetConfigsQuery, GetConfigsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetConfigsQuery, GetConfigsQueryVariables>(GetConfigsDocument, options);
      }
export function useGetConfigsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetConfigsQuery, GetConfigsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetConfigsQuery, GetConfigsQueryVariables>(GetConfigsDocument, options);
        }
export type GetConfigsQueryHookResult = ReturnType<typeof useGetConfigsQuery>;
export type GetConfigsLazyQueryHookResult = ReturnType<typeof useGetConfigsLazyQuery>;
export const GetConfigByIdDocument = gql`
    query GetConfigById($id: uuid!) {
  master_config_by_pk(id: $id) {
    id
    code
    config_type
    config_key
    config_value
    description
    sort_order
    parent_code
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
 * __useGetConfigByIdQuery__
 *
 * To run a query within a React component, call `useGetConfigByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetConfigByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetConfigByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetConfigByIdQuery(baseOptions: Apollo.QueryHookOptions<GetConfigByIdQuery, GetConfigByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetConfigByIdQuery, GetConfigByIdQueryVariables>(GetConfigByIdDocument, options);
      }
export function useGetConfigByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetConfigByIdQuery, GetConfigByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetConfigByIdQuery, GetConfigByIdQueryVariables>(GetConfigByIdDocument, options);
        }
export type GetConfigByIdQueryHookResult = ReturnType<typeof useGetConfigByIdQuery>;
export type GetConfigByIdLazyQueryHookResult = ReturnType<typeof useGetConfigByIdLazyQuery>;
export const GetConfigsByTypeDocument = gql`
    query GetConfigsByType($config_type: String!) {
  master_config(
    where: {config_type: {_eq: $config_type}, is_deleted: {_eq: false}, is_active: {_eq: true}}
    order_by: {sort_order: asc}
  ) {
    id
    code
    config_key
    config_value
    description
    sort_order
    parent_code
  }
}
    `;

/**
 * __useGetConfigsByTypeQuery__
 *
 * To run a query within a React component, call `useGetConfigsByTypeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetConfigsByTypeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetConfigsByTypeQuery({
 *   variables: {
 *      config_type: // value for 'config_type'
 *   },
 * });
 */
export function useGetConfigsByTypeQuery(baseOptions: Apollo.QueryHookOptions<GetConfigsByTypeQuery, GetConfigsByTypeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetConfigsByTypeQuery, GetConfigsByTypeQueryVariables>(GetConfigsByTypeDocument, options);
      }
export function useGetConfigsByTypeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetConfigsByTypeQuery, GetConfigsByTypeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetConfigsByTypeQuery, GetConfigsByTypeQueryVariables>(GetConfigsByTypeDocument, options);
        }
export type GetConfigsByTypeQueryHookResult = ReturnType<typeof useGetConfigsByTypeQuery>;
export type GetConfigsByTypeLazyQueryHookResult = ReturnType<typeof useGetConfigsByTypeLazyQuery>;
export const InsertConfigDocument = gql`
    mutation InsertConfig($object: master_config_insert_input!) {
  insert_master_config_one(object: $object) {
    id
    code
    config_type
    config_key
    config_value
    description
    sort_order
    parent_code
    is_active
    created_by
    created_date
  }
}
    `;

/**
 * __useInsertConfigMutation__
 *
 * To run a mutation, you first call `useInsertConfigMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertConfigMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertConfigMutation, { data, loading, error }] = useInsertConfigMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useInsertConfigMutation(baseOptions?: Apollo.MutationHookOptions<InsertConfigMutation, InsertConfigMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertConfigMutation, InsertConfigMutationVariables>(InsertConfigDocument, options);
      }
export type InsertConfigMutationHookResult = ReturnType<typeof useInsertConfigMutation>;
export const UpdateConfigDocument = gql`
    mutation UpdateConfig($id: uuid!, $set: master_config_set_input!) {
  update_master_config_by_pk(pk_columns: {id: $id}, _set: $set) {
    id
    code
    config_type
    config_key
    config_value
    description
    sort_order
    parent_code
    is_active
    updated_by
    updated_date
  }
}
    `;

/**
 * __useUpdateConfigMutation__
 *
 * To run a mutation, you first call `useUpdateConfigMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateConfigMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateConfigMutation, { data, loading, error }] = useUpdateConfigMutation({
 *   variables: {
 *      id: // value for 'id'
 *      set: // value for 'set'
 *   },
 * });
 */
export function useUpdateConfigMutation(baseOptions?: Apollo.MutationHookOptions<UpdateConfigMutation, UpdateConfigMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateConfigMutation, UpdateConfigMutationVariables>(UpdateConfigDocument, options);
      }
export type UpdateConfigMutationHookResult = ReturnType<typeof useUpdateConfigMutation>;
export const SoftDeleteConfigDocument = gql`
    mutation SoftDeleteConfig($id: uuid!, $updated_by: uuid!) {
  update_master_config_by_pk(
    pk_columns: {id: $id}
    _set: {is_deleted: true, is_active: false, updated_by: $updated_by, updated_date: "now()"}
  ) {
    id
    code
    config_key
    is_deleted
    is_active
    updated_by
    updated_date
  }
}
    `;

/**
 * __useSoftDeleteConfigMutation__
 *
 * To run a mutation, you first call `useSoftDeleteConfigMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSoftDeleteConfigMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [softDeleteConfigMutation, { data, loading, error }] = useSoftDeleteConfigMutation({
 *   variables: {
 *      id: // value for 'id'
 *      updated_by: // value for 'updated_by'
 *   },
 * });
 */
export function useSoftDeleteConfigMutation(baseOptions?: Apollo.MutationHookOptions<SoftDeleteConfigMutation, SoftDeleteConfigMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SoftDeleteConfigMutation, SoftDeleteConfigMutationVariables>(SoftDeleteConfigDocument, options);
      }
export type SoftDeleteConfigMutationHookResult = ReturnType<typeof useSoftDeleteConfigMutation>;
export const RestoreConfigDocument = gql`
    mutation RestoreConfig($id: uuid!, $updated_by: uuid!) {
  update_master_config_by_pk(
    pk_columns: {id: $id}
    _set: {is_deleted: false, updated_by: $updated_by, updated_date: "now()"}
  ) {
    id
    code
    config_key
    is_deleted
    updated_by
    updated_date
  }
}
    `;

/**
 * __useRestoreConfigMutation__
 *
 * To run a mutation, you first call `useRestoreConfigMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRestoreConfigMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [restoreConfigMutation, { data, loading, error }] = useRestoreConfigMutation({
 *   variables: {
 *      id: // value for 'id'
 *      updated_by: // value for 'updated_by'
 *   },
 * });
 */
export function useRestoreConfigMutation(baseOptions?: Apollo.MutationHookOptions<RestoreConfigMutation, RestoreConfigMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RestoreConfigMutation, RestoreConfigMutationVariables>(RestoreConfigDocument, options);
      }
export type RestoreConfigMutationHookResult = ReturnType<typeof useRestoreConfigMutation>;
export const CheckConfigCodeExistsDocument = gql`
    query CheckConfigCodeExists($code: String!) {
  master_config(where: {code: {_eq: $code}, is_deleted: {_eq: false}}) {
    id
    code
  }
}
    `;

/**
 * __useCheckConfigCodeExistsQuery__
 *
 * To run a query within a React component, call `useCheckConfigCodeExistsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckConfigCodeExistsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckConfigCodeExistsQuery({
 *   variables: {
 *      code: // value for 'code'
 *   },
 * });
 */
export function useCheckConfigCodeExistsQuery(baseOptions: Apollo.QueryHookOptions<CheckConfigCodeExistsQuery, CheckConfigCodeExistsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CheckConfigCodeExistsQuery, CheckConfigCodeExistsQueryVariables>(CheckConfigCodeExistsDocument, options);
      }
export function useCheckConfigCodeExistsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CheckConfigCodeExistsQuery, CheckConfigCodeExistsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CheckConfigCodeExistsQuery, CheckConfigCodeExistsQueryVariables>(CheckConfigCodeExistsDocument, options);
        }
export type CheckConfigCodeExistsQueryHookResult = ReturnType<typeof useCheckConfigCodeExistsQuery>;
export type CheckConfigCodeExistsLazyQueryHookResult = ReturnType<typeof useCheckConfigCodeExistsLazyQuery>;
export const CheckConfigKeyExistsDocument = gql`
    query CheckConfigKeyExists($config_type: String!, $config_key: String!) {
  master_config(
    where: {config_type: {_eq: $config_type}, config_key: {_eq: $config_key}, is_deleted: {_eq: false}}
  ) {
    id
    config_type
    config_key
  }
}
    `;

/**
 * __useCheckConfigKeyExistsQuery__
 *
 * To run a query within a React component, call `useCheckConfigKeyExistsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckConfigKeyExistsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckConfigKeyExistsQuery({
 *   variables: {
 *      config_type: // value for 'config_type'
 *      config_key: // value for 'config_key'
 *   },
 * });
 */
export function useCheckConfigKeyExistsQuery(baseOptions: Apollo.QueryHookOptions<CheckConfigKeyExistsQuery, CheckConfigKeyExistsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CheckConfigKeyExistsQuery, CheckConfigKeyExistsQueryVariables>(CheckConfigKeyExistsDocument, options);
      }
export function useCheckConfigKeyExistsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CheckConfigKeyExistsQuery, CheckConfigKeyExistsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CheckConfigKeyExistsQuery, CheckConfigKeyExistsQueryVariables>(CheckConfigKeyExistsDocument, options);
        }
export type CheckConfigKeyExistsQueryHookResult = ReturnType<typeof useCheckConfigKeyExistsQuery>;
export type CheckConfigKeyExistsLazyQueryHookResult = ReturnType<typeof useCheckConfigKeyExistsLazyQuery>;