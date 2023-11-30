/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect } from 'react';

import { ethers } from 'ethers';
import { useAuthStore } from 'features/auth';
import { DateTime } from 'luxon';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { NavLink } from 'react-router-dom';

import {
  NOTIFICATIONS_COUNT_QUERY_KEY,
  useNotificationCount,
} from '../../features/notifications/useNotificationCount';
import { Briefcase, MessageSquare, Smile } from '../../icons/__generated';
import { order_by } from '../../lib/gql/__generated__/zeus';
import { client } from '../../lib/gql/client';
import { coLinksPaths } from '../../routes/paths';
import {
  Avatar,
  Button,
  ContentHeader,
  Flex,
  Link,
  Panel,
  Text,
} from '../../ui';
import { SingleColumnLayout } from '../../ui/layouts';
import isFeatureEnabled from 'config/features';

const fetchNotifications = async () => {
  const { notifications } = await client.query(
    {
      notifications: [
        {
          order_by: [{ id: order_by.desc }],
          limit: 100,
        },
        {
          id: true,
          created_at: true,
          profile: {
            avatar: true,
            name: true,
            address: true,
          },
          actor_profile_public: {
            avatar: true,
            name: true,
            address: true,
          },
          reaction: {
            reaction: true,
            profile_id: true,
            activity_id: true,
            created_at: true,
          },
          reply: {
            id: true,
            created_at: true,
            reply: true,
            activity_id: true,
          },
          invited_profile_public: {
            avatar: true,
            name: true,
            address: true,
          },
          link_tx: {
            buy: true,
            tx_hash: true,
            link_amount: true,
            eth_amount: true,
            created_at: true,
            // TODO: remove and refactor
            target_profile: {
              avatar: true,
              name: true,
              address: true,
            },
            holder_profile: {
              avatar: true,
              name: true,
              address: true,
            },
          },
        },
      ],
    },
    {
      operationName: 'notifications',
    }
  );
  return notifications;
};

type Notification = Awaited<ReturnType<typeof fetchNotifications>>[number];

export type Actor = NonNullable<Notification['actor_profile_public']>;
export type Profile = NonNullable<Notification['profile']>;
export type LinkTx = NonNullable<Notification['link_tx']>;
export type Reply = NonNullable<Notification['reply']>;
export type Reaction = NonNullable<Notification['reaction']>;
export type Invitee = NonNullable<Notification['invited_profile_public']>;

export const NotificationsPage = () => {
  const { count } = useNotificationCount();

  const profileId = useAuthStore(state => state.profileId);

  const queryClient = useQueryClient();

  const { data: notifications } = useQuery(
    ['notifications', 'recent'],
    fetchNotifications
  );

  const { mutate: markAsUnread } = useMutation(
    async (profileId: number) => {
      await client.mutate(
        {
          update_profiles_by_pk: [
            {
              pk_columns: { id: profileId },
              _set: {
                last_read_notification_id: null,
              },
            },
            {
              id: true,
            },
          ],
        },
        {
          operationName: 'notification__update_last_notification_read',
        }
      );
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: NOTIFICATIONS_COUNT_QUERY_KEY,
        });
      },
    }
  );
  // wrap this is a useMutation hook
  const { mutate: updateLastNotificationRead } = useMutation(
    async ({
      profileId,
      last_read_id,
    }: {
      profileId: number;
      last_read_id: number;
    }) => {
      return await client.mutate(
        {
          update_profiles_by_pk: [
            {
              pk_columns: { id: profileId },
              _set: {
                last_read_notification_id: last_read_id,
              },
            },
            {
              id: true,
              last_read_notification_id: true,
            },
          ],
        },
        {
          operationName: 'notification__update_last_notification_read',
        }
      );
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: NOTIFICATIONS_COUNT_QUERY_KEY,
          refetchInactive: true,
          refetchActive: true,
        });
      },
    }
  );

  useEffect(() => {
    if (profileId && notifications && notifications.length > 0) {
      const last_read_id = notifications[0].id;
      const params = { profileId, last_read_id };
      updateLastNotificationRead(params);
    }
  }, [profileId, notifications]);

  return (
    <SingleColumnLayout>
      <ContentHeader>
        <Text h2 display>
          Notifications
        </Text>
      </ContentHeader>
      {isFeatureEnabled('debug') &&
        profileId &&
        notifications &&
        notifications.length > 0 && (
          <Flex>
            <Button
              inline
              onClick={() => {
                updateLastNotificationRead({
                  profileId: profileId,
                  last_read_id: notifications[0].id,
                });
              }}
            >
              Mark Notifications as Read
            </Button>
            <Button
              inline
              onClick={() => {
                markAsUnread(profileId);
              }}
            >
              Mark Notifications as UnRead
            </Button>
          </Flex>
        )}
      <Flex column css={{ gap: '$lg', maxWidth: '$readable' }}>
        {notifications !== undefined && notifications.length === 0 ? (
          <Panel noBorder>No notifications yet</Panel>
        ) : (
          notifications?.map(n => (
            <Flex key={n.id}>
              {/*// case on types*/}
              {n.reply ? (
                <Reply
                  reply={n.reply}
                  actor={n.actor_profile_public}
                  profile={n.profile}
                />
              ) : n.link_tx ? (
                <LinkTxNotification tx={n.link_tx} />
              ) : n.invited_profile_public ? (
                <InviteeNotification invitee={n.invited_profile_public} n={n} />
              ) : n.reaction ? (
                <ReactionNotification reaction={n.reaction} n={n} />
              ) : null}
            </Flex>
          ))
        )}
      </Flex>
    </SingleColumnLayout>
  );
};

