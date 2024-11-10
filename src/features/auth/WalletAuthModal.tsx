import { useEffect, useRef, useState } from 'react';

import { Web3Provider } from '@ethersproject/providers';
import { hooks, ReefSigner } from '@reef-chain/react-lib';

import { stringToHex, u8aToHex } from '@polkadot/util';
import { extension as reefExt } from '@reef-chain/util-lib';
import { decodeAddress, signatureVerify } from '@polkadot/util-crypto';
import { toast } from 'react-toastify';

import { useIsCoLinksSite } from 'features/colinks/useIsCoLinksSite';
import { useIsCoSoulSite } from 'features/cosoul/useIsCoSoulSite';
import { NavLogo } from 'features/nav/NavLogo';

import CoinbaseSVG from '../../assets/svgs/wallet/coinbase.svg?react'; //'../../assets/svgs/wallet/coinbase.svg?component';
import MetaMaskSVG from '../../assets/svgs/wallet/metamask-color.svg?react';
import WalletReefBrowserSVG from '../../assets/svgs/wallet/reefwallet.svg?react';
import WalletConnectSVG from '../../assets/svgs/wallet/wallet-connect.svg?react';
import useConnectedWallet from '../../hooks/useConnectedWallet';
import useWcPreloader from '../../hooks/useWcPreloader';
import { EConnectorNames } from 'config/constants';
import { useToast } from 'hooks';
import { useWeb3React } from 'hooks/useWeb3React';
import { EXTERNAL_URL_TOS } from 'routes/paths';
import { Box, Button, Flex, HR, Image, Link, Modal, Text } from 'ui';
import { connectWallet, getIpfsGatewayUrl } from 'utils/walletHelper';
import { network as nw } from '@reef-chain/util-lib';

import { getMagicProvider } from './magic';
import LoadingState from 'components/LoadingState';
import WalletButton from 'components/WalletButton';
import AccountSelector from 'components/AccountSelector';
import UnsupportedNetwork from 'components/UnsupportedNetwork';

const EMAIL_LOGIN_EXAMPLE_URL =
  'https://coordinape-prod.s3.amazonaws.com/assets/static/images/magic-link-example.png';

const HIDE_EXPLAINER_KEY = 'emailLoginHideExplainer';

const WALLET_ICONS: { [key in EConnectorNames]: typeof MetaMaskSVG } = {
  [EConnectorNames.Injected]: MetaMaskSVG,
  [EConnectorNames.WalletConnect]: WalletConnectSVG,
  [EConnectorNames.WalletLink]: CoinbaseSVG,
  [EConnectorNames.ReefWallet]: WalletReefBrowserSVG,
};

export const WalletAuthModal = () => {
  const { selExtensionName, setSelExtensionName } = useConnectedWallet();

  const [connectMessage, setConnectMessage] = useState<string>('');

  const [accounts, setAccounts] = useState<ReefSigner[]>([]);
  const [selectedSigner, setSelectedSigner] = useState<ReefSigner | undefined>(
    undefined
  );

  const [unsupportedNetwork, setUnsupportedNetwork] = useState<boolean>(false);
  const { loading: wcPreloader, setLoading: setWcPreloader } = useWcPreloader();

  const { showError, showDefault } = useToast();
  const web3Context = useWeb3React<Web3Provider>();
  const [isMetamaskEnabled, setIsMetamaskEnabled] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(true);
  const [switchingNetwork, setSwitchingNetwork] = useState<boolean | undefined>(
    true
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
  } = hooks.useInitReefStateExtension('Orcanize', selExtensionName, {
    ipfsHashResolverFn: getIpfsGatewayUrl,
  });

  const appAvailableNetworks = [
    nw.AVAILABLE_NETWORKS.mainnet,
    nw.AVAILABLE_NETWORKS.testnet,
  ];

  useEffect(() => {
    if (network?.name === 'testnet') setUnsupportedNetwork(true);
    if (network?.name === 'mainnet') setUnsupportedNetwork(false);
    console.log({ network });
  }, [network]);

  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const isConnecting = !!connectMessage;

  const walletAvailable: { key: string; label: string; icon: JSX.Element }[] = [
    {
      key: reefExt.REEF_EXTENSION_IDENT,
      label: 'Reef Browser',
      icon: <WALLET_ICONS.reefwallet />,
    },
    {
      key: reefExt.REEF_WALLET_CONNECT_IDENT,
      label: 'Wallet Connect',
      icon: <WALLET_ICONS.walletconnect />,
    },
  ];

  const onExtensionSelected = async (ident: string) => {
    if (ident === reefExt.REEF_WALLET_CONNECT_IDENT) {
      await connectWallet(ident, setSelExtensionName, setWcPreloader);
    } else {
      setSelExtensionName(ident);
    }
  };

  const switchToMainnet = (key: 'mainnet' | 'testnet') => {
    setSelExtensionName(undefined);
    setSwitchingNetwork(false);
    const toSelect = appAvailableNetworks.find(item => item.name === key);

    if (toSelect && network.name !== toSelect.name) {
      reefState.setSelectedNetwork(toSelect);

      setSwitchingNetwork(true);
      setSelExtensionName(reefExt.REEF_EXTENSION_IDENT);
    }
  };

  const selectAccount = async (accountAddress: string) => {
    const account = signers.find(signer => signer.address === accountAddress);

    if (!account) return;

    reefState.setSelectedAddress(account.address);

    if (!provider) return;

    try {
      const source = account.source;
      await reefExt.web3Enable(source);
      const injector = await reefExt.web3FromSource(source);

      const signRaw = injector?.signer?.signRaw;

      if (!signRaw) return;

      const message = 'custom message connection !';

      signRaw({
        address: account.address,
        data: message,
        type: 'payload',
      })
        .then(result => console.log({ result }))
        .catch(err =>
          toast.warning('Please sign the message to connect', {
            position: toast.POSITION.TOP_RIGHT,
            bodyStyle: {
              color: 'white',
            },
          })
        );
    } catch (err) {
      console.error('Error during account selection and signing: ', err);
    }
  };

  const isValidSignature = (
    signedMessage: string,
    signature: string,
    address: string
  ) => {
    const publicKey = decodeAddress(address);
    const hexPublicKey = u8aToHex(publicKey);

    return signatureVerify(signedMessage, signature, hexPublicKey);
  };

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
            css={{ display: 'block', textAlign: 'center', width: '100%' }}
          >
            New to Orcanize ? Connect to join.
          </Text>

          {!selExtensionName &&
            (!loading ? (
              <Box css={{ width: '$full' }}>
                <Flex column css={{ width: '$full', gap: '$md' }}>
                  {walletAvailable.map(wallet => (
                    <WalletButton
                      key={wallet.key}
                      onClick={() => onExtensionSelected(wallet.key)}
                      label={wallet.label}
                      icon={wallet.icon}
                    />
                  ))}
                </Flex>
              </Box>
            ) : (
              <LoadingState
                cancelConnection={() => setSelExtensionName(undefined)}
              />
            ))}

          {selExtensionName &&
            (unsupportedNetwork ? (
              <UnsupportedNetwork
                switchToMainnet={() => switchToMainnet('mainnet')}
              />
            ) : (
              <AccountSelector
                signers={signers}
                selectAccount={accountAddress => selectAccount(accountAddress)}
                setSelExtensionName={() => setSelExtensionName(undefined)}
              />
            ))}

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
