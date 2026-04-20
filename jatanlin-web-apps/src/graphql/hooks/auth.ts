import * as Types from '../schema/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type LoginQueryVariables = Types.Exact<{
  usernameOrEmail: Types.Scalars['String']['input'];
  password: Types.Scalars['String']['input'];
}>;


export type LoginQuery = { master_user: Array<{ id: any, code: string, badge_no?: string | null, username: string, email?: string | null, full_name: string, is_active?: boolean | null, is_deleted?: boolean | null, created_by?: any | null, created_date?: any | null, profile_picture?: string | null, master_role: { id: any, code: string, role_name: string, description?: string | null } }> };


export const LoginDocument = gql`
    query Login($usernameOrEmail: String!, $password: String!) {
  master_user(
    where: {_and: [{_or: [{username: {_eq: $usernameOrEmail}}, {email: {_eq: $usernameOrEmail}}]}, {password_hash: {_eq: $password}}, {is_active: {_eq: true}}, {is_deleted: {_eq: false}}]}
  ) {
    id
    code
    badge_no
    username
    email
    full_name
    master_role {
      id
      code
      role_name
      description
    }
    is_active
    is_deleted
    created_by
    created_date
    profile_picture
  }
}
    `;

/**
 * __useLoginQuery__
 *
 * To run a query within a React component, call `useLoginQuery` and pass it any options that fit your needs.
 * When your component renders, `useLoginQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLoginQuery({
 *   variables: {
 *      usernameOrEmail: // value for 'usernameOrEmail'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useLoginQuery(baseOptions: Apollo.QueryHookOptions<LoginQuery, LoginQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<LoginQuery, LoginQueryVariables>(LoginDocument, options);
      }
export function useLoginLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<LoginQuery, LoginQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<LoginQuery, LoginQueryVariables>(LoginDocument, options);
        }
export type LoginQueryHookResult = ReturnType<typeof useLoginQuery>;
export type LoginLazyQueryHookResult = ReturnType<typeof useLoginLazyQuery>;