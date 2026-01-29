/**
 * GraphQL Client Configuration
 * Connects to the career data GraphQL API
 */

import { GraphQLClient } from 'graphql-request';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

if (!GRAPHQL_ENDPOINT) {
  throw new Error('NEXT_PUBLIC_GRAPHQL_ENDPOINT environment variable is required');
}

export const graphqlClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
  headers: {
    'X-API-Key': API_KEY,
  },
  fetch: (url, options) =>
    fetch(url, {
      ...options,
      cache: 'no-store',
    }),
});

export default graphqlClient;
