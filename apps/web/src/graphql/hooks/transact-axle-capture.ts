import * as Types from '../schema/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetAxleCapturesQueryVariables = Types.Exact<{
  limit: Types.Scalars['Int']['input'];
  offset: Types.Scalars['Int']['input'];
  where?: Types.InputMaybe<Types.Transact_Axle_Capture_Bool_Exp>;
}>;


export type GetAxleCapturesQuery = { transact_axle_capture: Array<{ id: any, external_id?: string | null, plate_no?: string | null, captured_at?: any | null, camera_id?: string | null, length_mm?: number | null, total_wheels?: number | null, total_axles?: number | null, vehicle_category?: string | null, vehicle_body_type?: string | null, minio_bucket?: string | null, minio_date_folder?: string | null, minio_xml_object?: string | null, minio_image_object?: string | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null }>, transact_axle_capture_aggregate: { aggregate?: { count: number } | null } };

export type GetAxleCaptureByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
}>;


export type GetAxleCaptureByIdQuery = { transact_axle_capture_by_pk?: { id: any, external_id?: string | null, plate_no?: string | null, captured_at?: any | null, camera_id?: string | null, length_mm?: number | null, total_wheels?: number | null, total_axles?: number | null, vehicle_category?: string | null, vehicle_body_type?: string | null, minio_bucket?: string | null, minio_date_folder?: string | null, minio_xml_object?: string | null, minio_image_object?: string | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null } | null };

export type GetAxleCapturesByPlateQueryVariables = Types.Exact<{
  plate_no: Types.Scalars['String']['input'];
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetAxleCapturesByPlateQuery = { transact_axle_capture: Array<{ id: any, external_id?: string | null, plate_no?: string | null, captured_at?: any | null, camera_id?: string | null, total_axles?: number | null, vehicle_category?: string | null, vehicle_body_type?: string | null, minio_image_object?: string | null }> };

export type GetAxleCapturesByDateRangeQueryVariables = Types.Exact<{
  start_date: Types.Scalars['timestamptz']['input'];
  end_date: Types.Scalars['timestamptz']['input'];
}>;


export type GetAxleCapturesByDateRangeQuery = { transact_axle_capture: Array<{ id: any, external_id?: string | null, plate_no?: string | null, captured_at?: any | null, camera_id?: string | null, total_axles?: number | null, vehicle_category?: string | null }> };

export type InsertAxleCaptureMutationVariables = Types.Exact<{
  object: Types.Transact_Axle_Capture_Insert_Input;
}>;


export type InsertAxleCaptureMutation = { insert_transact_axle_capture_one?: { id: any, external_id?: string | null, plate_no?: string | null, captured_at?: any | null, camera_id?: string | null, total_axles?: number | null, vehicle_category?: string | null, created_date?: any | null, session_id?: any | null } | null };

export type UpdateAxleCaptureMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  set: Types.Transact_Axle_Capture_Set_Input;
}>;


export type UpdateAxleCaptureMutation = { update_transact_axle_capture_by_pk?: { id: any, external_id?: string | null, plate_no?: string | null, captured_at?: any | null, total_axles?: number | null, updated_by?: any | null, updated_date?: any | null } | null };

export type SoftDeleteAxleCaptureMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  updated_by: Types.Scalars['uuid']['input'];
}>;


export type SoftDeleteAxleCaptureMutation = { update_transact_axle_capture_by_pk?: { id: any, external_id?: string | null, plate_no?: string | null, is_deleted?: boolean | null, is_active?: boolean | null, updated_by?: any | null, updated_date?: any | null } | null };

export type SubscribeLatestAxleCaptureSubscriptionVariables = Types.Exact<{
  session_id: Types.Scalars['uuid']['input'];
  site_id?: Types.InputMaybe<Types.Scalars['uuid']['input']>;
}>;


