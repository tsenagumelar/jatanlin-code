import * as Types from '../schema/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetAnprCapturesQueryVariables = Types.Exact<{
  limit: Types.Scalars['Int']['input'];
  offset: Types.Scalars['Int']['input'];
  where?: Types.InputMaybe<Types.Transact_Anpr_Capture_Bool_Exp>;
}>;


export type GetAnprCapturesQuery = { transact_anpr_capture: Array<{ id: any, external_id?: string | null, plate_no?: string | null, confidence?: any | null, captured_at?: any | null, location_code?: string | null, camera_id?: string | null, minio_bucket?: string | null, minio_date_folder?: string | null, minio_xml_object?: string | null, minio_full_image_object?: string | null, minio_plate_image_object?: string | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null }>, transact_anpr_capture_aggregate: { aggregate?: { count: number } | null } };

export type GetAnprCaptureByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
}>;


export type GetAnprCaptureByIdQuery = { transact_anpr_capture_by_pk?: { id: any, external_id?: string | null, plate_no?: string | null, confidence?: any | null, captured_at?: any | null, location_code?: string | null, camera_id?: string | null, minio_bucket?: string | null, minio_date_folder?: string | null, minio_xml_object?: string | null, minio_full_image_object?: string | null, minio_plate_image_object?: string | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null } | null };

export type GetAnprCapturesByPlateQueryVariables = Types.Exact<{
  plate_no: Types.Scalars['String']['input'];
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetAnprCapturesByPlateQuery = { transact_anpr_capture: Array<{ id: any, external_id?: string | null, plate_no?: string | null, confidence?: any | null, captured_at?: any | null, location_code?: string | null, camera_id?: string | null, minio_full_image_object?: string | null, minio_plate_image_object?: string | null }> };

export type GetAnprCapturesByDateRangeQueryVariables = Types.Exact<{
  start_date: Types.Scalars['timestamptz']['input'];
  end_date: Types.Scalars['timestamptz']['input'];
}>;


export type GetAnprCapturesByDateRangeQuery = { transact_anpr_capture: Array<{ id: any, external_id?: string | null, plate_no?: string | null, confidence?: any | null, captured_at?: any | null, location_code?: string | null, camera_id?: string | null }> };

export type InsertAnprCaptureMutationVariables = Types.Exact<{
  object: Types.Transact_Anpr_Capture_Insert_Input;
}>;


export type InsertAnprCaptureMutation = { insert_transact_anpr_capture_one?: { id: any, external_id?: string | null, plate_no?: string | null, confidence?: any | null, captured_at?: any | null, location_code?: string | null, camera_id?: string | null, created_date?: any | null } | null };

export type UpdateAnprCaptureMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  set: Types.Transact_Anpr_Capture_Set_Input;
}>;


export type UpdateAnprCaptureMutation = { update_transact_anpr_capture_by_pk?: { id: any, external_id?: string | null, plate_no?: string | null, confidence?: any | null, captured_at?: any | null, updated_by?: any | null, updated_date?: any | null } | null };

export type SoftDeleteAnprCaptureMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  updated_by: Types.Scalars['uuid']['input'];
}>;


export type SoftDeleteAnprCaptureMutation = { update_transact_anpr_capture_by_pk?: { id: any, external_id?: string | null, plate_no?: string | null, is_deleted?: boolean | null, is_active?: boolean | null, updated_by?: any | null, updated_date?: any | null } | null };

export type SubscribeLatestAnprCaptureSubscriptionVariables = Types.Exact<{
  session_id: Types.Scalars['uuid']['input'];
  site_id?: Types.InputMaybe<Types.Scalars['uuid']['input']>;
}>;


