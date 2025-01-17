import assert from 'assert';
import { ReactNode, useEffect } from 'react';

import {
  getMagic,
  getMagicProvider,
  getOptMagic,
  KEY_MAGIC_NETWORK,
} from 'features/auth/magic';
import { useIsCoLinksSite } from 'features/colinks/useIsCoLinksSite';
import { useIsCoSoulSite } from 'features/cosoul/useIsCoSoulSite';
import { useQuery } from 'react-query';

import { LoadingIndicator } from '../../components/LoadingIndicator';
import { client } from '../../lib/gql/client';
import { LoadingModal } from 'components';
import { useToast } from 'hooks';
import { useWeb3React } from 'hooks/useWeb3React';

import { connectors } from './connectors';
import { useAuthStore } from './store';
import { getAuthToken } from './token';
import { useFinishAuth } from './useFinishAuth';
import { useSavedAuth } from './useSavedAuth';
import { WalletAuthModal } from './WalletAuthModal';
import useConnectedWallet from 'hooks/useConnectedWallet';
import { hooks } from '@reef-chain/react-lib';
import { getIpfsGatewayUrl } from 'utils/walletHelper';

// call this hook with showErrors = false if you want to re-establish an
// existing login session where possible, and fail silently
export const useAuthStateMachine = (showErrors: boolean, forceSign = true) => {
  const { selExtensionName, setSelExtensionName } = useConnectedWallet();
  const { savedAuth } = useSavedAuth();
  const web3Context = useWeb3React();
  const finishAuth = useFinishAuth();
  const authStep = useAuthStore(state => state.step);
  const setAuthStep = useAuthStore(state => state.setStep);
  const { showError } = useToast();
  const isCoLinksPage = useIsCoLinksSite();
  const isCoSoulPage = useIsCoSoulSite();
  const isCoPage = isCoSoulPage || isCoLinksPage;
  const magicNetwork = window.localStorage.getItem(KEY_MAGIC_NETWORK);
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
    console.log('testtt');
    /*if (
      forceSign &&
      ['reuse', 'connect'].includes(authStep) &&
      web3Context.active
    ) {*/
      setAuthStep('sign');
      finishAuth()
        .then(success => {
          if (success) {
            setAuthStep('done');
          } else {
            web3Context.deactivate();
          }
        })
        .catch((e: any) => {
          if (showErrors) console.error(e);
          web3Context.deactivate();
        });
    //}

    // reset after logging out or signature error
    if (['sign', 'done'].includes(authStep) && !web3Context.active) {
      setAuthStep('connect');
      return;
    }

    if (
      authStep === 'reuse' ||
      (savedAuth.connectorName === 'magic' &&
        ((magicNetwork !== 'optimism' && isCoPage) ||
          (magicNetwork !== 'polygon' && !isCoPage)))
    ) {
      if (!savedAuth.connectorName) {
        setAuthStep('connect');
        return;
      }

      // success in any of the blocks below will set web3context.active = true,
      // so this useEffect hook will re-run and call setAuthStep('sign') above
      (async () => {
        if (savedAuth.connectorName === 'magic') {
          let info;
          try {
            if (isCoPage) {
              info = await getOptMagic().connect.getWalletInfo();
            } else {
              info = await getMagic().connect.getWalletInfo();
            }
            if (info?.walletType === 'magic') {
              const provider = await getMagicProvider(
                isCoPage ? 'optimism' : 'polygon'
              );
              await web3Context.setProvider(provider, 'magic');
            }
          } catch (e: any) {
            setAuthStep('connect');
            // this error is expected when the user isn't logged in
            if (e?.message.match(/User denied account access/)) return;

            if (showErrors) showError(e);
            web3Context.deactivate();
          }
          return;
        }

        try {
          assert(savedAuth.connectorName);
          await web3Context.activate(
            connectors[savedAuth.connectorName],
            () => {},
            true
          );
        } catch (e) {
          console.log('error2', e);
          setAuthStep('connect');
          if (showErrors) showError(e);
          web3Context.deactivate();
        }
      })();
    }
  }, [savedAuth.connectorName, web3Context.active, isCoSoulPage]);
};

export const RequireWeb3Auth = (props: { children: ReactNode }) => {
  // TODO: when no wallet is available, this isn't real nice - an error is thrown
  // Not sure why when this doesn't throw on the production app / main branch
  useAuthStateMachine(true);
  const authStep = useAuthStore(state => state.step);
  const web3Context = useWeb3React();

  // get a new wallet connection
  if (authStep === 'connect' && !web3Context.active) return <WalletAuthModal />;

  // reuse a connection or request a signature
  if (authStep !== 'done')
    return <LoadingModal visible note={`RequireAuth-${authStep}`} />;

  // render routes
  return <>{props.children}</>;
};

export const RequireLoggedIn = (props: { children: ReactNode }) => {
  const { savedAuth } = useSavedAuth();
  const web3Context = useWeb3React();

  useAuthStateMachine(false, false);

  // if theres a savedAuth connector, reconnect
  useEffect(() => {
    const connectorName = savedAuth.connectorName;

    if (!connectorName) return;
    if (connectorName === 'magic') return;
    // @ts-ignore
    if (connectorName === 'token') return;

    (async () => {
      try {
        // TODO: test reconnecting to magic
        const connector = connectors[connectorName];
        if (connector && !web3Context.active) {
          await web3Context.activate(connector, () => {}, true);
        }
      } catch (e) {
        console.log('error', e);
        console.error(e);
        web3Context.deactivate();
      }
    })();
  }, [savedAuth.connectorName, web3Context.active]);

  const { profileId } = useAuthStore(state => state);

  if (!profileId) {
    return <RestoreLogin>{props.children}</RestoreLogin>;
  }

  return <>{props.children}</>;
};

const RestoreLogin = ({ children }: { children: React.ReactNode }) => {
  const { setProfileId, setAddress } = useAuthStore(state => state);

  // this restores the cookie->AuthToken
  useSavedAuth();

  const authToken = getAuthToken(false);
  // WE should only do this, if we know we have an authtoken, in the store
  const { data: myProfile, isLoading } = useQuery(
    ['myprofile'],
    async () => {
      try {
        const { profiles_private } = await client.query(
          {
            profiles_private: [
              {},
              {
                id: true,
                address: true,
              },
            ],
          },
          {
            operationName: 'whoami',
          }
        );

        return profiles_private.pop();
      } catch (e) {
        return undefined;
      }
    },
    {
      enabled: !!authToken,
      onSuccess: data => {
        if (data) {
          setProfileId(data.id);
          setAddress(data.address as string);
        }
      },
    }
  );

  if (!!authToken && isLoading) {
    return <LoadingIndicator />;
  }

  if (!myProfile) {
    return (
      <RequireWeb3Auth>
        <WalletAuthModal />
      </RequireWeb3Auth>
    );
  }
  return <>{children}</>;
};
