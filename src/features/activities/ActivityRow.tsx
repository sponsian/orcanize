import React from 'react';

import * as Sentry from '@sentry/react';
import { CastByline } from 'features/farcaster/casts/CastByline';

import { Flex, Text } from '../../ui';
import { CastRow } from '../farcaster/casts/CastRow';
import { isFeatureEnabled } from 'config/features';

import { CoLinksPostRowChild } from './CoLinksPostRowChild';
import { ContributionRow } from './ContributionRow';
import { DeletedRow } from './DeletedRow';
import { EpochCreatedRow } from './EpochCreatedRow';
import { EpochEndedRow } from './EpochEndedRow';
import { EpochStartedRow } from './EpochStartedRow';
import { NewUserRow } from './NewUserRow';
import { PostRow } from './PostRow';
import {
  Activity,
  IsCast,
  IsContribution,
  IsDeleted,
  IsEpochCreated,
  IsEpochEnded,
  IsEpochStarted,
  IsNewUser,
} from './useInfiniteActivities';

// hi

export const ActivityRow = ({
  activity,
  drawer,
  focus = false,
}: {
  activity: Activity;
  drawer?: boolean;
  focus?: boolean;
}) => {
  const valid = validActivity(activity, focus, drawer);

  if (!valid) {
    if (isFeatureEnabled('debug')) {
      if (IsDeleted(activity)) {
        return <DeletedRow activity={activity} />;
      } else {
        const event: Sentry.Event = {
          message: JSON.stringify({
            activity_id: activity.id,
            activity_action: activity.action,
          }),
        };
        Sentry.captureEvent(event);
        return <Text>Unknown activity: {activity.action}</Text>;
      }
    }
    return null;
  }

  return (
    <Flex column css={{ transition: '1.0s all ease-out' }}>
      {valid}
    </Flex>
  );
};

const validActivity = (
  activity: Activity,
  focus: boolean,
  drawer?: boolean
) => {
  if (IsContribution(activity)) {
    if (activity.private_stream || activity.big_question) {
      return (
        <PostRow activity={activity} focus={focus} editAllowed={true}>
          {({ editing, editable, setEditing }) => (
            <CoLinksPostRowChild
              activity={activity}
              editable={editable}
              editing={editing}
              setEditing={setEditing}
            />
          )}
        </PostRow>
      );
    } else {
      return (
        <ContributionRow activity={activity} drawer={drawer} focus={focus} />
      );
    }
  } else if (IsCast(activity)) {
    return (
      <>
        <PostRow
          activity={activity}
          focus={focus}
          editAllowed={false}
          postType="cast"
          castByline={<CastByline cast={activity.cast} />}
        >
          {() => <CastRow cast={activity.cast} activity={activity} />}
        </PostRow>
      </>
    );
  } else if (IsNewUser(activity)) {
    return <NewUserRow activity={activity} />;
  } else if (IsEpochCreated(activity)) {
    return <EpochCreatedRow activity={activity} />;
  } else if (IsEpochStarted(activity)) {
    return <EpochStartedRow activity={activity} />;
  } else if (IsEpochEnded(activity)) {
    return <EpochEndedRow activity={activity} />;
  }
  return undefined;
};