export type SubscribeLatestAnprCaptureSubscription = { transact_anpr_capture: Array<{ id: any, external_id?: string | null, plate_no?: string | null, confidence?: any | null, captured_at?: any | null, location_code?: string | null, camera_id?: string | null, minio_bucket?: string | null, minio_date_folder?: string | null, minio_full_image_object?: string | null, minio_plate_image_object?: string | null, site_id?: any | null, session_id?: any | null }> };


export const GetAnprCapturesDocument = gql`
    query GetAnprCaptures($limit: Int!, $offset: Int!, $where: transact_anpr_capture_bool_exp = {}) {
  transact_anpr_capture(
    where: {_and: [{is_deleted: {_eq: false}}, $where]}
    limit: $limit
    offset: $offset
    order_by: {captured_at: desc}
  ) {
    id
    external_id
    plate_no
    confidence
    captured_at
    location_code
    camera_id
    minio_bucket
    minio_date_folder
    minio_xml_object
    minio_full_image_object
    minio_plate_image_object
    is_active
    is_deleted
    created_by
    created_date
    updated_by
    updated_date
  }
  transact_anpr_capture_aggregate(
    where: {_and: [{is_deleted: {_eq: false}}, $where]}
  ) {
    aggregate {
      count
    }
  }
}
    `;

/**
 * __useGetAnprCapturesQuery__
 *
 * To run a query within a React component, call `useGetAnprCapturesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAnprCapturesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAnprCapturesQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetAnprCapturesQuery(baseOptions: Apollo.QueryHookOptions<GetAnprCapturesQuery, GetAnprCapturesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAnprCapturesQuery, GetAnprCapturesQueryVariables>(GetAnprCapturesDocument, options);
      }
export function useGetAnprCapturesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAnprCapturesQuery, GetAnprCapturesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAnprCapturesQuery, GetAnprCapturesQueryVariables>(GetAnprCapturesDocument, options);
        }
export type GetAnprCapturesQueryHookResult = ReturnType<typeof useGetAnprCapturesQuery>;
export type GetAnprCapturesLazyQueryHookResult = ReturnType<typeof useGetAnprCapturesLazyQuery>;
export const GetAnprCaptureByIdDocument = gql`
    query GetAnprCaptureById($id: uuid!) {
  transact_anpr_capture_by_pk(id: $id) {
    id
    external_id
    plate_no
    confidence
    captured_at
    location_code
    camera_id
    minio_bucket
    minio_date_folder
    minio_xml_object
    minio_full_image_object
    minio_plate_image_object
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
 * __useGetAnprCaptureByIdQuery__
 *
 * To run a query within a React component, call `useGetAnprCaptureByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAnprCaptureByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAnprCaptureByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetAnprCaptureByIdQuery(baseOptions: Apollo.QueryHookOptions<GetAnprCaptureByIdQuery, GetAnprCaptureByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAnprCaptureByIdQuery, GetAnprCaptureByIdQueryVariables>(GetAnprCaptureByIdDocument, options);
      }
export function useGetAnprCaptureByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAnprCaptureByIdQuery, GetAnprCaptureByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAnprCaptureByIdQuery, GetAnprCaptureByIdQueryVariables>(GetAnprCaptureByIdDocument, options);
        }
export type GetAnprCaptureByIdQueryHookResult = ReturnType<typeof useGetAnprCaptureByIdQuery>;
export type GetAnprCaptureByIdLazyQueryHookResult = ReturnType<typeof useGetAnprCaptureByIdLazyQuery>;
export const GetAnprCapturesByPlateDocument = gql`
    query GetAnprCapturesByPlate($plate_no: String!, $limit: Int = 10) {
  transact_anpr_capture(
    where: {plate_no: {_ilike: $plate_no}, is_deleted: {_eq: false}}
    limit: $limit
    order_by: {captured_at: desc}
  ) {
    id
    external_id
    plate_no
    confidence
    captured_at
    location_code
    camera_id
    minio_full_image_object
    minio_plate_image_object
  }
}
    `;

/**
 * __useGetAnprCapturesByPlateQuery__
 *
 * To run a query within a React component, call `useGetAnprCapturesByPlateQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAnprCapturesByPlateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAnprCapturesByPlateQuery({
 *   variables: {
 *      plate_no: // value for 'plate_no'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useGetAnprCapturesByPlateQuery(baseOptions: Apollo.QueryHookOptions<GetAnprCapturesByPlateQuery, GetAnprCapturesByPlateQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAnprCapturesByPlateQuery, GetAnprCapturesByPlateQueryVariables>(GetAnprCapturesByPlateDocument, options);
      }
export function useGetAnprCapturesByPlateLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAnprCapturesByPlateQuery, GetAnprCapturesByPlateQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAnprCapturesByPlateQuery, GetAnprCapturesByPlateQueryVariables>(GetAnprCapturesByPlateDocument, options);
        }
export type GetAnprCapturesByPlateQueryHookResult = ReturnType<typeof useGetAnprCapturesByPlateQuery>;
export type GetAnprCapturesByPlateLazyQueryHookResult = ReturnType<typeof useGetAnprCapturesByPlateLazyQuery>;
export const GetAnprCapturesByDateRangeDocument = gql`
    query GetAnprCapturesByDateRange($start_date: timestamptz!, $end_date: timestamptz!) {
  transact_anpr_capture(
    where: {captured_at: {_gte: $start_date, _lte: $end_date}, is_deleted: {_eq: false}}
    order_by: {captured_at: desc}
  ) {
    id
    external_id
    plate_no
    confidence
    captured_at
    location_code
    camera_id
  }
}
    `;

/**
 * __useGetAnprCapturesByDateRangeQuery__
 *
 * To run a query within a React component, call `useGetAnprCapturesByDateRangeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAnprCapturesByDateRangeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAnprCapturesByDateRangeQuery({
 *   variables: {
 *      start_date: // value for 'start_date'
 *      end_date: // value for 'end_date'
 *   },
 * });
 */
