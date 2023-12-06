import assert from 'assert';
import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod/dist/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from 'react-query';
import { z } from 'zod';

import { FormInputField } from '../../components';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { OrBar } from '../../components/OrBar';
import { useToast } from '../../hooks';
import { Check } from '../../icons/__generated';
import { client } from '../../lib/gql/client';
import { Button, Flex, Panel, Text } from '../../ui';
import { useAuthStore } from '../auth';

const INVITE_REDEEM_QUERY_KEY = 'myInviteStatus';
export const RedeemInviteCode = ({
  setRedeemedInviteCode,
}: {
  setRedeemedInviteCode: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const profileId = useAuthStore(state => state.profileId);

  const [loading, setLoading] = useState(false);

  const [requestedInviteCode, setRequestedInviteCode] = useState(false);

  const redeemSchema = z.object({ code: z.string().min(11) });
  type RedeemParams = z.infer<typeof redeemSchema>;

  const joinWaitListSchema = z.object({ email: z.string().email() });
  type JoinWaitListParams = z.infer<typeof joinWaitListSchema>;

  const queryClient = useQueryClient();
  const { showError } = useToast();

  const {
    handleSubmit: handleRedeemSubmit,
    formState: { isValid: isRedeemValid },
    control: redeemControl,
  } = useForm<RedeemParams>({
    resolver: zodResolver(redeemSchema),
    reValidateMode: 'onChange',
    mode: 'onChange',
  });

  const {
    handleSubmit: handleJoinSubmit,
    formState: { isValid: isJoinValid },
    control: joinControl,
  } = useForm<JoinWaitListParams>({
    resolver: zodResolver(joinWaitListSchema),
    reValidateMode: 'onChange',
    mode: 'onChange',
  });

  assert(profileId);

  const { data } = useQuery([INVITE_REDEEM_QUERY_KEY], async () => {
    const { profiles_by_pk } = await client.query(
      {
        profiles_by_pk: [
          {
            id: profileId,
          },
          {
            invite_code_redeemed_at: true,
            invite_code_requested_at: true,
          },
        ],
      },
      {
        operationName: 'getMyInviteStatus',
      }
    );
    return {
      redeemed: !!profiles_by_pk?.invite_code_redeemed_at,
      requested: !!profiles_by_pk?.invite_code_requested_at,
    };
  });

  const redeemCode: SubmitHandler<RedeemParams> = async params => {
    try {
      setLoading(true);
      const {
        redeemInviteCode: { success, error },
      } = await client.mutate(
        {
          redeemInviteCode: [
            { payload: { code: params.code } },
            {
              success: true,
              error: true,
            },
          ],
        },
        { operationName: 'redeemInviteCode' }
      );
      if (success) {
        queryClient.invalidateQueries([INVITE_REDEEM_QUERY_KEY]);
      } else {
        showError(error);
      }
    } catch (e) {
      showError(e);
    } finally {
      setLoading(false);
    }
  };

  const joinWaitList: SubmitHandler<JoinWaitListParams> = async params => {
    try {
      setLoading(true);
      const {
        requestInviteCode: { success, error },
      } = await client.mutate(
        {
          requestInviteCode: [
            { payload: { email: params.email } },
            {
              success: true,
              error: true,
            },
          ],
        },
        { operationName: 'requestInviteCode' }
      );
      if (success) {
        queryClient.invalidateQueries([INVITE_REDEEM_QUERY_KEY]);
        setRequestedInviteCode(true);
      } else {
        showError(error);
      }
    } catch (e) {
      showError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data?.redeemed) {
      setRedeemedInviteCode(true);
    }
  }, [data]);

  if (data === undefined) {
    return <LoadingIndicator />;
  }

  if (data?.redeemed) {
    return (
      <Flex css={{ gap: '$md' }}>
        <Panel success>
          <Flex css={{ gap: '$md' }}>
            <Check color={'complete'} />
            <Text semibold>Successfully redeemed invite code.</Text>
          </Flex>
        </Panel>
      </Flex>
    );
  }

  return (
    <Flex column css={{ gap: '$md' }}>
      <form onSubmit={handleRedeemSubmit(redeemCode)}>
        <Flex column css={{ gap: '$md' }}>
          <Flex column css={{ gap: '$xs' }}>
            <Text variant="label">Have an Invite Code?</Text>
            <FormInputField
              id="name"
              name="code"
              placeholder={'Enter your invite code'}
              control={redeemControl}
              defaultValue={''}
              showFieldErrors
            />
          </Flex>
          <Button
            type="submit"
            color="cta"
            fullWidth
            disabled={loading || !isRedeemValid}
          >
            Redeem Invite Code
          </Button>
        </Flex>
      </form>
      <OrBar>Or Join the Wait List</OrBar>
      {data.requested ? (
        <Panel
          success
        >{`Invite code requested. We'll be in touch soon.`}</Panel>
      ) : requestedInviteCode ? (
        <Panel
          info
        >{`Check your email and click the verify link to secure your place.`}</Panel>
      ) : (
        <form onSubmit={handleJoinSubmit(joinWaitList)}>
          <Flex column css={{ gap: '$md' }}>
            <Flex column css={{ gap: '$xs' }}>
              <Text variant="label">Email Address</Text>
              <FormInputField
                id="name"
                name="email"
                placeholder={'Enter your email address'}
                control={joinControl}
                defaultValue={''}
                showFieldErrors
              />
            </Flex>
            <Button
              type="submit"
              color="cta"
              fullWidth
              disabled={loading || !isJoinValid}
            >
              Join Wait List
            </Button>
          </Flex>
        </form>
      )}
    </Flex>
  );
};