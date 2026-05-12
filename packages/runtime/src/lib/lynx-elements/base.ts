import { Directive } from '@angular/core';

// @Directive() is required so that ng-packagr's Angular partial compiler
// recognises this base class as an Angular artifact. The selector is left
// empty — the class is never used directly as a directive.
//
// DESIGN NOTES — why these are directives, not components:
//
// 1. No @Component: Components have their own template (<ng-content/>). When a
//    component wraps content, Angular treats that content as "projected" — the
//    native parent is not yet established while Angular initialises projected
//    nodes. Any directive inside the projected content that injects
//    ViewContainerRef (e.g. RouterOutlet) will crash because insertAnchorNode
//    calls renderer.insertBefore(null, anchor) — null being the not-yet-resolved
//    native parent. Using @Directive avoids projection entirely; children are
//    rendered as direct element children just like without LYNX_ELEMENTS.
//
// 2. No @Input(): @Input() causes Angular to intercept attribute bindings and
//    route them to the component/directive property setter, bypassing
//    renderer.setAttribute(). __SetAttribute is never called on the native Lynx
//    element. This is the same reason events are not declared as @Output() (see
//    index.ts). Without @Input(), bindings fall through to renderer.setProperty()
//    → LynxElement.setAttribute() → __SetAttribute() as expected.
@Directive()
export class LynxElementBase {
  // ---- Identity ----------------------------------------------------------
  id?: string;
  /** Named reference accessible via lynx.getElementById / findViewByName. */
  name?: string;

  // ---- Accessibility -----------------------------------------------------
  /** Whether this element is an accessibility node. */
  'accessibility-element'?: boolean;
  /** Text read aloud by screen readers. */
  'accessibility-label'?: string;
  'accessibility-trait'?: 'none' | 'button' | 'image' | 'text';
  /** Comma-separated list of child element names that are accessibility nodes. */
  'accessibility-elements'?: string;
  'accessibility-elements-hidden'?: boolean;
  /** Whether this element exclusively captures accessibility focus. */
  'accessibility-exclusive-focus'?: boolean;
  /** Accessibility identifier (separate from name). */
  'a11y-id'?: string;

  // ---- Interaction -------------------------------------------------------
  /** Whether the element receives touch events (default: true). */
  'user-interaction-enabled'?: boolean;
  /** Whether the element receives platform-native gestures. */
  'native-interaction-enabled'?: boolean;
  /** Whether touch events pass through to elements below. */
  'event-through'?: boolean;
  /** Extends the touch target area. Object or CSS-shorthand string. */
  'hit-slop'?: string | object;
  /** Whether the element consumes native iOS/Android gestures. */
  'block-native-event'?: boolean;
  /** Whether focus events are suppressed. */
  'ignore-focus'?: boolean;
  /** Allow simultaneous touch recognition (iOS). */
  'ios-enable-simultaneous-touch'?: boolean;

  // ---- Exposure tracking -------------------------------------------------
  /** Unique ID used for impression/exposure analytics. */
  'exposure-id'?: string;
  /** Scene identifier grouping exposure events. */
  'exposure-scene'?: string;
}
