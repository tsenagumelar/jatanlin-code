import * as Types from '../schema/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetVehicleClassesQueryVariables = Types.Exact<{
  limit: Types.Scalars['Int']['input'];
  offset: Types.Scalars['Int']['input'];
  where?: Types.InputMaybe<Types.Master_Vehicle_Class_Bool_Exp>;
}>;


export type GetVehicleClassesQuery = { master_vehicle_class: Array<{ id: any, code: string, type: string, description: string, total_axle: number, class_2_weight: any, class_3_weight: any, length: any, width: any, height: any, image?: string | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date: any, updated_by?: any | null, updated_date: any }>, master_vehicle_class_aggregate: { aggregate?: { count: number } | null } };

export type GetVehicleClassByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
}>;


export type GetVehicleClassByIdQuery = { master_vehicle_class_by_pk?: { id: any, code: string, type: string, description: string, total_axle: number, class_2_weight: any, class_3_weight: any, length: any, width: any, height: any, image?: string | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date: any, updated_by?: any | null, updated_date: any } | null };

export type InsertVehicleClassMutationVariables = Types.Exact<{
  object: Types.Master_Vehicle_Class_Insert_Input;
}>;


export type InsertVehicleClassMutation = { insert_master_vehicle_class_one?: { id: any, code: string, type: string, description: string, total_axle: number, class_2_weight: any, class_3_weight: any, length: any, width: any, height: any, image?: string | null, is_active?: boolean | null, created_by?: any | null, created_date: any } | null };

export type UpdateVehicleClassMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  set: Types.Master_Vehicle_Class_Set_Input;
}>;


export type UpdateVehicleClassMutation = { update_master_vehicle_class_by_pk?: { id: any, code: string, type: string, description: string, total_axle: number, class_2_weight: any, class_3_weight: any, length: any, width: any, height: any, image?: string | null, is_active?: boolean | null, updated_by?: any | null, updated_date: any } | null };

export type SoftDeleteVehicleClassMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  updated_by: Types.Scalars['uuid']['input'];
}>;


export type SoftDeleteVehicleClassMutation = { update_master_vehicle_class_by_pk?: { id: any, code: string, type: string, is_deleted?: boolean | null, is_active?: boolean | null, updated_by?: any | null, updated_date: any } | null };

export type RestoreVehicleClassMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  updated_by: Types.Scalars['uuid']['input'];
}>;


export type RestoreVehicleClassMutation = { update_master_vehicle_class_by_pk?: { id: any, code: string, type: string, is_deleted?: boolean | null, updated_by?: any | null, updated_date: any } | null };

export type CheckVehicleClassCodeExistsQueryVariables = Types.Exact<{
  code: Types.Scalars['String']['input'];
}>;


export type CheckVehicleClassCodeExistsQuery = { master_vehicle_class: Array<{ id: any, code: string }> };

export type CheckVehicleClassTypeExistsQueryVariables = Types.Exact<{
  type: Types.Scalars['String']['input'];
}>;


export type CheckVehicleClassTypeExistsQuery = { master_vehicle_class: Array<{ id: any, type: string }> };


export const GetVehicleClassesDocument = gql`
    query GetVehicleClasses($limit: Int!, $offset: Int!, $where: master_vehicle_class_bool_exp = {}) {
  master_vehicle_class(
    where: {_and: [{is_deleted: {_eq: false}}, $where]}
    limit: $limit
    offset: $offset
    order_by: {created_date: desc}
  ) {
    id
    code
    type
    description
    total_axle
    class_2_weight
    class_3_weight
    length
    width
    height
    image
    is_active
    is_deleted
    created_by
    created_date
    updated_by
    updated_date
  }
  master_vehicle_class_aggregate(
    where: {_and: [{is_deleted: {_eq: false}}, $where]}
  ) {
    aggregate {
      count
    }
  }
}
    `;

