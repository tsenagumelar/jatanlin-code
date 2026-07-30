"use client";

import { gql, useQuery } from "@apollo/client";

export type OperationMode = "DEMO" | "LIVE";

const GET_SYSTEM_MODE = gql`
  query GetSystemMode {
    master_config(
      where: {
        config_type: { _eq: "SYSTEM_MODE" }
        config_key: { _eq: "OPERATION_MODE" }
        is_deleted: { _eq: false }
      }
      limit: 1
    ) {
      id
      config_value
    }
  }
`;

interface UseSystemModeResult {
  mode: OperationMode;
  loading: boolean;
}

export function useSystemMode(): UseSystemModeResult {
  const { data, loading } = useQuery(GET_SYSTEM_MODE, {
    fetchPolicy: "cache-and-network",
  });

  const raw = data?.master_config?.[0]?.config_value;
  const mode: OperationMode = raw === "LIVE" ? "LIVE" : "DEMO";

  return { mode, loading };
}
