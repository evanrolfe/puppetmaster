// @flow
// eslint-disable-next-line no-unused-vars
import React, { useEffect } from 'react';
import { useTrackedState } from '../state/state';

export default () => {
  const state = useTrackedState();
  const { activeTheme } = state;

  console.log('[RENDER] ThemedSetter');

  useEffect(
    () => {
      console.log(`Setting theme to: ${activeTheme}`);
      document.body.setAttribute('theme', activeTheme);
    },
    [activeTheme]
  );

  return <></>;
};
