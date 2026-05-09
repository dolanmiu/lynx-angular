import { createHash } from 'node:crypto';

export const generateComponentScopeId = (
  className: string,
  containingFile: string,
): string => {
  const hash = createHash('sha256')
    .update(`${className}|${containingFile}`)
    .digest('hex')
    .slice(0, 10);
  return `l${hash}`;
};
