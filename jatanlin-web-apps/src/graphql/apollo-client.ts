/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  from,
  split,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";

// Error handling link
const errorLink = onError((errorHandler: any) => {
  if (errorHandler.graphQLErrors) {
    errorHandler.graphQLErrors.forEach(({ message, locations, path }: any) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      );
    });
  }
  if (errorHandler.networkError) {
    console.error(`[Network error]: ${errorHandler.networkError}`);
  }
});

// Auth middleware link
const authLink = new ApolloLink((operation, forward) => {
  const token =
    typeof window !== "undefined"
      ? document.cookie
          .split("; ")
          .find((row) => row.startsWith("authToken="))
          ?.split("=")[1]
      : null;

  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  }));

  return forward(operation);
});

// HTTP connection to the API (Hasura)
const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_HASURA_URL || "http://localhost:8080/v1/graphql",
  credentials: "include", // Include cookies in requests
});

// WebSocket connection for subscriptions (client-side only)
const wsLink =
  typeof window !== "undefined"
    ? new GraphQLWsLink(
        createClient({
          url:
            process.env.NEXT_PUBLIC_HASURA_WS_IP ||
            process.env.NEXT_PUBLIC_HASURA_WS ||
            "ws://localhost:5000/v1/graphql",
          connectionParams: {
            headers: (() => {
              const token =
                typeof window !== "undefined"
                  ? document.cookie
                      .split("; ")
                      .find((row) => row.startsWith("authToken="))
                      ?.split("=")[1]
                  : null;

              return {
                ...(token ? { authorization: `Bearer ${token}` } : {}),
              };
            })(),
          },
        }),
      )
    : null;

// Split link: use WebSocket for subscriptions, HTTP for queries/mutations
const splitLink =
  typeof window !== "undefined" && wsLink
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === "OperationDefinition" &&
            definition.operation === "subscription"
          );
        },
        wsLink,
        from([errorLink, authLink, httpLink]),
      )
    : from([errorLink, authLink, httpLink]);

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Add custom merge policies for paginated queries if needed
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
      errorPolicy: "all",
    },
    query: {
      fetchPolicy: "network-only",
      errorPolicy: "all",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
});
