import * as Types from '../schema/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type SubscribeLatestCctvSubscriptionVariables = Types.Exact<{
  session_id: Types.Scalars['uuid']['input'];
  site_id?: Types.InputMaybe<Types.Scalars['uuid']['input']>;
}>;


export type SubscribeLatestCctvSubscription = { transact_cctv: Array<{ id: any, filename?: string | null, filepath?: string | null, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, updated_by?: any | null, updated_date?: any | null, site_id?: any | null, session_id?: any | null }> };


export const SubscribeLatestCctvDocument = gql`
    subscription SubscribeLatestCctv($session_id: uuid!, $site_id: uuid) {
  transact_cctv(
    where: {is_deleted: {_eq: false}, session_id: {_eq: $session_id}, site_id: {_eq: $site_id}}
    order_by: [{updated_date: desc_nulls_last}, {created_date: desc}]
    limit: 1
  ) {
    id
    filename
    filepath
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
 * __useSubscribeLatestCctvSubscription__
 *
 * To run a query within a React component, call `useSubscribeLatestCctvSubscription` and pass it any options that fit your needs.
 * When your component renders, `useSubscribeLatestCctvSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSubscribeLatestCctvSubscription({
 *   variables: {
 *      session_id: // value for 'session_id'
 *      site_id: // value for 'site_id'
 *   },
 * });
 */
export function useSubscribeLatestCctvSubscription(baseOptions: Apollo.SubscriptionHookOptions<SubscribeLatestCctvSubscription, SubscribeLatestCctvSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<SubscribeLatestCctvSubscription, SubscribeLatestCctvSubscriptionVariables>(SubscribeLatestCctvDocument, options);
      }
export type SubscribeLatestCctvSubscriptionHookResult = ReturnType<typeof useSubscribeLatestCctvSubscription>;
