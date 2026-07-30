import * as Types from '../schema/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type InsertTransactWimSessionMutationVariables = Types.Exact<{
  object: Types.Transact_Wim_Session_Insert_Input;
}>;


export type InsertTransactWimSessionMutation = { insert_transact_wim_session_one?: { id: any, session_name?: string | null, status: string, started_at: any, site_id: any, is_dummy?: boolean | null } | null };

export type UpdateTransactWimSessionMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  set: Types.Transact_Wim_Session_Set_Input;
}>;


export type UpdateTransactWimSessionMutation = { update_transact_wim_session_by_pk?: { id: any, status: string, ended_at?: any | null, updated_date?: any | null } | null };


export const InsertTransactWimSessionDocument = gql`
    mutation InsertTransactWimSession($object: transact_wim_session_insert_input!) {
  insert_transact_wim_session_one(object: $object) {
    id
    session_name
    status
    started_at
    site_id
    is_dummy
  }
}
    `;

/**
 * __useInsertTransactWimSessionMutation__
 *
 * To run a mutation, you first call `useInsertTransactWimSessionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertTransactWimSessionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertTransactWimSessionMutation, { data, loading, error }] = useInsertTransactWimSessionMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useInsertTransactWimSessionMutation(baseOptions?: Apollo.MutationHookOptions<InsertTransactWimSessionMutation, InsertTransactWimSessionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertTransactWimSessionMutation, InsertTransactWimSessionMutationVariables>(InsertTransactWimSessionDocument, options);
      }
export type InsertTransactWimSessionMutationHookResult = ReturnType<typeof useInsertTransactWimSessionMutation>;
export const UpdateTransactWimSessionDocument = gql`
    mutation UpdateTransactWimSession($id: uuid!, $set: transact_wim_session_set_input!) {
  update_transact_wim_session_by_pk(pk_columns: {id: $id}, _set: $set) {
    id
    status
    ended_at
    updated_date
  }
}
    `;

/**
 * __useUpdateTransactWimSessionMutation__
 *
 * To run a mutation, you first call `useUpdateTransactWimSessionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTransactWimSessionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTransactWimSessionMutation, { data, loading, error }] = useUpdateTransactWimSessionMutation({
 *   variables: {
 *      id: // value for 'id'
 *      set: // value for 'set'
 *   },
 * });
 */
export function useUpdateTransactWimSessionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateTransactWimSessionMutation, UpdateTransactWimSessionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateTransactWimSessionMutation, UpdateTransactWimSessionMutationVariables>(UpdateTransactWimSessionDocument, options);
      }
export type UpdateTransactWimSessionMutationHookResult = ReturnType<typeof useUpdateTransactWimSessionMutation>;