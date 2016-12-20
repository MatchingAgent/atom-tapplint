/** @babel */

import { allowUnsafeNewFunction } from 'loophole';

module.exports = () => {
  let tapplint;
  allowUnsafeNewFunction(() => {
    tapplint = require('tapplint');
  });
  return tapplint;
};