/**
 * __useGetVehicleClassesQuery__
 *
 * To run a query within a React component, call `useGetVehicleClassesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetVehicleClassesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetVehicleClassesQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetVehicleClassesQuery(baseOptions: Apollo.QueryHookOptions<GetVehicleClassesQuery, GetVehicleClassesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetVehicleClassesQuery, GetVehicleClassesQueryVariables>(GetVehicleClassesDocument, options);
      }
export function useGetVehicleClassesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetVehicleClassesQuery, GetVehicleClassesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetVehicleClassesQuery, GetVehicleClassesQueryVariables>(GetVehicleClassesDocument, options);
        }
export type GetVehicleClassesQueryHookResult = ReturnType<typeof useGetVehicleClassesQuery>;
export type GetVehicleClassesLazyQueryHookResult = ReturnType<typeof useGetVehicleClassesLazyQuery>;
export const GetVehicleClassByIdDocument = gql`
    query GetVehicleClassById($id: uuid!) {
  master_vehicle_class_by_pk(id: $id) {
    id
    code
    type
    description
    total_axle
    class_2_weight
    class_3_weight
    length
    width
    height
    image
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
 * __useGetVehicleClassByIdQuery__
 *
 * To run a query within a React component, call `useGetVehicleClassByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetVehicleClassByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetVehicleClassByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetVehicleClassByIdQuery(baseOptions: Apollo.QueryHookOptions<GetVehicleClassByIdQuery, GetVehicleClassByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetVehicleClassByIdQuery, GetVehicleClassByIdQueryVariables>(GetVehicleClassByIdDocument, options);
      }
export function useGetVehicleClassByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetVehicleClassByIdQuery, GetVehicleClassByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetVehicleClassByIdQuery, GetVehicleClassByIdQueryVariables>(GetVehicleClassByIdDocument, options);
        }
export type GetVehicleClassByIdQueryHookResult = ReturnType<typeof useGetVehicleClassByIdQuery>;
export type GetVehicleClassByIdLazyQueryHookResult = ReturnType<typeof useGetVehicleClassByIdLazyQuery>;
export const InsertVehicleClassDocument = gql`
    mutation InsertVehicleClass($object: master_vehicle_class_insert_input!) {
  insert_master_vehicle_class_one(object: $object) {
    id
    code
    type
    description
    total_axle
    class_2_weight
    class_3_weight
    length
    width
    height
    image
    is_active
    created_by
    created_date
  }
}
    `;

/**
 * __useInsertVehicleClassMutation__
 *
 * To run a mutation, you first call `useInsertVehicleClassMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertVehicleClassMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertVehicleClassMutation, { data, loading, error }] = useInsertVehicleClassMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useInsertVehicleClassMutation(baseOptions?: Apollo.MutationHookOptions<InsertVehicleClassMutation, InsertVehicleClassMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertVehicleClassMutation, InsertVehicleClassMutationVariables>(InsertVehicleClassDocument, options);
      }
export type InsertVehicleClassMutationHookResult = ReturnType<typeof useInsertVehicleClassMutation>;
export const UpdateVehicleClassDocument = gql`
    mutation UpdateVehicleClass($id: uuid!, $set: master_vehicle_class_set_input!) {
  update_master_vehicle_class_by_pk(pk_columns: {id: $id}, _set: $set) {
    id
    code
    type
    description
    total_axle
    class_2_weight
    class_3_weight
    length
    width
    height
    image
    is_active
    updated_by
    updated_date
  }
}
    `;

/**
 * __useUpdateVehicleClassMutation__
 *
 * To run a mutation, you first call `useUpdateVehicleClassMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateVehicleClassMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateVehicleClassMutation, { data, loading, error }] = useUpdateVehicleClassMutation({
 *   variables: {
 *      id: // value for 'id'
 *      set: // value for 'set'
 *   },
 * });
 */
export function useUpdateVehicleClassMutation(baseOptions?: Apollo.MutationHookOptions<UpdateVehicleClassMutation, UpdateVehicleClassMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateVehicleClassMutation, UpdateVehicleClassMutationVariables>(UpdateVehicleClassDocument, options);
      }
export type UpdateVehicleClassMutationHookResult = ReturnType<typeof useUpdateVehicleClassMutation>;
export const SoftDeleteVehicleClassDocument = gql`
    mutation SoftDeleteVehicleClass($id: uuid!, $updated_by: uuid!) {
  update_master_vehicle_class_by_pk(
    pk_columns: {id: $id}
    _set: {is_deleted: true, is_active: false, updated_by: $updated_by, updated_date: "now()"}
  ) {
    id
    code
    type
    is_deleted
    is_active
    updated_by
    updated_date
  }
}
    `;

/**
 * __useSoftDeleteVehicleClassMutation__
 *
 * To run a mutation, you first call `useSoftDeleteVehicleClassMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSoftDeleteVehicleClassMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [softDeleteVehicleClassMutation, { data, loading, error }] = useSoftDeleteVehicleClassMutation({
 *   variables: {
 *      id: // value for 'id'
 *      updated_by: // value for 'updated_by'
 *   },
 * });
 */
