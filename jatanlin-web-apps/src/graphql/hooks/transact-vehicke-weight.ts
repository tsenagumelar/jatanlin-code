import * as Types from '../schema/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetWeighingsQueryVariables = Types.Exact<{
  limit: Types.Scalars['Int']['input'];
  offset: Types.Scalars['Int']['input'];
  where?: Types.InputMaybe<Types.Transact_Weighing_Bool_Exp>;
}>;


export type GetWeighingsQuery = { transact_weighing: Array<{ id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, site_id?: any | null }>, transact_weighing_aggregate: { aggregate?: { count: number } | null } };

export type GetWeighingByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
}>;


export type GetWeighingByIdQuery = { transact_weighing_by_pk?: { id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, site_id?: any | null, session_id?: any | null } | null };

export type GetWeighingsBySiteQueryVariables = Types.Exact<{
  site_id: Types.Scalars['uuid']['input'];
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetWeighingsBySiteQuery = { transact_weighing: Array<{ id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, created_date?: any | null, site_id?: any | null }> };

export type GetWeighingsByDateRangeQueryVariables = Types.Exact<{
  start_date: Types.Scalars['timestamptz']['input'];
  end_date: Types.Scalars['timestamptz']['input'];
}>;


export type GetWeighingsByDateRangeQuery = { transact_weighing: Array<{ id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, created_date?: any | null, site_id?: any | null }> };

export type InsertWeighingMutationVariables = Types.Exact<{
  object: Types.Transact_Weighing_Insert_Input;
}>;


export type InsertWeighingMutation = { insert_transact_weighing_one?: { id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, created_date?: any | null, site_id?: any | null } | null };

export type UpdateWeighingMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  set: Types.Transact_Weighing_Set_Input;
}>;


export type UpdateWeighingMutation = { update_transact_weighing_by_pk?: { id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, updated_by?: any | null, updated_date?: any | null } | null };

export type SoftDeleteWeighingMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  updated_by: Types.Scalars['uuid']['input'];
}>;


export type SoftDeleteWeighingMutation = { update_transact_weighing_by_pk?: { id: any, is_deleted?: boolean | null, is_active?: boolean | null, updated_by?: any | null, updated_date?: any | null } | null };

export type SubscribeLatestWeighingSubscriptionVariables = Types.Exact<{
  session_id: Types.Scalars['uuid']['input'];
  site_id?: Types.InputMaybe<Types.Scalars['uuid']['input']>;
}>;


export type SubscribeLatestWeighingSubscription = { transact_weighing: Array<{ id: any, total_axle?: number | null, axle_detail?: any | null, total_weight?: any | null, is_active?: boolean | null, created_date?: any | null, updated_date?: any | null, site_id?: any | null }> };


export const GetWeighingsDocument = gql`
    query GetWeighings($limit: Int!, $offset: Int!, $where: transact_weighing_bool_exp = {}) {
  transact_weighing(
    where: {_and: [{is_deleted: {_eq: false}}, $where]}
    limit: $limit
    offset: $offset
    order_by: [{updated_date: desc_nulls_last}, {created_date: desc}]
  ) {
    id
    total_axle
    axle_detail
    total_weight
    is_active
    is_deleted
    created_by
    created_date
    updated_by
    updated_date
    site_id
  }
  transact_weighing_aggregate(where: {_and: [{is_deleted: {_eq: false}}, $where]}) {
    aggregate {
      count
    }
  }
}
    `;

