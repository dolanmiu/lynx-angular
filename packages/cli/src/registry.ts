export type RegistryEntry = {
  name: string;
  dependencies: string[];
};

export const registry: RegistryEntry[] = [
  { name: 'action-sheet', dependencies: [] },
  { name: 'accordion', dependencies: [] },
  { name: 'alert', dependencies: [] },
  { name: 'alert-dialog', dependencies: [] },
  { name: 'avatar', dependencies: [] },
  { name: 'badge', dependencies: [] },
  { name: 'button', dependencies: ['spinner'] },
  { name: 'card', dependencies: [] },
  { name: 'checkbox', dependencies: [] },
  { name: 'dialog', dependencies: [] },
  { name: 'empty-state', dependencies: ['icon'] },
  { name: 'input', dependencies: [] },
  { name: 'progress', dependencies: [] },
  { name: 'radio-group', dependencies: [] },
  { name: 'select', dependencies: [] },
  { name: 'separator', dependencies: [] },
  { name: 'sheet', dependencies: [] },
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