export const Reply = ({
  reply,
  actor,
  profile,
}: {
  reply: Reply;
  actor?: Actor;
  profile: Profile;
}) => {
  return (
    <NotificationItem>
      <Flex key={reply.id} css={{ alignItems: 'flex-start', gap: '$sm' }}>
        <Icon>
          <MessageSquare size={'lg'} />
        </Icon>
        <Link as={NavLink} to={coLinksPaths.profile(actor?.address ?? 'FIXME')}>
          <Avatar path={actor?.avatar} name={actor?.name} size="small" />
        </Link>
        <Flex column css={{ pl: '$xs', gap: '$xs' }}>
          <Flex css={{ gap: '$xs', alignItems: 'center' }}>
            <Link
              as={NavLink}
              css={{
                display: 'inline',
                alignItems: 'center',
                gap: '$xs',
                mr: '$xs',
              }}
              to={coLinksPaths.profile(actor?.address ?? 'FIXME')}
            >
              <Text inline semibold size="small">
                {actor?.name}
              </Text>
            </Link>

            <Flex
              as={NavLink}
              to={coLinksPaths.post(`${reply.activity_id}`)}
              css={{
                alignItems: 'flex-end',
                color: '$text',
                textDecoration: 'none',
              }}
            >
              <Text size="small">replied to your post</Text>
              <Text size="xs" color="neutral" css={{ pl: '$sm' }}>
                {DateTime.fromISO(reply.created_at).toLocal().toRelative()}
              </Text>
            </Flex>

            {/* <Link */}
            {/*   as={NavLink} */}
            {/*   css={{ */}
            {/*     display: 'inline', */}
            {/*     alignItems: 'center', */}
            {/*     gap: '$xs', */}
            {/*     mr: '$xs', */}
            {/*   }} */}
            {/*   to={paths.coLinksProfile(tx.target_profile?.address ?? 'FIXME')} */}
            {/* > */}
            {/*   <Text inline size="small" semibold> */}
            {/*     {tx.target_profile?.name} */}
            {/*   </Text> */}
            {/* </Link> */}

            {/* <Text inline size="small" css={{ mr: '$xs' }}> */}
            {/*   link */}
            {/* </Text> */}
          </Flex>
          <Text
            color={'default'}
            as={NavLink}
            to={coLinksPaths.post(`${reply.activity_id}`)}
            css={{ textDecoration: 'none' }}
          >
            {reply.reply}
          </Text>
        </Flex>
      </Flex>
    </NotificationItem>
  );
};

