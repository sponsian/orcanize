import { initFrontend as initAnalytics } from 'features/analytics';
import { Helmet } from 'react-helmet';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import { ThemeProvider as DeprecatedMuiThemeProvider } from '@material-ui/styles';

import { ErrorBoundary, LoadingModal } from 'components';
import { ToastContainer } from 'components/ToastContainer';
import { Web3ReactProvider } from 'hooks/useWeb3React';
import { createTheme } from 'theme';

import { useIsCoLinksSite } from './features/colinks/useIsCoLinksSite';
import ThemeProvider from './features/theming/ThemeProvider';
import { AppRoutes } from './routes/routes';
import { globalStyles } from './stitches.config';

import './App.css';
import { ReefSigner, hooks } from '@reef-chain/react-lib';
import { getIpfsGatewayUrl } from 'utils/walletHelper';
import useConnectedWallet from 'hooks/useConnectedWallet';
import { extension as reefExt } from '@reef-chain/util-lib';
import { useEffect, useState } from 'react';
import { network as nw } from '@reef-chain/util-lib';
import NetworkSwitch, { setSwitching } from 'context/NetworkSwitch';
import ReefSignersContext from 'context/ReefSigners';

const theme = createTheme();
const queryClient = new QueryClient();
initAnalytics();

function App() {
  globalStyles();

  const [isNetworkSwitching, setNetworkSwitching] = useState(false);

  const networkSwitch = {
    isSwitching: isNetworkSwitching,
    setSwitching: (value: boolean) => setSwitching(value, setNetworkSwitching),
  };

  return (
    <>
      <RecoilRoot>
        <ErrorBoundary>
          <ToastContainer />
          <QueryClientProvider client={queryClient}>
            <NetworkSwitch.Provider value={networkSwitch}>
              <DeprecatedMuiThemeProvider theme={theme}>
                <ThemeProvider>
                  <Web3ReactProvider>
                    <BrowserRouter>
                      <AppRoutes />
                    </BrowserRouter>
                  </Web3ReactProvider>
                </ThemeProvider>
              </DeprecatedMuiThemeProvider>
            </NetworkSwitch.Provider>
          </QueryClientProvider>
        </ErrorBoundary>
      </RecoilRoot>
    </>
  );
}

export default App;
