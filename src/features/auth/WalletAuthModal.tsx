import { useEffect, useRef, useState } from 'react';

import { Web3Provider } from '@ethersproject/providers';
import { hooks, ReefSigner } from '@reef-chain/react-lib';

import { stringToHex, u8aToHex } from "@polkadot/util";
import { extension as reefExt } from "@reef-chain/util-lib";
import { Provider, Signer } from "@reef-chain/evm-provider"
import { cryptoWaitReady, decodeAddress, signatureVerify } from '@polkadot/util-crypto';

import { useIsCoLinksSite } from 'features/colinks/useIsCoLinksSite';
import { useIsCoSoulSite } from 'features/cosoul/useIsCoSoulSite';
import { NavLogo } from 'features/nav/NavLogo';

import type { Signer as InjectedSigner } from "@polkadot/api/types";
import {
  SignerPayloadJSON,
  SignerPayloadRaw,
} from "@polkadot/types/types/extrinsic";



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
import AccountSelector from 'components/AccountSelector';
import UnsupportedNetwork from 'components/UnsupportedNetwork';
import { Deferrable } from '@ethersproject/properties';
import {
  TransactionRequest,
  TransactionResponse,
} from "@ethersproject/abstract-provider";





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
const accountSourceSigners = new Map<string, InjectedSigner>();
const addressSigners = new Map<string, Signer | undefined>();

const getAccountInjectedSigner = async (
  source: string = reefExt.REEF_EXTENSION_IDENT
): Promise<InjectedSigner | undefined> => {
  if (!accountSourceSigners.has(source)) {
    await reefExt.web3Enable(source)
    const signer = await reefExt.web3FromSource(source)
      .then((injected: any) => injected?.signer)
      .catch((err : any) => console.error("getAccountSigner error =", err));
    if (!signer) {
      console.warn("Can not get signer for source=" + source);
    }
    if (signer) {
      accountSourceSigners.set(source, signer);
    }
  }
  return accountSourceSigners.get(source)!;
};

export const getAccountSigner = async (
  address: string,
  provider: Provider,
  // source?: string,
  injSignerOrSource?: InjectedSigner | string
): Promise<Signer | undefined> => {
  let signingKey: InjectedSigner | undefined =
    injSignerOrSource as InjectedSigner;
    console.log({injSignerOrSource})
  
    //signingKey = await getAccountInjectedSigner('reef');
 
  //console.log({signingKey})
  if (!addressSigners.has(address)) {
    addressSigners.set(
      address,
      signingKey
        ? new ReefSignerWrapper(
            provider,
            address,
            // @ts-ignore
            new ReefSigningKeyWrapper(signingKey)
          )
        : undefined
    );
        
    //addressSigners.signingKey.signRaw({address: account.address, data:'sign message', type:'payload'})
  }
  return addressSigners.get(address);
};

export class ReefSignerWrapper extends Signer {
  constructor(provider: Provider, address: string, signingKey: InjectedSigner) {
    super(provider, address, signingKey as any);
  }

  sendTransaction(
    _transaction: Deferrable<TransactionRequest>
  ): Promise<TransactionResponse> {
    return super.sendTransaction(_transaction);
  }
}
export class ReefSigningKeyWrapper implements InjectedSigner {
  private sigKey: InjectedSigner | undefined;
  constructor(signingKey?: InjectedSigner) {
    this.sigKey = signingKey;
    
  }

  // @ts-ignore
  signPayload(payload: SignerPayloadJSON) {
    console.log("SIG PAYLOAD=", payload.method);

    return this.sigKey?.signPayload
      ? this.sigKey.signPayload(payload).then(
          (res:any) => {
            // console.log('SIGG DONE')
            return res;
          },
          (rej:any) => {
            // console.log('SIGG REJJJJ')
            throw rej;
          }
        )
      : Promise.reject("ReefSigningKeyWrapper - not implemented");
  }

  signRaw(raw: SignerPayloadRaw) {
    return this.sigKey?.signRaw
      ? this.sigKey.signRaw(raw)
      : Promise.reject("ReefSigningKeyWrapper - not implemented");
  }
}

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

  const walletAvailable: { key: string; label: string; icon: JSX.Element }[] = [
   {
    key: reefExt.REEF_EXTENSION_IDENT,
    label: "Reef Browser",
    icon: <WALLET_ICONS.reefwallet />
   },
   {
    key: reefExt.REEF_WALLET_CONNECT_IDENT,
    label: "Wallet Connect",
    icon: < WALLET_ICONS.walletconnect/>
   }
  ]


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

  const selectAccount = async (accountAddress: string) => {
    const account = signers.find(signer => signer.address === accountAddress)

    if(account) reefState.setSelectedAddress(account.address);
    

    if(account) {
      if(provider) {
        const providerToUse = provider as unknown as Provider;
        const signer = account.signer as unknown as InjectedSigner;
        console.log({signer, providerToUse})
        await reefExt.web3Enable(account.source)
        const injector = await reefExt.web3FromSource(account.source);
        console.log({injector})
        const signRaw = injector?.signer?.signRaw;
        console.log({signRaw})
        if(!!signRaw) {
          const message = "custom message";

    // after making sure that signRaw is defined
    // we can use it to sign our message
    const { signature } = await signRaw({
        address: account.address,
        data: message,
        type: 'bytes'
    });

    console.log({signature})
    const isValidSignature = (signedMessage: any, signature: any, address: any) => {
      const publicKey = decodeAddress(address);
      const hexPublicKey = u8aToHex(publicKey);

      return signatureVerify(signedMessage, signature, hexPublicKey).isValid;
    };

    

    // `signRaw` method wraps the message with `<Bytes>` tag before signing
    const isValid = isValidSignature(
      message,
      signature,
      account.address
    );
    console.log(isValid)
    
        }
        //const x =  new ReefSigningKeyWrapper(signer);
        /*const addressToSign = await getAccountSigner(account.address,providerToUse, signer)
        console.log({addressToSign})
        if(addressToSign) {
          const x = new ReefSigningKeyWrapper(addressToSign?.signingKey.sigKey)
          console.log({x})
           x.signRaw({address: account.address, data:'sign message', type:'payload'})
        }  */
        
        //await addressToSign.signingKey.signRaw({address: account.address, data:'sign message', type:'payload'})
        //x.signRaw({address: account.address, data:'sign message', type:'payload'})
      }
      
    }

    
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

          {!selExtensionName && (
                !loading ? (
                  <Box 
                    css={{ width: '$full' }}>
                    <Flex
                      column
                      css={{ width: '$full', gap: '$md', }}>
                      {
                        walletAvailable.map((wallet) => (
                          <WalletButton
                            onClick={() => onExtensionSelected(wallet.key)}
                            label={wallet.label}
                            icon={wallet.icon} 
                          />
                        ))
                      }
                      
                      
                    </Flex>
                  </Box>
                ) : (
                  <LoadingState cancelConnection={() => setSelExtensionName(undefined)} />
                )
            ) 
          }

          {selExtensionName && (
              unsupportedNetwork ?  (
                <UnsupportedNetwork 
                  switchToMainnet={() => switchToMainnet('mainnet')}/>
              ) : (
                  <AccountSelector 
                    signers={signers}
                    selectAccount={(accountAddress) => selectAccount(accountAddress)}
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
