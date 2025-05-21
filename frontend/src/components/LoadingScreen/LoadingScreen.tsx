import React from 'react';
import { Loader } from '@mantine/core';
import classes from './LoadingScreen.module.css';

export default function LoadingScreen() {
  return (
    <div className={classes.loadingScreenBackground}>
      <Loader
        style={{
          alignSelf: 'center',
          filter: 'drop-shadow(0 0 24px #ae3ec9)',
          width: 96,
          height: 96,
        }}
        color="red"
        size={96}
        type="bars"
      />
    </div>
  );
}
