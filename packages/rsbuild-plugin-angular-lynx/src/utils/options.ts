export type PluginAngularLynxOptions = {
  customCSSInheritanceList?: string[] | undefined;
  debugInfoOutside?: boolean;
  defaultDisplayLinear?: boolean;
  defaultOverflowVisible?: boolean;
  enableA11y?: boolean;
  enableAccessibilityElement?: boolean;
  enableCSSInheritance?: boolean;
  enableCSSInvalidation?: boolean;
  enableCSSSelector?: boolean;
  enableICU?: boolean;
  enableNewGesture?: boolean;
  enableParallelElement?: boolean;
  enableRemoveCSSScope?: boolean;
  enableSSR?: boolean;
  /**
   * Build multiple angular.json projects as separate Lynx pages.
   * Each project's `browser` field becomes a named entry producing its own .lynx.bundle.
   *
   * - `string[]` — list of angular.json project names to build
   * - `'all'` — build all `application`-type projects in the workspace
   *
   * When omitted, uses `source.entry` from lynx.config.ts (single or multi-entry).
   */
  pages?: string[] | 'all' | undefined;
  pipelineSchedulerConfig?: number;
  removeDescendantSelectorScope?: boolean;
  targetSdkVersion?: string;
  experimental_isLazyBundle?: boolean;
};

export const normalizeOptions = (
  options?: Partial<PluginAngularLynxOptions>,
): Required<PluginAngularLynxOptions> => {
  const defaultOptions: Required<PluginAngularLynxOptions> = {
    //@ts-expect-error
    customCSSInheritanceList: undefined,
    debugInfoOutside: true,
    enableA11y: true,
    enableAccessibilityElement: false,
    enableCSSInheritance: false,
    enableCSSInvalidation: false,
    enableCSSSelector: true,
    enableICU: false,
    enableNewGesture: false,
    enableParallelElement: true,
    defaultDisplayLinear: true,
    enableRemoveCSSScope: false,
    enableSSR: false,
    //@ts-expect-error
    pages: undefined,
    pipelineSchedulerConfig: 0x00010000,
    targetSdkVersion: '3.2',
    defaultOverflowVisible: true,
    removeDescendantSelectorScope: false,
    experimental_isLazyBundle: false,
  };
  return Object.assign(defaultOptions, options);
};
