/**
 * Angular directive stubs for every Lynx native element.
 *
 * Import LYNX_ELEMENTS into any component that uses Lynx elements in its template
 * for IDE autocomplete and zero red squiggles:
 *
 *   @Component({
 *     imports: [LYNX_ELEMENTS],
 *     template: `<view><text>Hello</text></view>`,
 *   })
 *   export class MyComponent {}
 *
 * The rsbuild plugin automatically injects CUSTOM_ELEMENTS_SCHEMA at build time
 * so the build always succeeds even without importing LYNX_ELEMENTS. These stubs
 * are purely for IDE ergonomics.
 *
 * Implementation notes:
 * - These are @Directive, NOT @Component. Using @Component causes Angular to treat
 *   the element's children as projected content. Any directive inside projected
 *   content that injects ViewContainerRef (e.g. RouterOutlet) crashes at runtime
 *   because insertAnchorNode calls renderer.insertBefore(null, anchor) — the parent
 *   is not yet resolved while Angular is collecting projected nodes. @Directive has
 *   no template, so children are direct element children as expected — identical
 *   rendering behavior to not importing LYNX_ELEMENTS at all.
 * - Properties use their Lynx attribute name (kebab-case) so IDE hover shows the
 *   exact attribute to use in templates (e.g. 'scroll-orientation').
 * - Properties are NOT decorated with @Input(). @Input() causes Angular to intercept
 *   attribute bindings and route them to the directive property setter instead of
 *   calling renderer.setProperty() / renderer.setAttribute(). That bypasses
 *   __SetAttribute and the native Lynx element never receives the value — the same
 *   reason events are not declared as @Output() (see below).
 *   Without @Input(), bindings fall through to the renderer → __SetAttribute(). ✓
 * - Events (bindtap, catchtap, bindinput, bindscroll, …) are not declared as
 *   @Output() because Angular would intercept them and skip the renderer's
 *   listen() call, breaking native Lynx event delivery. They continue to work
 *   via renderer.listen() which handles all unrecognised event names.
 */
export { LynxElementBase } from './base';
export { LynxFrame } from './frame';
export { LynxImage } from './image';
export { LynxInput, LynxTextarea } from './input';
export { LynxList, LynxListItem } from './list';
export { LynxBlock, LynxFor, LynxIf } from './misc';
export { LynxOverlay } from './overlay';
export { LynxScrollView } from './scroll-view';
export { LynxSvg } from './svg';
export { LynxText } from './text';
export { LynxView } from './view';

import { LynxFrame } from './frame';
import { LynxImage } from './image';
import { LynxInput, LynxTextarea } from './input';
import { LynxList, LynxListItem } from './list';
import { LynxBlock, LynxFor, LynxIf } from './misc';
import { LynxOverlay } from './overlay';
import { LynxScrollView } from './scroll-view';
import { LynxSvg } from './svg';
import { LynxText } from './text';
import { LynxView } from './view';

/**
 * All Lynx native element directives as a single importable array.
 * Add to the `imports` of any component whose template uses Lynx elements.
 */
export const LYNX_ELEMENTS = [
  LynxView,
  LynxText,
  LynxImage,
  LynxScrollView,
  LynxList,
  LynxListItem,
  LynxBlock,
  LynxIf,
  LynxFor,
  LynxFrame,
  LynxInput,
  LynxTextarea,
  LynxOverlay,
  LynxSvg,
] as const;