export const LinkTxNotification = ({ tx }: { tx: LinkTx }) => {
  return (
    <NotificationItem>
      <Flex key={tx.tx_hash} css={{ alignItems: 'flex-start', gap: '$sm' }}>
        <Icon>
          <Briefcase size={'lg'} css={{ mt: '-$xs' }} />
        </Icon>
        <Avatar
          path={tx.holder_profile?.avatar}
          name={tx.holder_profile?.name}
          size="small"
        />
        <Flex column css={{ pl: '$xs', gap: '$xs' }}>
          <Flex css={{ gap: '$xs', alignItems: 'flex-end' }}>
            <Link
              as={NavLink}
              css={{
                display: 'inline',
                alignItems: 'center',
                gap: '$xs',
                mr: '$xs',
              }}
              to={coLinksPaths.profile(tx.holder_profile?.address ?? 'FIXME')}
            >
              <Text inline semibold size="small">
                {tx.holder_profile?.name}
              </Text>
            </Link>

            <Text size="small" inline>
              {tx.buy ? 'bought ' : 'sold '}
            </Text>

            <Text inline size="small" css={{ mr: '$xs' }}>
              {tx.link_amount} of your links
            </Text>
            <Text size="xs" color="neutral">
              {DateTime.fromISO(tx.created_at).toLocal().toRelative()}
            </Text>
          </Flex>
          <Flex css={{ justifyContent: 'flex-start' }}>
            <Text size="xs" semibold color={tx.buy ? 'complete' : 'warning'}>
              {ethers.utils.formatEther(tx.eth_amount)} ETH
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </NotificationItem>
  );
};

export const ReactionNotification = ({
  reaction,
  n,
}: {
  reaction: Reaction;
  n: Notification;
}) => {
  return (
    <NotificationItem>
      <Flex css={{ alignItems: 'center', gap: '$sm' }}>
        <Icon>
          <Smile size={'lg'} css={{ mt: '-$xs' }} />
        </Icon>
        <Avatar
          path={n.actor_profile_public?.avatar}
          name={n.actor_profile_public?.name}
          size="small"
        />
        <Flex column css={{ pl: '$xs', gap: '$xs' }}>
          <Flex css={{ gap: '$xs', alignItems: 'flex-end' }}>
            <Link
              as={NavLink}
              css={{
                display: 'inline',
                alignItems: 'center',
                gap: '$xs',
                mr: '$xs',
              }}
              to={coLinksPaths.profile(
                n.actor_profile_public?.address ?? 'FIXME'
              )}
            >
              <Text inline semibold size="small">
                {n.actor_profile_public?.name}
              </Text>
            </Link>

            <Flex
              as={NavLink}
              to={coLinksPaths.post(`${reaction.activity_id}`)}
              css={{
                alignItems: 'flex-end',
                color: '$text',
                textDecoration: 'none',
              }}
            >
              <Text size="small">reacted {reaction.reaction} to your post</Text>
              <Text size="xs" color="neutral" css={{ pl: '$sm' }}>
                {DateTime.fromISO(reaction.created_at).toLocal().toRelative()}
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </NotificationItem>
  );
};

export const InviteeNotification = ({
  invitee,
  n,
}: {
  invitee: Invitee;
  n: Notification;
}) => {
  return (
    <NotificationItem>
      <Flex
        css={{ justifyContent: 'flex-start', alignItems: 'center', gap: '$xs' }}
      >
        <Icon>
          <Smile size={'lg'} />
        </Icon>
        <Avatar
          path={n.actor_profile_public?.avatar}
          name={n.actor_profile_public?.name}
          size="small"
        />
        <Flex column css={{ pl: '$xs', gap: '$xs' }}>
          <Flex css={{ gap: '$xs', alignItems: 'flex-end' }}>
            <Link
              as={NavLink}
              css={{
                display: 'inline',
                gap: '$xs',
                mr: '$xs',
              }}
              to={coLinksPaths.profile(
                n.actor_profile_public?.address ?? 'FIXME'
              )}
            >
              <Text inline semibold size="small">
                {n.actor_profile_public?.name}
              </Text>
            </Link>

            <Flex
              as={NavLink}
              to={coLinksPaths.profile(`${invitee.address}`)}
              css={{
                alignItems: 'flex-end',
                color: '$text',
                textDecoration: 'none',
              }}
            >
              <Text size="small">joined from your invite!</Text>
              <Text size="xs" color="neutral" css={{ pl: '$sm' }}>
                {DateTime.fromISO(n.created_at).toLocal().toRelative()}
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </NotificationItem>
  );
};

export const NotificationItem = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <Flex css={{ alignItems: 'flex-start', gap: '$sm' }}>{children}</Flex>;
};

const Icon = ({ children }: { children: React.ReactNode }) => {
  return (
    <Text color={'neutral'} css={{ pt: '$sm' }}>
      {children}
    </Text>
  );
};