/* eslint-disable @typescript-eslint/no-require-imports */
// src/graphql/codegen.js
require("dotenv").config();

/** @type {import('@graphql-codegen/cli').CodegenConfig} */
module.exports = {
  schema: [
    {
      [process.env.NEXT_PUBLIC_HASURA_URL]: {
        headers: {
          "x-hasura-admin-secret": process.env.NEXT_PUBLIC_HASURA_SECRET,
        },
      },
    },
  ],
  documents: "src/**/*.graphql",

  generates: {
    "src/graphql/schema/types.ts": {
      plugins: ["typescript"],
      config: {
        useTypeImports: true,
        skipTypename: true,
        defaultScalarType: "unknown",
      },
    },

    "src/graphql/queries": {
      preset: "near-operation-file",
      presetConfig: {
        extension: ".ts",
        folder: "../hooks",
        baseTypesPath: "../schema/types.ts",
      },
      plugins: ["typescript-operations", "typescript-react-apollo"],
      config: {
        noExport: false,
        skipTypename: true,
        withMutationFn: false,
        withResultType: false,
        withMutationOptionsType: false,
      },
    },
  },
};