/**
 * __useGetWeighingsQuery__
 *
 * To run a query within a React component, call `useGetWeighingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWeighingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWeighingsQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetWeighingsQuery(baseOptions: Apollo.QueryHookOptions<GetWeighingsQuery, GetWeighingsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWeighingsQuery, GetWeighingsQueryVariables>(GetWeighingsDocument, options);
      }
export function useGetWeighingsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWeighingsQuery, GetWeighingsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWeighingsQuery, GetWeighingsQueryVariables>(GetWeighingsDocument, options);
        }
export type GetWeighingsQueryHookResult = ReturnType<typeof useGetWeighingsQuery>;
export type GetWeighingsLazyQueryHookResult = ReturnType<typeof useGetWeighingsLazyQuery>;
export const GetWeighingByIdDocument = gql`
    query GetWeighingById($id: uuid!) {
  transact_weighing_by_pk(id: $id) {
    id
    total_axle
    axle_detail
    total_weight
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
 * __useGetWeighingByIdQuery__
 *
 * To run a query within a React component, call `useGetWeighingByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWeighingByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWeighingByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetWeighingByIdQuery(baseOptions: Apollo.QueryHookOptions<GetWeighingByIdQuery, GetWeighingByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWeighingByIdQuery, GetWeighingByIdQueryVariables>(GetWeighingByIdDocument, options);
      }
export function useGetWeighingByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWeighingByIdQuery, GetWeighingByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWeighingByIdQuery, GetWeighingByIdQueryVariables>(GetWeighingByIdDocument, options);
        }
export type GetWeighingByIdQueryHookResult = ReturnType<typeof useGetWeighingByIdQuery>;
export type GetWeighingByIdLazyQueryHookResult = ReturnType<typeof useGetWeighingByIdLazyQuery>;
export const GetWeighingsBySiteDocument = gql`
    query GetWeighingsBySite($site_id: uuid!, $limit: Int = 10) {
  transact_weighing(
    where: {site_id: {_eq: $site_id}, is_deleted: {_eq: false}}
    limit: $limit
    order_by: {created_date: desc}
  ) {
    id
    total_axle
    axle_detail
    total_weight
    created_date
    site_id
  }
}
    `;

/**
 * __useGetWeighingsBySiteQuery__
 *
 * To run a query within a React component, call `useGetWeighingsBySiteQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWeighingsBySiteQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWeighingsBySiteQuery({
 *   variables: {
 *      site_id: // value for 'site_id'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useGetWeighingsBySiteQuery(baseOptions: Apollo.QueryHookOptions<GetWeighingsBySiteQuery, GetWeighingsBySiteQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWeighingsBySiteQuery, GetWeighingsBySiteQueryVariables>(GetWeighingsBySiteDocument, options);
      }
export function useGetWeighingsBySiteLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWeighingsBySiteQuery, GetWeighingsBySiteQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWeighingsBySiteQuery, GetWeighingsBySiteQueryVariables>(GetWeighingsBySiteDocument, options);
        }
export type GetWeighingsBySiteQueryHookResult = ReturnType<typeof useGetWeighingsBySiteQuery>;
export type GetWeighingsBySiteLazyQueryHookResult = ReturnType<typeof useGetWeighingsBySiteLazyQuery>;
export const GetWeighingsByDateRangeDocument = gql`
    query GetWeighingsByDateRange($start_date: timestamptz!, $end_date: timestamptz!) {
  transact_weighing(
    where: {created_date: {_gte: $start_date, _lte: $end_date}, is_deleted: {_eq: false}}
    order_by: {created_date: desc}
  ) {
    id
    total_axle
    axle_detail
    total_weight
    created_date
    site_id
  }
}
    `;

/**
 * __useGetWeighingsByDateRangeQuery__
 *
 * To run a query within a React component, call `useGetWeighingsByDateRangeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWeighingsByDateRangeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWeighingsByDateRangeQuery({
 *   variables: {
 *      start_date: // value for 'start_date'
 *      end_date: // value for 'end_date'
 *   },
 * });
 */
export function useGetWeighingsByDateRangeQuery(baseOptions: Apollo.QueryHookOptions<GetWeighingsByDateRangeQuery, GetWeighingsByDateRangeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWeighingsByDateRangeQuery, GetWeighingsByDateRangeQueryVariables>(GetWeighingsByDateRangeDocument, options);
      }
export function useGetWeighingsByDateRangeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWeighingsByDateRangeQuery, GetWeighingsByDateRangeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWeighingsByDateRangeQuery, GetWeighingsByDateRangeQueryVariables>(GetWeighingsByDateRangeDocument, options);
        }
export type GetWeighingsByDateRangeQueryHookResult = ReturnType<typeof useGetWeighingsByDateRangeQuery>;
export type GetWeighingsByDateRangeLazyQueryHookResult = ReturnType<typeof useGetWeighingsByDateRangeLazyQuery>;
export const InsertWeighingDocument = gql`
    mutation InsertWeighing($object: transact_weighing_insert_input!) {
  insert_transact_weighing_one(object: $object) {
    id
    total_axle
    axle_detail
    total_weight
    created_date
    site_id
  }
}
    `;