export type SubscribeLatestAxleCaptureSubscription = { transact_axle_capture: Array<{ id: any, external_id?: string | null, plate_no?: string | null, captured_at?: any | null, camera_id?: string | null, length_mm?: number | null, total_wheels?: number | null, total_axles?: number | null, vehicle_category?: string | null, vehicle_body_type?: string | null, minio_bucket?: string | null, minio_date_folder?: string | null, minio_image_object?: string | null, updated_date?: any | null, site_id?: any | null, created_date?: any | null }> };


export const GetAxleCapturesDocument = gql`
    query GetAxleCaptures($limit: Int!, $offset: Int!, $where: transact_axle_capture_bool_exp = {}) {
  transact_axle_capture(
    where: {_and: [{is_deleted: {_eq: false}}, $where]}
    limit: $limit
    offset: $offset
    order_by: {captured_at: desc}
  ) {
    id
    external_id
    plate_no
    captured_at
    camera_id
    length_mm
    total_wheels
    total_axles
    vehicle_category
    vehicle_body_type
    minio_bucket
    minio_date_folder
    minio_xml_object
    minio_image_object
    is_active
    is_deleted
    created_by
    created_date
    updated_by
    updated_date
  }
  transact_axle_capture_aggregate(
    where: {_and: [{is_deleted: {_eq: false}}, $where]}
  ) {
    aggregate {
      count
    }
  }
}
    `;

/**
 * __useGetAxleCapturesQuery__
 *
 * To run a query within a React component, call `useGetAxleCapturesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAxleCapturesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAxleCapturesQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetAxleCapturesQuery(baseOptions: Apollo.QueryHookOptions<GetAxleCapturesQuery, GetAxleCapturesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAxleCapturesQuery, GetAxleCapturesQueryVariables>(GetAxleCapturesDocument, options);
      }
export function useGetAxleCapturesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAxleCapturesQuery, GetAxleCapturesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAxleCapturesQuery, GetAxleCapturesQueryVariables>(GetAxleCapturesDocument, options);
        }
export type GetAxleCapturesQueryHookResult = ReturnType<typeof useGetAxleCapturesQuery>;
export type GetAxleCapturesLazyQueryHookResult = ReturnType<typeof useGetAxleCapturesLazyQuery>;
export const GetAxleCaptureByIdDocument = gql`
    query GetAxleCaptureById($id: uuid!) {
  transact_axle_capture_by_pk(id: $id) {
    id
    external_id
    plate_no
    captured_at
    camera_id
    length_mm
    total_wheels
    total_axles
    vehicle_category
    vehicle_body_type
    minio_bucket
    minio_date_folder
    minio_xml_object
    minio_image_object
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
 * __useGetAxleCaptureByIdQuery__
 *
 * To run a query within a React component, call `useGetAxleCaptureByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAxleCaptureByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAxleCaptureByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetAxleCaptureByIdQuery(baseOptions: Apollo.QueryHookOptions<GetAxleCaptureByIdQuery, GetAxleCaptureByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAxleCaptureByIdQuery, GetAxleCaptureByIdQueryVariables>(GetAxleCaptureByIdDocument, options);
      }
export function useGetAxleCaptureByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAxleCaptureByIdQuery, GetAxleCaptureByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAxleCaptureByIdQuery, GetAxleCaptureByIdQueryVariables>(GetAxleCaptureByIdDocument, options);
        }
export type GetAxleCaptureByIdQueryHookResult = ReturnType<typeof useGetAxleCaptureByIdQuery>;
export type GetAxleCaptureByIdLazyQueryHookResult = ReturnType<typeof useGetAxleCaptureByIdLazyQuery>;
export const GetAxleCapturesByPlateDocument = gql`
    query GetAxleCapturesByPlate($plate_no: String!, $limit: Int = 10) {
  transact_axle_capture(
    where: {plate_no: {_ilike: $plate_no}, is_deleted: {_eq: false}}
    limit: $limit
    order_by: {captured_at: desc}
  ) {
    id
    external_id
    plate_no
    captured_at
    camera_id
    total_axles
    vehicle_category
    vehicle_body_type
    minio_image_object
  }
}
    `;

/**
 * __useGetAxleCapturesByPlateQuery__
 *
 * To run a query within a React component, call `useGetAxleCapturesByPlateQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAxleCapturesByPlateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAxleCapturesByPlateQuery({
 *   variables: {
 *      plate_no: // value for 'plate_no'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useGetAxleCapturesByPlateQuery(baseOptions: Apollo.QueryHookOptions<GetAxleCapturesByPlateQuery, GetAxleCapturesByPlateQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAxleCapturesByPlateQuery, GetAxleCapturesByPlateQueryVariables>(GetAxleCapturesByPlateDocument, options);
      }
export function useGetAxleCapturesByPlateLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAxleCapturesByPlateQuery, GetAxleCapturesByPlateQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAxleCapturesByPlateQuery, GetAxleCapturesByPlateQueryVariables>(GetAxleCapturesByPlateDocument, options);
        }
export type GetAxleCapturesByPlateQueryHookResult = ReturnType<typeof useGetAxleCapturesByPlateQuery>;
export type GetAxleCapturesByPlateLazyQueryHookResult = ReturnType<typeof useGetAxleCapturesByPlateLazyQuery>;
export const GetAxleCapturesByDateRangeDocument = gql`
    query GetAxleCapturesByDateRange($start_date: timestamptz!, $end_date: timestamptz!) {
  transact_axle_capture(
    where: {captured_at: {_gte: $start_date, _lte: $end_date}, is_deleted: {_eq: false}}
    order_by: {captured_at: desc}
  ) {
    id
    external_id
    plate_no
    captured_at
    camera_id
    total_axles
    vehicle_category
  }
}
    `;

/**
 * __useGetAxleCapturesByDateRangeQuery__
 *
 * To run a query within a React component, call `useGetAxleCapturesByDateRangeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAxleCapturesByDateRangeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAxleCapturesByDateRangeQuery({
 *   variables: {
 *      start_date: // value for 'start_date'
 *      end_date: // value for 'end_date'
 *   },
 * });
 */
