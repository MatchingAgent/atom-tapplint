/** @babel */

import cosmiconfig from 'cosmiconfig';

let config = null;

export default filePath => {
  if (config !== null) {
    return Promise.resolve(config);
  } else {
    return cosmiconfig('tapplint').load(filePath).then(result => {
      if (result === null) {
        config = {};
      } else {
        config = result.config || {};
      }

      return config;
    });
  }
};
