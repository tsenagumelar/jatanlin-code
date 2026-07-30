import * as Types from '../schema/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetDimensionsQueryVariables = Types.Exact<{
  limit: Types.Scalars['Int']['input'];
  offset: Types.Scalars['Int']['input'];
  where?: Types.InputMaybe<Types.Transact_Dimension_Bool_Exp>;
}>;


export type GetDimensionsQuery = { transact_dimension: Array<{ id: any, anpr_id?: any | null, filepath?: string | null, length?: any | null, width?: any | null, height?: any | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, site_id?: any | null }>, transact_dimension_aggregate: { aggregate?: { count: number } | null } };

export type GetDimensionByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
}>;


export type GetDimensionByIdQuery = { transact_dimension_by_pk?: { id: any, anpr_id?: any | null, filepath?: string | null, length?: any | null, width?: any | null, height?: any | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, site_id?: any | null, session_id?: any | null } | null };

export type GetDimensionsByAnprIdQueryVariables = Types.Exact<{
  anpr_id: Types.Scalars['uuid']['input'];
}>;


export type GetDimensionsByAnprIdQuery = { transact_dimension: Array<{ id: any, anpr_id?: any | null, filepath?: string | null, length?: any | null, width?: any | null, height?: any | null, is_active?: boolean | null, created_date?: any | null, updated_date?: any | null, site_id?: any | null }> };

export type GetDimensionsBySiteQueryVariables = Types.Exact<{
  site_id: Types.Scalars['uuid']['input'];
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetDimensionsBySiteQuery = { transact_dimension: Array<{ id: any, anpr_id?: any | null, filepath?: string | null, length?: any | null, width?: any | null, height?: any | null, created_date?: any | null }> };

export type InsertDimensionMutationVariables = Types.Exact<{
  object: Types.Transact_Dimension_Insert_Input;
}>;


export type InsertDimensionMutation = { insert_transact_dimension_one?: { id: any, anpr_id?: any | null, filepath?: string | null, length?: any | null, width?: any | null, height?: any | null, created_date?: any | null, site_id?: any | null } | null };

export type UpdateDimensionMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  set: Types.Transact_Dimension_Set_Input;
}>;


export type UpdateDimensionMutation = { update_transact_dimension_by_pk?: { id: any, anpr_id?: any | null, filepath?: string | null, length?: any | null, width?: any | null, height?: any | null, updated_by?: any | null, updated_date?: any | null } | null };

export type SoftDeleteDimensionMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  updated_by: Types.Scalars['uuid']['input'];
}>;


export type SoftDeleteDimensionMutation = { update_transact_dimension_by_pk?: { id: any, anpr_id?: any | null, is_deleted?: boolean | null, is_active?: boolean | null, updated_by?: any | null, updated_date?: any | null } | null };

export type SubscribeLatestDimensionSubscriptionVariables = Types.Exact<{
  session_id: Types.Scalars['uuid']['input'];
  site_id?: Types.InputMaybe<Types.Scalars['uuid']['input']>;
}>;


export type SubscribeLatestDimensionSubscription = { transact_dimension: Array<{ id: any, anpr_id?: any | null, filepath?: string | null, length?: any | null, width?: any | null, height?: any | null, is_active?: boolean | null, created_date?: any | null, site_id?: any | null }> };

export type SubscribeDimensionsByAnprSubscriptionVariables = Types.Exact<{
  anpr_id: Types.Scalars['uuid']['input'];
}>;


export type SubscribeDimensionsByAnprSubscription = { transact_dimension: Array<{ id: any, anpr_id?: any | null, filepath?: string | null, length?: any | null, width?: any | null, height?: any | null, is_active?: boolean | null, created_date?: any | null, updated_date?: any | null, site_id?: any | null }> };


export const GetDimensionsDocument = gql`
    query GetDimensions($limit: Int!, $offset: Int!, $where: transact_dimension_bool_exp = {}) {
  transact_dimension(
    where: {_and: [{is_deleted: {_eq: false}}, $where]}
    limit: $limit
    offset: $offset
    order_by: [{updated_date: desc_nulls_last}, {created_date: desc}]
  ) {
    id
    anpr_id
    filepath
    length
    width
    height
    is_active
    is_deleted
    created_by
    created_date
    updated_by
    updated_date
    site_id
  }
  transact_dimension_aggregate(
    where: {_and: [{is_deleted: {_eq: false}}, $where]}
  ) {
    aggregate {
      count
    }
  }
}
    `;