export function useGetAxleCapturesByDateRangeQuery(baseOptions: Apollo.QueryHookOptions<GetAxleCapturesByDateRangeQuery, GetAxleCapturesByDateRangeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAxleCapturesByDateRangeQuery, GetAxleCapturesByDateRangeQueryVariables>(GetAxleCapturesByDateRangeDocument, options);
      }
export function useGetAxleCapturesByDateRangeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAxleCapturesByDateRangeQuery, GetAxleCapturesByDateRangeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAxleCapturesByDateRangeQuery, GetAxleCapturesByDateRangeQueryVariables>(GetAxleCapturesByDateRangeDocument, options);
        }
export type GetAxleCapturesByDateRangeQueryHookResult = ReturnType<typeof useGetAxleCapturesByDateRangeQuery>;
export type GetAxleCapturesByDateRangeLazyQueryHookResult = ReturnType<typeof useGetAxleCapturesByDateRangeLazyQuery>;
export const InsertAxleCaptureDocument = gql`
    mutation InsertAxleCapture($object: transact_axle_capture_insert_input!) {
  insert_transact_axle_capture_one(object: $object) {
    id
    external_id
    plate_no
    captured_at
    camera_id
    total_axles
    vehicle_category
    created_date
    session_id
  }
}
    `;

/**
 * __useInsertAxleCaptureMutation__
 *
 * To run a mutation, you first call `useInsertAxleCaptureMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertAxleCaptureMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertAxleCaptureMutation, { data, loading, error }] = useInsertAxleCaptureMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useInsertAxleCaptureMutation(baseOptions?: Apollo.MutationHookOptions<InsertAxleCaptureMutation, InsertAxleCaptureMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertAxleCaptureMutation, InsertAxleCaptureMutationVariables>(InsertAxleCaptureDocument, options);
      }
export type InsertAxleCaptureMutationHookResult = ReturnType<typeof useInsertAxleCaptureMutation>;
export const UpdateAxleCaptureDocument = gql`
    mutation UpdateAxleCapture($id: uuid!, $set: transact_axle_capture_set_input!) {
  update_transact_axle_capture_by_pk(pk_columns: {id: $id}, _set: $set) {
    id
    external_id
    plate_no
    captured_at
    total_axles
    updated_by
    updated_date
  }
}
    `;

/**
 * __useUpdateAxleCaptureMutation__
 *
 * To run a mutation, you first call `useUpdateAxleCaptureMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAxleCaptureMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAxleCaptureMutation, { data, loading, error }] = useUpdateAxleCaptureMutation({
 *   variables: {
 *      id: // value for 'id'
 *      set: // value for 'set'
 *   },
 * });
 */
