/** @babel */

import atom, { Range } from 'atom';
import { install } from 'atom-package-deps';
import { rangeFromLineNumber } from 'atom-linter';
import ruleURI from 'eslint-rule-documentation';
import tapplint from 'tapplint';

const SUPPORTED_SCOPES = [
  'source.js',
  'source.jsx',
  'source.js.jsx'
];

export function activate() {
  install('tapplint');
}

export function provideLinter() {
  return {
    name: 'tapplint',
    grammarScopes: SUPPORTED_SCOPES,
    scope: 'file',
    lintOnFly: true,
    lint: editor => {
      const directory = atom.project.rootDirectories[0];

      if (!directory) {
        return Promise.resolve([]);
      }

      const text = editor.getText();
      const filePath = editor.getPath();
      const report = tapplint.lintText(text, {
        fileName: filePath
      });

      const [{
        messages
      }] = report.results;

      return messages.map(message => {
        return {
          filePath,
          html: selectMessageHtml(message),
          range: selectMessageRange(editor, message),
          type: selectMessageType(message)
        };
      });
    }
  };
}

// (message: Object, err: Error) => string
function selectMessageHtml(result) {
  const { message, ruleId } = result;
  const { url } = ruleURI(ruleId || '');
  const link = ruleId ? `(<a href=${url}>${ruleId}</a>)` : '';

  return `<span>${[message, link].filter(Boolean).join(' ')}</span>`;
}

// (editor: Object, message: Object) => Array<number>
function selectMessageRange(editor, x) {
  const msgLine = x.line - 1;

  if (typeof x.endColumn === 'number' && typeof x.endLine === 'number') {
    const msgCol = Math.max(0, x.column - 1);

    return [
      [msgLine, msgCol],
      [x.endLine - 1, x.endColumn - 1]
    ];
  } else if (typeof x.line === 'number' && typeof x.column === 'number') {
    // we want msgCol to remain undefined if it was intentional so
    // `rangeFromLineNumber` will give us a range over the entire line
    const msgCol = typeof x.column === 'undefined' ? x.column : x.column - 1;

    try {
      return rangeFromLineNumber(editor, msgLine, msgCol);
    } catch (err) {
      throw new Error(`Failed getting range. This is most likely an issue with ESLint. (${x.ruleId} - ${x.message} at ${x.line}:${x.column})`);
    }
  }
}

// (message: Object) => string
function selectMessageType(message) {
  return message.severity === 2 ? 'Error' : 'Warning';
}