/**
 * __useGetDimensionsQuery__
 *
 * To run a query within a React component, call `useGetDimensionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDimensionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDimensionsQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetDimensionsQuery(baseOptions: Apollo.QueryHookOptions<GetDimensionsQuery, GetDimensionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetDimensionsQuery, GetDimensionsQueryVariables>(GetDimensionsDocument, options);
      }
export function useGetDimensionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDimensionsQuery, GetDimensionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetDimensionsQuery, GetDimensionsQueryVariables>(GetDimensionsDocument, options);
        }
export type GetDimensionsQueryHookResult = ReturnType<typeof useGetDimensionsQuery>;
export type GetDimensionsLazyQueryHookResult = ReturnType<typeof useGetDimensionsLazyQuery>;
export const GetDimensionByIdDocument = gql`
    query GetDimensionById($id: uuid!) {
  transact_dimension_by_pk(id: $id) {
    id
    anpr_id
    filepath
    length
    width
    height
    is_active
    is_deleted
    created_by
    created_date
    updated_by
    updated_date
    site_id
    session_id
  }
}
    `;

/**
 * __useGetDimensionByIdQuery__
 *
 * To run a query within a React component, call `useGetDimensionByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDimensionByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDimensionByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetDimensionByIdQuery(baseOptions: Apollo.QueryHookOptions<GetDimensionByIdQuery, GetDimensionByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetDimensionByIdQuery, GetDimensionByIdQueryVariables>(GetDimensionByIdDocument, options);
      }
export function useGetDimensionByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDimensionByIdQuery, GetDimensionByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetDimensionByIdQuery, GetDimensionByIdQueryVariables>(GetDimensionByIdDocument, options);
        }
export type GetDimensionByIdQueryHookResult = ReturnType<typeof useGetDimensionByIdQuery>;
export type GetDimensionByIdLazyQueryHookResult = ReturnType<typeof useGetDimensionByIdLazyQuery>;
export const GetDimensionsByAnprIdDocument = gql`
    query GetDimensionsByAnprId($anpr_id: uuid!) {
  transact_dimension(
    where: {anpr_id: {_eq: $anpr_id}, is_deleted: {_eq: false}}
    order_by: {created_date: desc}
  ) {
    id
    anpr_id
    filepath
    length
    width
    height
    is_active
    created_date
    updated_date
    site_id
  }
}
    `;

/**
 * __useGetDimensionsByAnprIdQuery__
 *
 * To run a query within a React component, call `useGetDimensionsByAnprIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDimensionsByAnprIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDimensionsByAnprIdQuery({
 *   variables: {
 *      anpr_id: // value for 'anpr_id'
 *   },
 * });
 */
export function useGetDimensionsByAnprIdQuery(baseOptions: Apollo.QueryHookOptions<GetDimensionsByAnprIdQuery, GetDimensionsByAnprIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetDimensionsByAnprIdQuery, GetDimensionsByAnprIdQueryVariables>(GetDimensionsByAnprIdDocument, options);
      }
export function useGetDimensionsByAnprIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDimensionsByAnprIdQuery, GetDimensionsByAnprIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetDimensionsByAnprIdQuery, GetDimensionsByAnprIdQueryVariables>(GetDimensionsByAnprIdDocument, options);
        }
export type GetDimensionsByAnprIdQueryHookResult = ReturnType<typeof useGetDimensionsByAnprIdQuery>;
export type GetDimensionsByAnprIdLazyQueryHookResult = ReturnType<typeof useGetDimensionsByAnprIdLazyQuery>;
export const GetDimensionsBySiteDocument = gql`
    query GetDimensionsBySite($site_id: uuid!, $limit: Int = 10) {
  transact_dimension(
    where: {site_id: {_eq: $site_id}, is_deleted: {_eq: false}}
    limit: $limit
    order_by: {created_date: desc}
  ) {
    id
    anpr_id
    filepath
    length
    width
    height
    created_date
  }
}
    `;

/**
 * __useGetDimensionsBySiteQuery__
 *
 * To run a query within a React component, call `useGetDimensionsBySiteQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDimensionsBySiteQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDimensionsBySiteQuery({
 *   variables: {
 *      site_id: // value for 'site_id'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useGetDimensionsBySiteQuery(baseOptions: Apollo.QueryHookOptions<GetDimensionsBySiteQuery, GetDimensionsBySiteQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetDimensionsBySiteQuery, GetDimensionsBySiteQueryVariables>(GetDimensionsBySiteDocument, options);
      }
export function useGetDimensionsBySiteLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDimensionsBySiteQuery, GetDimensionsBySiteQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetDimensionsBySiteQuery, GetDimensionsBySiteQueryVariables>(GetDimensionsBySiteDocument, options);
        }
export type GetDimensionsBySiteQueryHookResult = ReturnType<typeof useGetDimensionsBySiteQuery>;
export type GetDimensionsBySiteLazyQueryHookResult = ReturnType<typeof useGetDimensionsBySiteLazyQuery>;
export const InsertDimensionDocument = gql`
    mutation InsertDimension($object: transact_dimension_insert_input!) {
  insert_transact_dimension_one(object: $object) {
    id
    anpr_id
    filepath
    length
    width
    height
    created_date
    site_id
  }
}
    `;

/**
 * __useInsertDimensionMutation__
 *
 * To run a mutation, you first call `useInsertDimensionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertDimensionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertDimensionMutation, { data, loading, error }] = useInsertDimensionMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useInsertDimensionMutation(baseOptions?: Apollo.MutationHookOptions<InsertDimensionMutation, InsertDimensionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertDimensionMutation, InsertDimensionMutationVariables>(InsertDimensionDocument, options);
      }
export type InsertDimensionMutationHookResult = ReturnType<typeof useInsertDimensionMutation>;
export const UpdateDimensionDocument = gql`
    mutation UpdateDimension($id: uuid!, $set: transact_dimension_set_input!) {
  update_transact_dimension_by_pk(pk_columns: {id: $id}, _set: $set) {
    id
    anpr_id
    filepath
    length
    width
    height
    updated_by
    updated_date
  }
}
    `;

/**
 * __useUpdateDimensionMutation__
 *
 * To run a mutation, you first call `useUpdateDimensionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateDimensionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateDimensionMutation, { data, loading, error }] = useUpdateDimensionMutation({
 *   variables: {
 *      id: // value for 'id'
 *      set: // value for 'set'
 *   },
 * });
 */
