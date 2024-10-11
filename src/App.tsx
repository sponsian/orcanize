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
import { extension as reefExt } from "@reef-chain/util-lib";
import { useEffect, useState } from 'react';
import { network as nw } from "@reef-chain/util-lib";
import NetworkSwitch, { setSwitching } from 'context/NetworkSwitch';
import ReefSignersContext from 'context/ReefSigners';

const theme = createTheme();
const queryClient = new QueryClient();
initAnalytics();

function App() {
  globalStyles();
  const isCoLinks = useIsCoLinksSite();
  const { selExtensionName, setSelExtensionName } = useConnectedWallet();
  const [accounts, setAccounts] = useState<ReefSigner[]>([]);
  const [selectedSigner, setSelectedSigner] = useState<ReefSigner | undefined>(
    undefined,
  );
  const [switchingNetwork, setSwitchingNetwork] = useState<boolean | undefined>(
    true,
  );
  const [isNetworkSwitching, setNetworkSwitching] = useState(false);


  const {
    loading,
    error,
    signers,
    selectedReefSigner,
    network,
    provider,
    reefState,
    extension,
  } = hooks.useInitReefStateExtension("Orcanize", selExtensionName, {
    ipfsHashResolverFn: getIpfsGatewayUrl,
  });
  const appAvailableNetworks = [
    nw.AVAILABLE_NETWORKS.mainnet,
    nw.AVAILABLE_NETWORKS.testnet,
  ];
  const networkSwitch = {
    isSwitching: isNetworkSwitching,
    setSwitching: (value: boolean) => setSwitching(value, setNetworkSwitching),
  };

  useEffect(() => {
    if(error?.code === 1) setSelExtensionName(undefined);
  }, [error])
  useEffect(() => {
    setAccounts([]);
    setSelectedSigner(undefined);
  }, [selExtensionName]);
  useEffect(() => {
    setAccounts(signers);
    setSelectedSigner(selectedReefSigner);
    reefState.setAccounts(signers);
    
    if (signers?.length && signers?.indexOf(selectedReefSigner!) == -1) {
      reefState.setSelectedAddress(signers[0].address);
    }
   
  }, [selectedReefSigner, signers]);

  const onExtensionSelected = () => {
    setSelExtensionName(reefExt.REEF_EXTENSION_IDENT);
    
  }


  const switchNetwork = (key: "mainnet" | "testnet") => { 
    setSelExtensionName(undefined);
    setSwitchingNetwork(false);
    const toSelect = appAvailableNetworks.find((item) => item.name === key);
    

    if (toSelect && network.name !== toSelect.name) {
      
      
      reefState.setSelectedNetwork(toSelect);
      
      setSwitchingNetwork(true);
      setSelExtensionName(reefExt.REEF_EXTENSION_IDENT);
    }
  }


  return (
    <>
      
      <RecoilRoot>
        <ErrorBoundary>
        
          <ToastContainer />
          <QueryClientProvider client={queryClient}>
          
          <NetworkSwitch.Provider value={networkSwitch}>
            <DeprecatedMuiThemeProvider theme={theme}>
              <ThemeProvider>
               <BrowserRouter>
                <AppRoutes />
               </BrowserRouter>
                    
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