export function useGetAnprCapturesByDateRangeQuery(baseOptions: Apollo.QueryHookOptions<GetAnprCapturesByDateRangeQuery, GetAnprCapturesByDateRangeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAnprCapturesByDateRangeQuery, GetAnprCapturesByDateRangeQueryVariables>(GetAnprCapturesByDateRangeDocument, options);
      }
export function useGetAnprCapturesByDateRangeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAnprCapturesByDateRangeQuery, GetAnprCapturesByDateRangeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAnprCapturesByDateRangeQuery, GetAnprCapturesByDateRangeQueryVariables>(GetAnprCapturesByDateRangeDocument, options);
        }
export type GetAnprCapturesByDateRangeQueryHookResult = ReturnType<typeof useGetAnprCapturesByDateRangeQuery>;
export type GetAnprCapturesByDateRangeLazyQueryHookResult = ReturnType<typeof useGetAnprCapturesByDateRangeLazyQuery>;
export const InsertAnprCaptureDocument = gql`
    mutation InsertAnprCapture($object: transact_anpr_capture_insert_input!) {
  insert_transact_anpr_capture_one(object: $object) {
    id
    external_id
    plate_no
    confidence
    captured_at
    location_code
    camera_id
    created_date
  }
}
    `;

/**
 * __useInsertAnprCaptureMutation__
 *
 * To run a mutation, you first call `useInsertAnprCaptureMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertAnprCaptureMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertAnprCaptureMutation, { data, loading, error }] = useInsertAnprCaptureMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useInsertAnprCaptureMutation(baseOptions?: Apollo.MutationHookOptions<InsertAnprCaptureMutation, InsertAnprCaptureMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertAnprCaptureMutation, InsertAnprCaptureMutationVariables>(InsertAnprCaptureDocument, options);
      }
export type InsertAnprCaptureMutationHookResult = ReturnType<typeof useInsertAnprCaptureMutation>;
export const UpdateAnprCaptureDocument = gql`
    mutation UpdateAnprCapture($id: uuid!, $set: transact_anpr_capture_set_input!) {
  update_transact_anpr_capture_by_pk(pk_columns: {id: $id}, _set: $set) {
    id
    external_id
    plate_no
    confidence
    captured_at
    updated_by
    updated_date
  }
}
    `;

/**
 * __useUpdateAnprCaptureMutation__
 *
 * To run a mutation, you first call `useUpdateAnprCaptureMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAnprCaptureMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAnprCaptureMutation, { data, loading, error }] = useUpdateAnprCaptureMutation({
 *   variables: {
 *      id: // value for 'id'
 *      set: // value for 'set'
 *   },
 * });
 */
