import { Suspense, useEffect, useState } from 'react';

import { CoSoulArt } from 'features/cosoul/art/CoSoulArt';
import { uploadImage } from 'features/images/upload';
import { client } from 'lib/gql/client';
import { Role } from 'lib/users';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router';
import { useParams } from 'react-router-dom';

import { ActivityList } from '../../features/activities/ActivityList';
import {
  FormFileUpload,
  LoadingModal,
  ProfileSkills,
  ProfileSocialIcons,
} from 'components';
import { EditProfileModal } from 'components/EditProfileModal';
import { useImageUploader, useToast } from 'hooks';
import { useFetchManifest } from 'hooks/legacyApi';
import { Edit3, ExternalLink } from 'icons/__generated';
import { useMyProfile } from 'recoilState';
import {
  coSoulPaths,
  EXTERNAL_URL_WHY_COORDINAPE_IN_CIRCLE,
} from 'routes/paths';
import { Avatar, Box, Button, Flex, Link, MarkdownPreview, Text } from 'ui';
import { SingleColumnLayout } from 'ui/layouts';
import { getAvatarPath } from 'utils/domain';

import {
  QUERY_KEY_PROFILE_TOTAL_PGIVE,
  queryProfile,
  queryProfilePgive,
} from './queries';

import type { IMyProfile, IProfile } from 'types';

export const ProfilePage = () => {
  const { profileAddress: address } = useParams();

  // FIXME replace this with react-query
  const myProfile = useMyProfile();

  const isMe = address === 'me' || address === myProfile.address;
  if (!(isMe || address?.startsWith('0x'))) {
    return <></>; // todo better 404?
  }
  return isMe ? <MyProfilePage /> : <OtherProfilePage address={address} />;
};

const MyProfilePage = () => {
  const myProfile = useMyProfile();

  return <ProfilePageContent profile={myProfile} isMe />;
};

const OtherProfilePage = ({ address }: { address: string }) => {
  const { data: profile } = useQuery(
    ['profile', address],
    () => queryProfile(address),
    { staleTime: Infinity }
  );

  return !profile ? (
    <LoadingModal visible note="profile" />
  ) : (
    <ProfilePageContent profile={profile} />
  );
};