export function useUpdateAxleCaptureMutation(baseOptions?: Apollo.MutationHookOptions<UpdateAxleCaptureMutation, UpdateAxleCaptureMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateAxleCaptureMutation, UpdateAxleCaptureMutationVariables>(UpdateAxleCaptureDocument, options);
      }
export type UpdateAxleCaptureMutationHookResult = ReturnType<typeof useUpdateAxleCaptureMutation>;
export const SoftDeleteAxleCaptureDocument = gql`
    mutation SoftDeleteAxleCapture($id: uuid!, $updated_by: uuid!) {
  update_transact_axle_capture_by_pk(
    pk_columns: {id: $id}
    _set: {is_deleted: true, is_active: false, updated_by: $updated_by, updated_date: "now()"}
  ) {
    id
    external_id
    plate_no
    is_deleted
    is_active
    updated_by
    updated_date
  }
}
    `;

/**
 * __useSoftDeleteAxleCaptureMutation__
 *
 * To run a mutation, you first call `useSoftDeleteAxleCaptureMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSoftDeleteAxleCaptureMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [softDeleteAxleCaptureMutation, { data, loading, error }] = useSoftDeleteAxleCaptureMutation({
 *   variables: {
 *      id: // value for 'id'
 *      updated_by: // value for 'updated_by'
 *   },
 * });
 */
export function useSoftDeleteAxleCaptureMutation(baseOptions?: Apollo.MutationHookOptions<SoftDeleteAxleCaptureMutation, SoftDeleteAxleCaptureMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SoftDeleteAxleCaptureMutation, SoftDeleteAxleCaptureMutationVariables>(SoftDeleteAxleCaptureDocument, options);
      }
export type SoftDeleteAxleCaptureMutationHookResult = ReturnType<typeof useSoftDeleteAxleCaptureMutation>;
export const SubscribeLatestAxleCaptureDocument = gql`
    subscription SubscribeLatestAxleCapture($session_id: uuid!, $site_id: uuid) {
  transact_axle_capture(
    where: {is_deleted: {_eq: false}, session_id: {_eq: $session_id}, site_id: {_eq: $site_id}}
    order_by: [{updated_date: desc_nulls_last}, {created_date: desc}]
    limit: 1
  ) {
    id
    external_id
    plate_no
    captured_at
    camera_id
    length_mm
    total_wheels
    total_axles
    vehicle_category
    vehicle_body_type
    minio_bucket
    minio_date_folder
    minio_image_object
    updated_date
    site_id
    created_date
  }
}
    `;

/**
 * __useSubscribeLatestAxleCaptureSubscription__
 *
 * To run a query within a React component, call `useSubscribeLatestAxleCaptureSubscription` and pass it any options that fit your needs.
 * When your component renders, `useSubscribeLatestAxleCaptureSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSubscribeLatestAxleCaptureSubscription({
 *   variables: {
 *      session_id: // value for 'session_id'
 *      site_id: // value for 'site_id'
 *   },
 * });
 */
export function useSubscribeLatestAxleCaptureSubscription(baseOptions: Apollo.SubscriptionHookOptions<SubscribeLatestAxleCaptureSubscription, SubscribeLatestAxleCaptureSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<SubscribeLatestAxleCaptureSubscription, SubscribeLatestAxleCaptureSubscriptionVariables>(SubscribeLatestAxleCaptureDocument, options);
      }
export type SubscribeLatestAxleCaptureSubscriptionHookResult = ReturnType<typeof useSubscribeLatestAxleCaptureSubscription>;