export function useUpdateAnprCaptureMutation(baseOptions?: Apollo.MutationHookOptions<UpdateAnprCaptureMutation, UpdateAnprCaptureMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateAnprCaptureMutation, UpdateAnprCaptureMutationVariables>(UpdateAnprCaptureDocument, options);
      }
export type UpdateAnprCaptureMutationHookResult = ReturnType<typeof useUpdateAnprCaptureMutation>;
export const SoftDeleteAnprCaptureDocument = gql`
    mutation SoftDeleteAnprCapture($id: uuid!, $updated_by: uuid!) {
  update_transact_anpr_capture_by_pk(
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
 * __useSoftDeleteAnprCaptureMutation__
 *
 * To run a mutation, you first call `useSoftDeleteAnprCaptureMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSoftDeleteAnprCaptureMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [softDeleteAnprCaptureMutation, { data, loading, error }] = useSoftDeleteAnprCaptureMutation({
 *   variables: {
 *      id: // value for 'id'
 *      updated_by: // value for 'updated_by'
 *   },
 * });
 */
export function useSoftDeleteAnprCaptureMutation(baseOptions?: Apollo.MutationHookOptions<SoftDeleteAnprCaptureMutation, SoftDeleteAnprCaptureMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SoftDeleteAnprCaptureMutation, SoftDeleteAnprCaptureMutationVariables>(SoftDeleteAnprCaptureDocument, options);
      }
export type SoftDeleteAnprCaptureMutationHookResult = ReturnType<typeof useSoftDeleteAnprCaptureMutation>;
export const SubscribeLatestAnprCaptureDocument = gql`
    subscription SubscribeLatestAnprCapture($session_id: uuid!, $site_id: uuid) {
  transact_anpr_capture(
    where: {is_deleted: {_eq: false}, session_id: {_eq: $session_id}, site_id: {_eq: $site_id}}
    order_by: {created_date: desc}
    limit: 1
  ) {
    id
    external_id
    plate_no
    confidence
    captured_at
    location_code
    camera_id
    minio_bucket
    minio_date_folder
    minio_full_image_object
    minio_plate_image_object
    site_id
    session_id
  }
}
    `;

/**
 * __useSubscribeLatestAnprCaptureSubscription__
 *
 * To run a query within a React component, call `useSubscribeLatestAnprCaptureSubscription` and pass it any options that fit your needs.
 * When your component renders, `useSubscribeLatestAnprCaptureSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSubscribeLatestAnprCaptureSubscription({
 *   variables: {
 *      session_id: // value for 'session_id'
 *      site_id: // value for 'site_id'
 *   },
 * });
 */
export function useSubscribeLatestAnprCaptureSubscription(baseOptions: Apollo.SubscriptionHookOptions<SubscribeLatestAnprCaptureSubscription, SubscribeLatestAnprCaptureSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<SubscribeLatestAnprCaptureSubscription, SubscribeLatestAnprCaptureSubscriptionVariables>(SubscribeLatestAnprCaptureDocument, options);
      }
export type SubscribeLatestAnprCaptureSubscriptionHookResult = ReturnType<typeof useSubscribeLatestAnprCaptureSubscription>;