export function useUpdateDimensionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateDimensionMutation, UpdateDimensionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateDimensionMutation, UpdateDimensionMutationVariables>(UpdateDimensionDocument, options);
      }
export type UpdateDimensionMutationHookResult = ReturnType<typeof useUpdateDimensionMutation>;
export const SoftDeleteDimensionDocument = gql`
    mutation SoftDeleteDimension($id: uuid!, $updated_by: uuid!) {
  update_transact_dimension_by_pk(
    pk_columns: {id: $id}
    _set: {is_deleted: true, is_active: false, updated_by: $updated_by, updated_date: "now()"}
  ) {
    id
    anpr_id
    is_deleted
    is_active
    updated_by
    updated_date
  }
}
    `;

/**
 * __useSoftDeleteDimensionMutation__
 *
 * To run a mutation, you first call `useSoftDeleteDimensionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSoftDeleteDimensionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [softDeleteDimensionMutation, { data, loading, error }] = useSoftDeleteDimensionMutation({
 *   variables: {
 *      id: // value for 'id'
 *      updated_by: // value for 'updated_by'
 *   },
 * });
 */
export function useSoftDeleteDimensionMutation(baseOptions?: Apollo.MutationHookOptions<SoftDeleteDimensionMutation, SoftDeleteDimensionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SoftDeleteDimensionMutation, SoftDeleteDimensionMutationVariables>(SoftDeleteDimensionDocument, options);
      }
export type SoftDeleteDimensionMutationHookResult = ReturnType<typeof useSoftDeleteDimensionMutation>;
export const SubscribeLatestDimensionDocument = gql`
    subscription SubscribeLatestDimension($session_id: uuid!, $site_id: uuid) {
  transact_dimension(
    where: {is_deleted: {_eq: false}, session_id: {_eq: $session_id}, site_id: {_eq: $site_id}}
    order_by: {created_date: desc}
    limit: 1
  ) {
    id
    anpr_id
    filepath
    length
    width
    height
    is_active
    created_date
    site_id
  }
}
    `;

/**
 * __useSubscribeLatestDimensionSubscription__
 *
 * To run a query within a React component, call `useSubscribeLatestDimensionSubscription` and pass it any options that fit your needs.
 * When your component renders, `useSubscribeLatestDimensionSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSubscribeLatestDimensionSubscription({
 *   variables: {
 *      session_id: // value for 'session_id'
 *      site_id: // value for 'site_id'
 *   },
 * });
 */
export function useSubscribeLatestDimensionSubscription(baseOptions: Apollo.SubscriptionHookOptions<SubscribeLatestDimensionSubscription, SubscribeLatestDimensionSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<SubscribeLatestDimensionSubscription, SubscribeLatestDimensionSubscriptionVariables>(SubscribeLatestDimensionDocument, options);
      }
export type SubscribeLatestDimensionSubscriptionHookResult = ReturnType<typeof useSubscribeLatestDimensionSubscription>;
export const SubscribeDimensionsByAnprDocument = gql`
    subscription SubscribeDimensionsByAnpr($anpr_id: uuid!) {
  transact_dimension(
    where: {is_deleted: {_eq: false}, anpr_id: {_eq: $anpr_id}}
    order_by: {created_date: desc}
  ) {
    id
    anpr_id
    filepath
    length
    width
    height
    is_active
    created_date
    updated_date
    site_id
  }
}
    `;

/**
 * __useSubscribeDimensionsByAnprSubscription__
 *
 * To run a query within a React component, call `useSubscribeDimensionsByAnprSubscription` and pass it any options that fit your needs.
 * When your component renders, `useSubscribeDimensionsByAnprSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSubscribeDimensionsByAnprSubscription({
 *   variables: {
 *      anpr_id: // value for 'anpr_id'
 *   },
 * });
 */
export function useSubscribeDimensionsByAnprSubscription(baseOptions: Apollo.SubscriptionHookOptions<SubscribeDimensionsByAnprSubscription, SubscribeDimensionsByAnprSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<SubscribeDimensionsByAnprSubscription, SubscribeDimensionsByAnprSubscriptionVariables>(SubscribeDimensionsByAnprDocument, options);
      }
export type SubscribeDimensionsByAnprSubscriptionHookResult = ReturnType<typeof useSubscribeDimensionsByAnprSubscription>;