export function useSoftDeleteVehicleClassMutation(baseOptions?: Apollo.MutationHookOptions<SoftDeleteVehicleClassMutation, SoftDeleteVehicleClassMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SoftDeleteVehicleClassMutation, SoftDeleteVehicleClassMutationVariables>(SoftDeleteVehicleClassDocument, options);
      }
export type SoftDeleteVehicleClassMutationHookResult = ReturnType<typeof useSoftDeleteVehicleClassMutation>;
export const RestoreVehicleClassDocument = gql`
    mutation RestoreVehicleClass($id: uuid!, $updated_by: uuid!) {
  update_master_vehicle_class_by_pk(
    pk_columns: {id: $id}
    _set: {is_deleted: false, updated_by: $updated_by, updated_date: "now()"}
  ) {
    id
    code
    type
    is_deleted
    updated_by
    updated_date
  }
}
    `;

/**
 * __useRestoreVehicleClassMutation__
 *
 * To run a mutation, you first call `useRestoreVehicleClassMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRestoreVehicleClassMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [restoreVehicleClassMutation, { data, loading, error }] = useRestoreVehicleClassMutation({
 *   variables: {
 *      id: // value for 'id'
 *      updated_by: // value for 'updated_by'
 *   },
 * });
 */
export function useRestoreVehicleClassMutation(baseOptions?: Apollo.MutationHookOptions<RestoreVehicleClassMutation, RestoreVehicleClassMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RestoreVehicleClassMutation, RestoreVehicleClassMutationVariables>(RestoreVehicleClassDocument, options);
      }
export type RestoreVehicleClassMutationHookResult = ReturnType<typeof useRestoreVehicleClassMutation>;
export const CheckVehicleClassCodeExistsDocument = gql`
    query CheckVehicleClassCodeExists($code: String!) {
  master_vehicle_class(where: {code: {_eq: $code}, is_deleted: {_eq: false}}) {
    id
    code
  }
}
    `;

/**
 * __useCheckVehicleClassCodeExistsQuery__
 *
 * To run a query within a React component, call `useCheckVehicleClassCodeExistsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckVehicleClassCodeExistsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckVehicleClassCodeExistsQuery({
 *   variables: {
 *      code: // value for 'code'
 *   },
 * });
 */
export function useCheckVehicleClassCodeExistsQuery(baseOptions: Apollo.QueryHookOptions<CheckVehicleClassCodeExistsQuery, CheckVehicleClassCodeExistsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CheckVehicleClassCodeExistsQuery, CheckVehicleClassCodeExistsQueryVariables>(CheckVehicleClassCodeExistsDocument, options);
      }
export function useCheckVehicleClassCodeExistsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CheckVehicleClassCodeExistsQuery, CheckVehicleClassCodeExistsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CheckVehicleClassCodeExistsQuery, CheckVehicleClassCodeExistsQueryVariables>(CheckVehicleClassCodeExistsDocument, options);
        }
export type CheckVehicleClassCodeExistsQueryHookResult = ReturnType<typeof useCheckVehicleClassCodeExistsQuery>;
export type CheckVehicleClassCodeExistsLazyQueryHookResult = ReturnType<typeof useCheckVehicleClassCodeExistsLazyQuery>;
export const CheckVehicleClassTypeExistsDocument = gql`
    query CheckVehicleClassTypeExists($type: String!) {
  master_vehicle_class(where: {type: {_eq: $type}, is_deleted: {_eq: false}}) {
    id
    type
  }
}
    `;

/**
 * __useCheckVehicleClassTypeExistsQuery__
 *
 * To run a query within a React component, call `useCheckVehicleClassTypeExistsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckVehicleClassTypeExistsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckVehicleClassTypeExistsQuery({
 *   variables: {
 *      type: // value for 'type'
 *   },
 * });
 */
export function useCheckVehicleClassTypeExistsQuery(baseOptions: Apollo.QueryHookOptions<CheckVehicleClassTypeExistsQuery, CheckVehicleClassTypeExistsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CheckVehicleClassTypeExistsQuery, CheckVehicleClassTypeExistsQueryVariables>(CheckVehicleClassTypeExistsDocument, options);
      }
export function useCheckVehicleClassTypeExistsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CheckVehicleClassTypeExistsQuery, CheckVehicleClassTypeExistsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CheckVehicleClassTypeExistsQuery, CheckVehicleClassTypeExistsQueryVariables>(CheckVehicleClassTypeExistsDocument, options);
        }
export type CheckVehicleClassTypeExistsQueryHookResult = ReturnType<typeof useCheckVehicleClassTypeExistsQuery>;
export type CheckVehicleClassTypeExistsLazyQueryHookResult = ReturnType<typeof useCheckVehicleClassTypeExistsLazyQuery>;