/**
 * __useInsertWeighingMutation__
 *
 * To run a mutation, you first call `useInsertWeighingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertWeighingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertWeighingMutation, { data, loading, error }] = useInsertWeighingMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useInsertWeighingMutation(baseOptions?: Apollo.MutationHookOptions<InsertWeighingMutation, InsertWeighingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertWeighingMutation, InsertWeighingMutationVariables>(InsertWeighingDocument, options);
      }
export type InsertWeighingMutationHookResult = ReturnType<typeof useInsertWeighingMutation>;
export const UpdateWeighingDocument = gql`
    mutation UpdateWeighing($id: uuid!, $set: transact_weighing_set_input!) {
  update_transact_weighing_by_pk(pk_columns: {id: $id}, _set: $set) {
    id
    total_axle
    axle_detail
    total_weight
    updated_by
    updated_date
  }
}
    `;

/**
 * __useUpdateWeighingMutation__
 *
 * To run a mutation, you first call `useUpdateWeighingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWeighingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWeighingMutation, { data, loading, error }] = useUpdateWeighingMutation({
 *   variables: {
 *      id: // value for 'id'
 *      set: // value for 'set'
 *   },
 * });
 */
export function useUpdateWeighingMutation(baseOptions?: Apollo.MutationHookOptions<UpdateWeighingMutation, UpdateWeighingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateWeighingMutation, UpdateWeighingMutationVariables>(UpdateWeighingDocument, options);
      }
export type UpdateWeighingMutationHookResult = ReturnType<typeof useUpdateWeighingMutation>;
export const SoftDeleteWeighingDocument = gql`
    mutation SoftDeleteWeighing($id: uuid!, $updated_by: uuid!) {
  update_transact_weighing_by_pk(
    pk_columns: {id: $id}
    _set: {is_deleted: true, is_active: false, updated_by: $updated_by, updated_date: "now()"}
  ) {
    id
    is_deleted
    is_active
    updated_by
    updated_date
  }
}
    `;

/**
 * __useSoftDeleteWeighingMutation__
 *
 * To run a mutation, you first call `useSoftDeleteWeighingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSoftDeleteWeighingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [softDeleteWeighingMutation, { data, loading, error }] = useSoftDeleteWeighingMutation({
 *   variables: {
 *      id: // value for 'id'
 *      updated_by: // value for 'updated_by'
 *   },
 * });
 */
export function useSoftDeleteWeighingMutation(baseOptions?: Apollo.MutationHookOptions<SoftDeleteWeighingMutation, SoftDeleteWeighingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SoftDeleteWeighingMutation, SoftDeleteWeighingMutationVariables>(SoftDeleteWeighingDocument, options);
      }
export type SoftDeleteWeighingMutationHookResult = ReturnType<typeof useSoftDeleteWeighingMutation>;
export const SubscribeLatestWeighingDocument = gql`
    subscription SubscribeLatestWeighing($session_id: uuid!, $site_id: uuid) {
  transact_weighing(
    where: {is_deleted: {_eq: false}, session_id: {_eq: $session_id}, site_id: {_eq: $site_id}}
    order_by: {created_date: desc}
    limit: 1
  ) {
    id
    total_axle
    axle_detail
    total_weight
    is_active
    created_date
    updated_date
    site_id
  }
}
    `;

/**
 * __useSubscribeLatestWeighingSubscription__
 *
 * To run a query within a React component, call `useSubscribeLatestWeighingSubscription` and pass it any options that fit your needs.
 * When your component renders, `useSubscribeLatestWeighingSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSubscribeLatestWeighingSubscription({
 *   variables: {
 *      session_id: // value for 'session_id'
 *      site_id: // value for 'site_id'
 *   },
 * });
 */
export function useSubscribeLatestWeighingSubscription(baseOptions: Apollo.SubscriptionHookOptions<SubscribeLatestWeighingSubscription, SubscribeLatestWeighingSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<SubscribeLatestWeighingSubscription, SubscribeLatestWeighingSubscriptionVariables>(SubscribeLatestWeighingDocument, options);
      }
export type SubscribeLatestWeighingSubscriptionHookResult = ReturnType<typeof useSubscribeLatestWeighingSubscription>;
