import { Directive } from '@angular/core';
import { LynxElementBase } from './base';

/** Single-line text input field. */
@Directive({
  selector: 'input',
  standalone: true,
  inputs: [
    'type',
    'placeholder',
    'value',
    'maxlength',
    'readonly',
    'disabled',
    'confirm-type',
    'input-filter',
    'show-soft-input-on-focus',
    'ios-auto-correct',
    'ios-spell-check',
    'android-fullscreen-mode',
  ],
})
export class LynxInput extends LynxElementBase {
  /** Keyboard type shown when this input gains focus. */
  type?: 'text' | 'number' | 'digit' | 'password' | 'tel' | 'email';
  /** Greyed-out hint text shown when the field is empty. */
  placeholder?: string;
  /** Current value of the field. */
  value?: string;
  /** Maximum character count (-1 = unlimited). */
  maxlength?: number;
  /** Whether the field is read-only. */
  readonly?: boolean;
  /** Whether the field and keyboard are disabled. */
  disabled?: boolean;
  /** Label for the soft-keyboard confirm button. @default 'done' */
  'confirm-type'?: 'search' | 'send' | 'go' | 'done' | 'next';
  /** Input character whitelist — a regular expression pattern string. */
  'input-filter'?: string;
  /** Whether tapping the field shows the soft keyboard. @default true */
  'show-soft-input-on-focus'?: boolean;
  /** Enable auto-correction on iOS. */
  'ios-auto-correct'?: boolean;
  /** Enable spell-checking on iOS. */
  'ios-spell-check'?: boolean;
  /** Enter full-screen editing mode on Android. */
  'android-fullscreen-mode'?: boolean;
}

/** Multi-line text input field. */
@Directive({
  selector: 'textarea',
  standalone: true,
  inputs: [
    'type',
    'placeholder',
    'value',
    'maxlength',
    'maxlines',
    'line-spacing',
    'readonly',
    'disabled',
    'confirm-type',
    'input-filter',
    'show-soft-input-on-focus',
    'bounces',
    'enable-scroll-bar',
    'ios-auto-correct',
    'ios-spell-check',
    'android-fullscreen-mode',
  ],
})
export class LynxTextarea extends LynxElementBase {
  type?: 'text' | 'number' | 'digit' | 'tel' | 'email';
  placeholder?: string;
  value?: string;
  maxlength?: number;
  /** Maximum number of visible lines. */
  maxlines?: number;
  /** Extra spacing between lines in px. */
  'line-spacing'?: number;
  readonly?: boolean;
  disabled?: boolean;
  'confirm-type'?: 'search' | 'send' | 'go' | 'done' | 'next';
  'input-filter'?: string;
  'show-soft-input-on-focus'?: boolean;
  bounces?: boolean;
  'enable-scroll-bar'?: boolean;
  'ios-auto-correct'?: boolean;
  'ios-spell-check'?: boolean;
  'android-fullscreen-mode'?: boolean;
}
