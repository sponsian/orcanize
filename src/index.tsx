import { StrictMode } from 'react';

import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getAuthToken } from 'features/auth';
import { createClient } from 'graphql-ws';
import { createRoot } from 'react-dom/client';

import { initSentry } from 'utils/reporting';

import { ConnectedWalletProvider } from './context/ConnectedWalletContext'

import App from './App';
import { VITE_HASURA_URL } from './config/env';
import { WcPreloaderProvider } from 'context/WcPreloaderContext';

const wsLink = new GraphQLWsLink(
  createClient({
    url: VITE_HASURA_URL.replace('http', 'ws'),
    retryAttempts: Infinity,
    keepAlive: 10000,
    connectionParams: async () => {
      const token = getAuthToken(false);
      if (token) {
        return {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
      }
      return {};
    },
  })
);

const client = new ApolloClient({
  link: wsLink,
  cache: new InMemoryCache(),
});

initSentry();

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <StrictMode>
    <ConnectedWalletProvider>
      <WcPreloaderProvider>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
    </WcPreloaderProvider>
    </ConnectedWalletProvider>
  </StrictMode>
);
