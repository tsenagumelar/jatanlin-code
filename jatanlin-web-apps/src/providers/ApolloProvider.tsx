"use client";

import React from "react";
import { ApolloProvider as BaseApolloProvider } from "@apollo/client/react";
import { apolloClient } from "@/src/graphql/apollo-client";

interface ApolloProviderProps {
  children: React.ReactNode;
}

export const ApolloProviderWrapper: React.FC<ApolloProviderProps> = ({
  children,
}) => {
  return (
    <BaseApolloProvider client={apolloClient}>{children}</BaseApolloProvider>
  );
};
