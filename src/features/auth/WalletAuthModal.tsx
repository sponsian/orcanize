import { useEffect, useRef, useState } from 'react';

import { Web3Provider } from '@ethersproject/providers';
import { hooks, ReefSigner } from '@reef-chain/react-lib';

import { extension as reefExt } from "@reef-chain/util-lib";

import { useIsCoLinksSite } from 'features/colinks/useIsCoLinksSite';
import { useIsCoSoulSite } from 'features/cosoul/useIsCoSoulSite';
import { NavLogo } from 'features/nav/NavLogo';

import { CircularProgress } from '@material-ui/core';

import CoinbaseSVG from '../../assets/svgs/wallet/coinbase.svg?react'; //'../../assets/svgs/wallet/coinbase.svg?component';
import MetaMaskSVG from '../../assets/svgs/wallet/metamask-color.svg?react';
import WalletReefBrowserSVG from '../../assets/svgs/wallet/reefwallet.svg?react';
import WalletConnectSVG from '../../assets/svgs/wallet/wallet-connect.svg?react';
import useConnectedWallet  from '../../hooks/useConnectedWallet';
import useWcPreloader from '../../hooks/useWcPreloader';
import { EConnectorNames } from 'config/constants';
import { useToast } from 'hooks';
import { useWeb3React } from 'hooks/useWeb3React';
import { EXTERNAL_URL_TOS } from 'routes/paths';
import { Box, Button, Flex, HR, Image, Link, Modal, Text } from 'ui';
import { connectWallet , getIpfsGatewayUrl} from 'utils/walletHelper';
import { network as nw } from "@reef-chain/util-lib";


import { getMagicProvider } from './magic';
import LoadingState from 'components/LoadingState';
import WalletButton from 'components/WalletButton';
import AccountSelection from 'components/AccountSelection';





const UNSUPPORTED = 'unsupported';

const EMAIL_LOGIN_EXAMPLE_URL =
  'https://coordinape-prod.s3.amazonaws.com/assets/static/images/magic-link-example.png';

const HIDE_EXPLAINER_KEY = 'emailLoginHideExplainer';

const WALLET_ICONS: { [key in EConnectorNames]: typeof MetaMaskSVG } = {
  [EConnectorNames.Injected]: MetaMaskSVG,
  [EConnectorNames.WalletConnect]: WalletConnectSVG,
  [EConnectorNames.WalletLink]: CoinbaseSVG,
  [EConnectorNames.ReefWallet]: WalletReefBrowserSVG
};

