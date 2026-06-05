import consistentPackageVersions from './rules/consistent-package-versions.mjs';
import noFunctionDeclaration from './rules/no-function-declaration.mjs';
import noPrivateKeyword from './rules/no-private-keyword.mjs';

export default {
  meta: { name: '@blotch/oxlint-plugin' },
  rules: {
    'consistent-package-versions': consistentPackageVersions,
    'no-function-declaration': noFunctionDeclaration,
    'no-private-keyword': noPrivateKeyword,
  },
};
