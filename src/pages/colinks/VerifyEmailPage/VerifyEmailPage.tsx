import { useEffect, useState } from 'react';

import { useAuthStateMachine } from 'features/auth/RequireAuth';
import { useNavigate } from 'react-router';
import { useParams } from 'react-router-dom';

import { LoadingModal } from '../../../components';
import { coLinksPaths } from '../../../routes/paths';
import { Button, CenteredBox, Panel, Text } from '../../../ui';

export const VerifyEmailPage = () => {
  useAuthStateMachine(false);
  const { uuid } = useParams();
  const navigate = useNavigate();

  const [verifyMessage, setVerifyMessage] = useState<string | undefined>();

  useEffect(() => {
    try {
      fetch('/api/email/verify/' + uuid).then(res => {
        res.json().then(res => {
          setVerifyMessage(res.message);
        });
      });
    } catch (e) {
      if (e instanceof Error) {
        setVerifyMessage(e.message ?? 'unknown error');
      } else {
        setVerifyMessage('Invalid uuid or network error');
      }
    }
  }, []);

  if (!verifyMessage) {
    return <LoadingModal visible={true} note="verifying-email" />;
  }

  return (
    <>
      {verifyMessage && (
        <CenteredBox css={{ gap: '$md' }}>
          <Text h2 css={{ justifyContent: 'center' }}>
            Email Verification
          </Text>
          <Panel nested>
            <Text>{verifyMessage}</Text>
          </Panel>
          <Button
            onClick={() => {
              navigate(coLinksPaths.home, {
                replace: true,
              });
            }}
          >
            Continue to CoLinks
          </Button>
          <Button
            color="secondary"
            onClick={() => {
              navigate(coLinksPaths.account, {
                replace: true,
              });
            }}
          >
            View Email Settings
          </Button>
        </CenteredBox>
      )}
    </>
  );
};

export default VerifyEmailPage;