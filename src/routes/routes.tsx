import { Routes } from 'react-router-dom';

import { useIsCoLinksSite } from '../features/colinks/useIsCoLinksSite';

import { coLinksRoutes } from './coLinksRoutes';
import { coSoulRoutes } from './coSoulRoutes';
import { giveRoutes } from './giveRoutes';
import { useRecordPageView } from './hooks';
import { loginRoute } from './loginRoute';

export const AppRoutes = () => {
  useRecordPageView();
  const isCoLinksSite = useIsCoLinksSite();

  const routes = [
    loginRoute,
    ...(isCoLinksSite ? coLinksRoutes : [...coSoulRoutes, ...giveRoutes]),
  ];
  console.log({routes});
  return <Routes>{routes}</Routes>;
};
