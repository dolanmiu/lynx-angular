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
  enableNewGesture?: boolean;
  enableRemoveCSSScope?: boolean;
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
    enableNewGesture: false,
    defaultDisplayLinear: true,
    enableRemoveCSSScope: false,
    targetSdkVersion: '3.2',
    defaultOverflowVisible: true,
    removeDescendantSelectorScope: false,
    experimental_isLazyBundle: false,
  };
  return Object.assign(defaultOptions, options);
};