const ProfilePageContent = ({
  profile,
  isMe,
}: {
  profile: IMyProfile | IProfile;
  isMe?: boolean;
}) => {
  const users = (profile as IMyProfile)?.myUsers ?? profile?.users ?? [];
  const user = users[0];
  const name =
    profile.name ||
    user?.profile?.name ||
    users?.[0]?.profile?.name ||
    'unknown';

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const fetchManifest = useFetchManifest();
  const updateBackground = async (newAvatar: File) => {
    await uploadImage({
      file: newAvatar,
      onSuccess: async (resp: any) => {
        const newAvatar = resp.result.variants.find((s: string) =>
          s.match(/original$/)
        );
        await updateProfileBackground(newAvatar);
        await fetchManifest();
      },
    });
  };
  const navigate = useNavigate();

  const {
    imageUrl: backgroundUrl,
    formFileUploadProps: backgroundUploadProps,
  } = useImageUploader(getAvatarPath(profile?.background) || '');

  const { showError } = useToast();
  const artWidth = '320px';

  const { data: coSoul } = useQuery(
    [QUERY_KEY_PROFILE_TOTAL_PGIVE, profile.address],
    () => queryProfilePgive(profile.address),
    {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  useEffect(() => {
    if (name === 'unknown') {
      showError("Couldn't find that user");
      navigate('/');
    }
  }, [name]);

  return (
    <Flex column>
      <Flex
        row
        css={{
          width: '100%',
          minHeight: '300px',
          background: backgroundUrl ? `url(${backgroundUrl})` : 'white',

          backgroundImage: backgroundUrl
            ? undefined
            : 'radial-gradient(circle at center -30px, $profileGradientStart, $profileGradientEnd), repeating-radial-gradient(circle at center -30px, $profileGradientEnd, $profileGradientEnd, 83px, transparent 106px, transparent 83px)',
          backgroundBlendMode: 'multiply',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {isMe && (
          <Box css={{ alignSelf: 'flex-end', m: '$lg' }}>
            <FormFileUpload
              editText="Edit Background"
              uploadText="Upload Background"
              {...backgroundUploadProps}
              commit={f =>
                updateBackground(f)
                  .catch(console.warn)
                  .then(() => backgroundUploadProps.onChange(undefined))
              }
              accept="image/gif, image/jpeg, image/png"
            />
          </Box>
        )}
      </Flex>
      <SingleColumnLayout>
        <Flex
          css={{
            gap: '$md',
            m: '$lg',
            justifyContent: 'space-between',
            '@sm': {
              m: 0,
            },
          }}
        >
          <Flex column css={{ px: '$sm', width: '100%' }}>
            <Flex
              row
              css={{
                justifyContent: 'space-between',
                position: 'relative',
                gap: '$lg',
                '@sm': {
                  flexDirection: 'column',
                },
              }}
            >
              <Flex
                css={{
                  width: '100%',
                  mr: coSoul?.mintInfo ? `calc(${artWidth} + $lg)` : 0,
                  gap: '$md',
                  '@sm': {
                    mr: 0,
                  },
                }}
              >
                <Flex
                  css={{
                    gap: '$lg',
                    width: '100%',
                    '@sm': {
                      flexDirection: 'column',
                    },
                  }}
                >
                  <Avatar
                    size="xl"
                    path={profile?.avatar}
                    hasCoSoul={profile.hasCoSoul}
                  />
                  <Flex column css={{ alignItems: 'flex-start', gap: '$md' }}>
                    <Flex css={{ gap: '$lg' }}>
                      <Text
                        h2
                        css={{
                          overflowWrap: 'anywhere',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                        }}
                      >
                        {name}
                      </Text>
                      <Flex css={{ alignItems: 'center' }}>
                        <ProfileSocialIcons profile={profile} />
                      </Flex>
                    </Flex>

                    {user?.role === Role.COORDINAPE ? (
                      <div>
                        Orcanize is the platform you’re using right now! We
                        currently offer our service for free and invite people
                        to allocate to us from within your circles. All tokens
                        received go to the Orcanize treasury.{' '}
                        <Link
                          inlineLink
                          href={EXTERNAL_URL_WHY_COORDINAPE_IN_CIRCLE}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Let us know what you think.
                        </Link>
                      </div>
                    ) : (
                      <MarkdownPreview
                        render
                        source={profile?.bio}
                        css={{ cursor: 'default' }}
                      />
                    )}
                    <ProfileSkills
                      skills={profile.skills ?? []}
                      isAdmin={user?.role === 1}
                      max={50}
                    />
                  </Flex>
                </Flex>
                {isMe && (
                  <Flex column>
                    <Button
                      color="primary"
                      onClick={() => setEditProfileOpen(true)}
                    >
                      <Edit3 />
                      Edit Profile
                    </Button>
                    <Suspense fallback={<></>}>
                      <EditProfileModal
                        open={editProfileOpen}
                        onClose={() => setEditProfileOpen(false)}
                      />
                    </Suspense>
                  </Flex>
                )}
              </Flex>
              {coSoul?.mintInfo && (
                <Flex
                  column
                  css={{
                    gap: '$md',
                    position: 'absolute',
                    right: 0,
                    top: '-160px',
                    '@sm': {
                      position: 'relative',
                      top: 0,
                      alignItems: 'center',
                    },
                  }}
                >
                  <CoSoulArt
                    pGive={coSoul.totalPgive}
                    address={profile.address}
                    repScore={coSoul.repScore}
                    width={artWidth}
                  />
                  <Button
                    color="secondary"
                    onClick={() => {
                      navigate(coSoulPaths.cosoulView(profile.address));
                    }}
                    css={{ whiteSpace: 'pre-wrap' }}
                  >
                    Check CoSoul Stats {<ExternalLink />}
                  </Button>
                </Flex>
              )}
            </Flex>
            <Flex
              column
              css={{
                mt: '$2xl',
                rowGap: '$lg',
                width: coSoul?.mintInfo
                  ? `calc(100% - ${artWidth} - $lg)`
                  : '100%',
                '@sm': {
                  width: '100%',
                },
                '.contributionRow': {
                  background: '$surface ',
                  p: '$md $md $md 0',
                },
              }}
            >
              <Text size="large">Recent Activity</Text>
              <ActivityList
                drawer
                queryKey={['profile-activities', profile.id]}
                where={{
                  _and: [
                    { private_stream: { _eq: false } },
                    {
                      big_question_id: { _is_null: true },
                    },
                    {
                      _or: [
                        { target_profile_id: { _eq: profile.id } },
                        { actor_profile_id: { _eq: profile.id } },
                      ],
                    },
                  ],
                }}
              />
            </Flex>
          </Flex>
        </Flex>
      </SingleColumnLayout>
    </Flex>
  );
};

const updateProfileBackground = async (avatar_url: string) => {
  return client.mutate(
    {
      uploadProfileBackground: [
        { payload: { url: avatar_url } },
        {
          profile: {
            avatar: true,
          },
        },
      ],
    },
    {
      operationName: 'updateProfileAvatar',
    }
  );
};

export default ProfilePage;
