export type RegistryEntry = {
  name: string;
  dependencies: string[];
};

export const registry: RegistryEntry[] = [
  { name: 'action-sheet', dependencies: [] },
  { name: 'accordion', dependencies: [] },
  { name: 'alert', dependencies: [] },
  { name: 'alert-dialog', dependencies: [] },
  { name: 'aspect-ratio', dependencies: [] },
  { name: 'avatar', dependencies: ['skeleton'] },
  { name: 'badge', dependencies: [] },
  { name: 'bottom-sheet', dependencies: [] },
  { name: 'button', dependencies: ['spinner'] },
  { name: 'button-group', dependencies: [] },
  { name: 'card', dependencies: [] },
  { name: 'checkbox', dependencies: [] },
  { name: 'collapsible', dependencies: [] },
  { name: 'dialog', dependencies: [] },
  { name: 'empty-state', dependencies: ['icon'] },
  { name: 'input', dependencies: [] },
  { name: 'label', dependencies: [] },
  { name: 'list', dependencies: [] },
  // nav-drawer renders a hamburger trigger via <ui-icon>, so it pulls in `icon`.
  { name: 'nav-drawer', dependencies: ['icon'] },
  { name: 'pagination', dependencies: [] },
  { name: 'progress', dependencies: [] },
  { name: 'radio-group', dependencies: [] },
  { name: 'scroll-area', dependencies: [] },
  { name: 'select', dependencies: ['bottom-sheet'] },
  { name: 'separator', dependencies: [] },
  { name: 'sheet', dependencies: ['bottom-sheet'] },
  { name: 'skeleton', dependencies: [] },
  { name: 'spinner', dependencies: [] },
  { name: 'switch', dependencies: [] },
  { name: 'tabs', dependencies: [] },
  { name: 'textarea', dependencies: [] },
  { name: 'toast', dependencies: [] },
  { name: 'toggle', dependencies: [] },
  { name: 'typography', dependencies: [] },
  { name: 'icon', dependencies: [] },
];

export const getComponentNames = (): string[] => {
  return registry.map((entry) => entry.name);
};

export const getEntry = (name: string): RegistryEntry | undefined => {
  return registry.find((entry) => entry.name === name);
};

/**
 * Depth-first topological sort: dependencies are added to the Set before
 * the component that depends on them. So if `button` depends on `spinner`,
 * the output is [..., spinner, button] — correct installation order.
 * The Set deduplicates components shared by multiple selections.
 */
export const resolveDependencies = (names: string[]): string[] => {
  const resolved = new Set<string>();

  const resolve = (name: string) => {
    if (resolved.has(name)) return;
    const entry = getEntry(name);
    if (!entry) return;
    for (const dep of entry.dependencies) {
      resolve(dep);
    }
    resolved.add(name);
  };

  for (const name of names) {
    resolve(name);
  }

  return [...resolved];
};
