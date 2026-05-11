import noFunctionDeclaration from './rules/no-function-declaration.mjs';
import noPrivateKeyword from './rules/no-private-keyword.mjs';

export default {
  meta: { name: '@blotch/oxlint-plugin' },
  rules: {
    'no-function-declaration': noFunctionDeclaration,
    'no-private-keyword': noPrivateKeyword,
  },
};
