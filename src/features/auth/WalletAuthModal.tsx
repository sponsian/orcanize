import { useEffect, useRef, useState } from 'react';

import { Web3Provider } from '@ethersproject/providers';
import { hooks, ReefSigner } from '@reef-chain/react-lib';

import { extension as reefExt } from "@reef-chain/util-lib";
import { loginSupportedChainIds } from 'common-lib/constants';
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
import { chain } from '../cosoul/chains';
import { switchToCorrectChain } from '../web3/chainswitch';
import { EConnectorNames } from 'config/constants';
import { useToast } from 'hooks';
import { useWeb3React } from 'hooks/useWeb3React';
import { EXTERNAL_URL_TOS } from 'routes/paths';
import { Box, Button, Flex, HR, Image, Link, Modal, Text } from 'ui';
import { connectWallet , getIpfsGatewayUrl} from 'utils/walletHelper';


import { getMagicProvider } from './magic';





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
  } = hooks.useInitReefStateExtension("lhichri app", selExtensionName, {
    ipfsHashResolverFn: getIpfsGatewayUrl,
  });


  useEffect(() => {
    
    if(network?.name === 'testnet') setUnsupportedNetwork(true);
    if(network?.name === 'mainnet') setUnsupportedNetwork(false);

    
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

  const shortenAddress = (address: string, chars = 4): string => {
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  }

  const switchToMainnet = () => {
    console.log('switch network to mainnet')
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
        <Flex column css={{ gap: '$md', width: '$full', alignItems: 'center' }}>
          <NavLogo />
          <Text semibold css={{ justifyContent: 'center', width: '100%' }}>
            Connect Your Wallet
          </Text>
          <Text
            size="medium"
            css={{
              display: 'block',
              textAlign: 'center',
              width: '100%',
            }}
          >
            New to Orcanize ? Connect to join.
          </Text>

          
          {unsupportedNetwork && (
            <Flex column css={{ gap: '$md' }}>
              <Text variant="formError">Please switch to Reef Chain Mainnet</Text>
              <Button color="cta" fullWidth onClick={switchToMainnet}>
                Switch to Reef Chain Mainnet
              </Button>
            </Flex>
          )}

          {
            !signers ? (
              <>
              {
                !selExtensionName ? (
                  <Box css={{ width: '$full' }}>
                  <Flex
                    column
                    css={{
                      width: '$full',
                      gap: '$md',
                    }}
                  >
                    <Button
                      variant="wallet"
                      fullWidth
                      onClick={() => {
                        onExtensionSelected(reefExt.REEF_EXTENSION_IDENT);
                      }}
                    >
                      Reef Browser
                      <WALLET_ICONS.reefwallet />
                    </Button>
                    <Button
                      variant="wallet"
                      fullWidth
                      onClick={() => {
                        onExtensionSelected(reefExt.REEF_WALLET_CONNECT_IDENT);
                      }}
                      
                    >
                      Wallet Connect
                      <WALLET_ICONS.walletconnect />
                    </Button>
                  </Flex>
                </Box>
                ) : (
                  <Flex column css={{ justifyContent: 'center', width: '100%' }}>
              <CircularProgress className='spinner-wallet-auth-modal' style={{ margin: 'auto', marginBottom: '2vh', marginTop: '2vh'}}/>
              <Button
                    onClick={() => {
                      setSelExtensionName(undefined);
                    }}
                  >
                    Cancel connection
                  </Button>
            </Flex>
                )
              }
              </>
            ) : (
              <Box css={{ width: '$full' }}>
                <Flex
                    column
                    css={{
                      width: '$full',
                      gap: '$md',
                    }}
                  >
                    {signers.map((signer) => ( 
                      <Box css={{ width: '$full' }}>
                      <Flex row css={{ justifyContent: 'center' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
                        <path 
                          fill="#5b5b5b" 
                          d="M25 7L43 7L43 16ZM61 7L61 25L52 25ZM61 79L43 79L43 70ZM25 79L25 61L34 61ZM7 25L25 25L25 34ZM79 25L79 43L70 43ZM79 61L61 61L61 52ZM7 61L7 43L16 43Z">
                        </path>
                        <path 
                          fill="#eaeaea" 
                          d="M10 16a6,6 0 1,1 12,0a6,6 0 1,1 -12,0M64 16a6,6 0 1,1 12,0a6,6 0 1,1 -12,0M64 70a6,6 0 1,1 12,0a6,6 0 1,1 -12,0M10 70a6,6 0 1,1 12,0a6,6 0 1,1 -12,0">
                        </path>
                        <path 
                          fill="#9d84d6" 
                          d="M25 25L43 25L43 43L25 43ZM31.5 36.2a4.7,4.7 0 1,0 9.4,0a4.7,4.7 0 1,0 -9.4,0M61 25L61 43L43 43L43 25ZM45.2 36.2a4.7,4.7 0 1,0 9.4,0a4.7,4.7 0 1,0 -9.4,0M61 61L43 61L43 43L61 43ZM45.2 49.8a4.7,4.7 0 1,0 9.4,0a4.7,4.7 0 1,0 -9.4,0M25 61L25 43L43 43L43 61ZM31.5 49.8a4.7,4.7 0 1,0 9.4,0a4.7,4.7 0 1,0 -9.4,0">
                        </path>
                      </svg>                
                        <Flex column css={{ justifyContent: 'space-between' }}>
                          <Text size="small">{signer.name}</Text>
                          <Text size="small">Native address : {shortenAddress(signer.address)}</Text>
                        </Flex>
                        <Button
                          variant="wallet"
                          onClick={selectAccount}>
                          Select
                        </Button>
                      </Flex>
                      
                    </Box>
                    ))}
                    
                    
                  </Flex>
              </Box>
            )
          }
         
          <HR css={{ mb: '$sm' }} />
          <Text
            p
            as="p"
            size="small"
            css={{ textAlign: 'center', width: '100%' }}
          >
            By connecting to Coordinape you agree
            <br />
            to our{' '}
            <Link href={EXTERNAL_URL_TOS} inlineLink>
              Terms of Service
            </Link>
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
      <Text p as="p">
        Because this is a Web3 application, it relies on an Ethereum (or EVM)
        wallet. When you log in with email, we will create a wallet for you,
        using a service called{' '}
        <Link inlineLink href="https://magic.link/">
          magic.link
        </Link>
        .
      </Text>
      <Text p as="p">
        With this wallet, you can interact with the blockchain.
      </Text>
      <Text h2 p as="p" color="neutral">
        How to Login
      </Text>
      <Text p as="p">
        After entering your email address or choosing to use a Google account,
        you will see a &quot;Signature Request&quot;. Please click
        &quot;Sign&quot;, and this should open a new browser window with the
        Magic.link signature request, which looks like this:
      </Text>
      <Box css={{ textAlign: 'center' }}>
        <Image
          src={EMAIL_LOGIN_EXAMPLE_URL}
          alt="Magic link signature request"
          css={{ maxHeight: '50vh', width: 'auto' }}
        />
      </Box>
      <Text p as="p" css={{ mt: '$sm' }}>
        For more information on wallets, web3, and best practices, please read{' '}
        <Link
          inlineLink
          href="https://docs.coordinape.com/info/documentation/email-login-and-web3-best-practices"
        >
          here
        </Link>
        .
      </Text>
      <Flex gap="sm" css={{ justifyContent: 'flex-end', mt: '$lg' }}>
        <Button color="secondary" onClick={props.back}>
          Cancel
        </Button>
        <Button onClick={props.continue}>Continue</Button>
      </Flex>
    </Modal>
  );
};
