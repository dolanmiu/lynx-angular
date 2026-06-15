import pc from 'picocolors';
import { diffLines } from 'diff';

export type FileStatus =
  | 'up-to-date'
  | 'auto-upgrade'
  | 'user-modified'
  | 'conflict'
  | 'new-upstream';

export type FileAnalysis = {
  file: string;
  status: FileStatus;
  currentContent: string;
  newContent: string;
};

export type ComponentAnalysis = {
  name: string;
  files: FileAnalysis[];
};

export const STATUS_ICONS: Record<FileStatus, string> = {
  'up-to-date': pc.green('✓'),
  'auto-upgrade': pc.blue('↑'),
  'user-modified': pc.yellow('~'),
  conflict: pc.red('⚠'),
  'new-upstream': pc.blue('+'),
};

export const STATUS_LABELS: Record<FileStatus, string> = {
  'up-to-date': pc.dim('up to date'),
  'auto-upgrade': pc.blue('upstream updated → auto-upgrade'),
  'user-modified': pc.yellow('you modified → keeping yours'),
  conflict: pc.red('conflict — both modified'),
  'new-upstream': pc.blue('new file from upstream'),
};

export const analyzeFile = (
  currentContent: string | null,
  newContent: string,
  storedHash: string | null,
  hashContent: (content: string) => string,
): FileStatus => {
  if (currentContent === null) {
    return 'new-upstream';
  }

  const currentHash = hashContent(currentContent);
  const newHash = hashContent(newContent);

  if (storedHash === null) {
    if (currentHash === newHash) return 'up-to-date';
    return 'conflict';
  }

  if (storedHash === currentHash && storedHash === newHash) return 'up-to-date';
  if (currentHash === newHash) return 'up-to-date';
  if (storedHash === currentHash && storedHash !== newHash)
    return 'auto-upgrade';
  if (storedHash !== currentHash && storedHash === newHash)
    return 'user-modified';
  return 'conflict';
};

export const formatDiff = (
  currentContent: string,
  newContent: string,
): string => {
  const changes = diffLines(currentContent, newContent);
  const lines: string[] = [];

  for (const change of changes) {
    const text = change.value.replace(/\n$/, '');
    const changeLines = text.split('\n');

    for (const line of changeLines) {
      if (change.added) {
        lines.push(pc.green(`+ ${line}`));
      } else if (change.removed) {
        lines.push(pc.red(`- ${line}`));
      } else {
        lines.push(pc.dim(`  ${line}`));
      }
    }
  }

  return lines.join('\n');
};

export const summarizeComponent = (analysis: ComponentAnalysis): FileStatus => {
  const statuses = analysis.files.map((f) => f.status);
  if (statuses.includes('conflict')) return 'conflict';
  if (statuses.includes('auto-upgrade') || statuses.includes('new-upstream'))
    return 'auto-upgrade';
  if (statuses.includes('user-modified')) return 'user-modified';
  return 'up-to-date';
};
