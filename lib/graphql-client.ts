/**
 * GraphQL Client Configuration
 * Connects to the career data GraphQL API
 */

import { GraphQLClient } from 'graphql-request';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 
  'https://rndo54zjrsxy7ppxxobie7pgki0vlibt.lambda-url.us-west-2.on.aws/graphql';

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

console.log('GraphQL Config:', {
  endpoint: GRAPHQL_ENDPOINT,
  hasApiKey: !!API_KEY,
  apiKeyLength: API_KEY.length
});

export const graphqlClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
  headers: {
    'X-API-Key': API_KEY,
  },
});

export default graphqlClient;
