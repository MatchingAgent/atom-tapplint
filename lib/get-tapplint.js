/** @babel */

import { allowUnsafeNewFunction } from 'loophole';

let tapplint = null;

export default () => {
  if (tapplint === null) {
    allowUnsafeNewFunction(() => {
      tapplint = require('tapplint');
    });
  }

  return tapplint;
};