export const WalletAuthModal = () => {
  const { selExtensionName, setSelExtensionName } = useConnectedWallet();

  const [connectMessage, setConnectMessage] = useState<string>('');


  const [accounts, setAccounts] = useState<ReefSigner[]>([]);
  const [selectedSigner, setSelectedSigner] = useState<ReefSigner | undefined>(
    undefined,
  );
  const [unsupportedNetwork, setUnsupportedNetwork] = useState<boolean>(false);
  const { loading: wcPreloader, setLoading: setWcPreloader } = useWcPreloader();

  const { showError, showDefault } = useToast();
  const web3Context = useWeb3React<Web3Provider>();
  const [isMetamaskEnabled, setIsMetamaskEnabled] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(true);
  const [explainerOpen, setExplainerOpen] = useState(false);
  const [switchingNetwork, setSwitchingNetwork] = useState<boolean | undefined>(
    true,
  );
  const isCoLinksPage = useIsCoLinksSite();
  const isCoSoulPage = useIsCoSoulSite();
  
  const isCoPage = isCoSoulPage || isCoLinksPage;

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


  useEffect(() => {
    
    if(network?.name === 'testnet') setUnsupportedNetwork(true);
    if(network?.name === 'mainnet') setUnsupportedNetwork(false);
    console.log({network}) 
    
  }, [network])

  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);


  
  const isConnecting = !!connectMessage;


  const onExtensionSelected = async (ident: string) => {
    if (ident === reefExt.REEF_WALLET_CONNECT_IDENT) {
      await connectWallet(ident, setSelExtensionName, setWcPreloader);
    } else {
      setSelExtensionName(ident);
    }
  };

 

  
  const switchToMainnet = (key: "mainnet" | "testnet") => {
    
    setSelExtensionName(undefined);
    setSwitchingNetwork(false);
    const toSelect = appAvailableNetworks.find((item) => item.name === key);
    

    if (toSelect && network.name !== toSelect.name) {
      
      
      reefState.setSelectedNetwork(toSelect);
      
      setSwitchingNetwork(true);
      setSelExtensionName(reefExt.REEF_EXTENSION_IDENT);
    }
  }

  const selectAccount = () => {
    console.log('select account')
  }

  

  const inject = async () => {
    try {
      // hide our modal because it interferes with typing into Magic's modal
      setModalOpen(false);
      const provider = await getMagicProvider(
        isCoPage ? 'optimism' : 'polygon'
      );
      web3Context.setProvider(provider, 'magic');
    } catch (e) {
      showError(e);
    } finally {
      setModalOpen(true);
      setConnectMessage('');
    }
  };


  if (explainerOpen)
    return (
      <Explainer
        back={() => {
          setExplainerOpen(false);
          setModalOpen(true);
        }}
        continue={() => {
          localStorage.setItem(HIDE_EXPLAINER_KEY, 'true');
          setExplainerOpen(false);
          inject();
        }}
      />
    );

  return (
    <Modal
      showClose={isConnecting}
      open={modalOpen}
      css={{
        maxWidth: '400px',
        padding: '$xl',
      }}
    >
      <Flex>
        <Flex 
          column 
          css={{ gap: '$md', width: '$full', alignItems: 'center' }}>
          <NavLogo />
          <Text 
            semibold 
            css={{ justifyContent: 'center', width: '100%' }}>Connect Your Wallet</Text>
          <Text
            size="medium"
            css={{ display: 'block', textAlign: 'center', width: '100%', }}>New to Orcanize ? Connect to join.</Text>

          {
            !selExtensionName && (
              <>
              {
                !loading ? (
                  <Box 
                    css={{ width: '$full' }}>
                    <Flex
                      column
                      css={{ width: '$full', gap: '$md', }}>
                      <WalletButton 
                        onClick={() => onExtensionSelected(reefExt.REEF_EXTENSION_IDENT)} 
                        icon={<WALLET_ICONS.reefwallet />} 
                        label="Reef Browser"/>
                      <WalletButton 
                        onClick={() => onExtensionSelected(reefExt.REEF_WALLET_CONNECT_IDENT) } 
                        icon={< WALLET_ICONS.walletconnect/> } 
                        label="Wallet Connect"/>
                    </Flex>
                  </Box>
                ) : (
                  <LoadingState cancelConnection={() => setSelExtensionName(undefined)} />
                )
              }
              </>
            ) 
          }

          {
            selExtensionName && (
                unsupportedNetwork ?  (
                  <Flex 
                    column 
                    css={{ gap: '$md' }}>
                      <Text 
                        variant="formError">Please switch to Reef Chain Mainnet</Text>
                      <Button 
                        color="cta" 
                        fullWidth 
                        onClick={() => switchToMainnet('mainnet')}>Switch to Reef Chain Mainnet</Button>
                  </Flex>
                ) : (
                  <AccountSelection 
                    signers={signers}
                    selectAccount={selectAccount}
                    setSelExtensionName={() => setSelExtensionName(undefined)}/>
                )
            )
          }

          <HR css={{ mb: '$sm' }} />
          <Text
            p
            as="p"
            size="small"
            css={{ textAlign: 'center', width: '100%' }}
          >By connecting to Coordinape you agree<br />to our{' '}
            <Link 
              href={EXTERNAL_URL_TOS} 
              inlineLink>Terms of Service</Link>
          </Text>
          <HR />
        </Flex>
      </Flex>
    </Modal>
  );
};

const Explainer = (props: { back: () => void; continue: () => void }) => {
  return (
    <Modal
      title="How Email Login Works"
      css={{ overflowY: 'auto', maxHeight: '80vh' }}
    >
      <Text 
        p 
        as="p">Because this is a Web3 application, it relies on an Ethereum (or EVM)
        wallet. When you log in with email, we will create a wallet for you,
        using a service called{' '}
        <Link 
          inlineLink 
          href="https://magic.link/">magic.link</Link>
      .</Text>
      <Text 
        p 
        as="p">With this wallet, you can interact with the blockchain.</Text>
      <Text 
        h2 
        p  
        as="p" 
        color="neutral">How to Login</Text>
      <Text 
        p 
        as="p">After entering your email address or choosing to use a Google account,
        you will see a &quot;Signature Request&quot;. Please click
        &quot;Sign&quot;, and this should open a new browser window with the
        Magic.link signature request, which looks like this:</Text>
      <Box 
        css={{ textAlign: 'center' }}>
        <Image
          src={EMAIL_LOGIN_EXAMPLE_URL}
          alt="Magic link signature request"
          css={{ maxHeight: '50vh', width: 'auto' }}
        />
      </Box>
      <Text 
        p 
        as="p" 
        css={{ mt: '$sm' }}>For more information on wallets, web3, and best practices, please read{' '}
        <Link
          inlineLink
          href="https://docs.coordinape.com/info/documentation/email-login-and-web3-best-practices"
        >here</Link>
      .</Text>
      <Flex 
        gap="sm" 
        css={{ justifyContent: 'flex-end', mt: '$lg' }}>
        <Button 
          color="secondary" 
          onClick={props.back}>Cancel</Button>
        <Button 
          onClick={props.continue}>Continue</Button>
      </Flex>
    </Modal>
  );
};
