import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { UiText } from '../../components/ui/typography';
import { UiBadge } from '../../components/ui/badge';
import { ScreenHost } from '../screen-host';

@Component({
  selector: 'app-text-wrapper',
  template: `
    <view class="mb-2 rounded bg-green-100 px-3 py-2">
      <text class="text-sm text-zinc-900"><ng-content /></text>
    </view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class TextWrapper {}

@Component({
  selector: 'app-multi-slot-text',
  template: `
    <text class="mb-2 rounded bg-orange-50 px-3 py-2 text-sm">
      <ng-content select="[prefix]" />
      <ng-content />
    </text>
  `,
  imports: [LYNX_ELEMENTS],
})
export class MultiSlotText {}

@Component({
  selector: 'app-conditional-text',
  template: `
    <view (bindtap)="toggle()">
      <text class="mb-2 rounded bg-pink-50 px-3 py-2 text-sm">
        @if (show()) {
          <ng-content />
        } @else {
          <text class="text-gray-400">[hidden]</text>
        }
      </text>
    </view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class ConditionalText {
  readonly show = signal(true);

  toggle(): void {
    // setTimeout defers the signal update out of the native `bindtap` callback.
    // Updating a signal synchronously inside a Lynx native event handler can
    // cause the renderer to flush while the native event is still on the call
    // stack, which breaks Lynx's frame pipeline on the main thread.
    setTimeout(() => this.show.update((v) => !v), 0);
  }
}

@Component({
  selector: 'app-card-title-mock',
  template: `<text class="text-base font-bold leading-none text-zinc-900"
    ><ng-content
  /></text>`,
  imports: [LYNX_ELEMENTS],
})
export class CardTitleMock {}

@Component({
  selector: 'app-text-projection-validation',
  hostDirectives: [ScreenHost],
  imports: [
    LYNX_ELEMENTS,
    TextWrapper,
    MultiSlotText,
    ConditionalText,
    CardTitleMock,
    UiText,
    UiBadge,
  ],
  template: `
    <scroll-view class="h-full w-full" scroll-orientation="vertical">
      <view class="flex-col gap-2 p-4 flex">
        <ui-text variant="h3">Text Projection</ui-text>
        <ui-badge variant="secondary">Validation</ui-badge>
      </view>
      <view class="flex-col p-4 flex">
        <text class="mb-4 text-xs text-gray-400">
          Tests whether Angular content projection works inside Lynx text
          elements
        </text>

        <!-- Test A: Raw text projected into <text> -->
        <text class="mb-2.5 text-[15px] font-bold text-gray-700">
          A. Raw text projected into text element
        </text>
        <text class="mb-1 text-[11px] text-gray-500">
          Expected: "Hello World" on green background
        </text>
        <app-text-wrapper>Hello World</app-text-wrapper>

        <!-- Test B: <text> projected into <text> (text-in-text) -->
        <text class="mb-2.5 mt-2 text-[15px] font-bold text-gray-700">
          B. text-in-text via projection
        </text>
        <text class="mb-1 text-[11px] text-gray-500">
          Expected: "Bold text" in bold on green background
        </text>
        <app-text-wrapper>
          <text class="font-bold">Bold text</text>
        </app-text-wrapper>

        <!-- Test C: Multiple projected text nodes -->
        <text class="mb-2.5 mt-2 text-[15px] font-bold text-gray-700">
          C. Multiple projected children
        </text>
        <text class="mb-1 text-[11px] text-gray-500">
          Expected: "One" and "Two" both visible on green background
        </text>
        <app-text-wrapper>
          <text>One </text>
          <text class="text-red-700">Two</text>
        </app-text-wrapper>

        <!-- Test D: Named slot projection into <text> -->
        <text class="mb-2.5 mt-2 text-[15px] font-bold text-gray-700">
          D. Named slot in text
        </text>
        <text class="mb-1 text-[11px] text-gray-500">
          Expected: star followed by "Main content" on orange background
        </text>
        <app-multi-slot-text>
          <text prefix class="text-orange-600">* </text>
          <text>Main content</text>
        </app-multi-slot-text>

        <!-- Test E: Conditional projection inside <text> -->
        <text class="mb-2.5 mt-2 text-[15px] font-bold text-gray-700">
          E. Conditional projection in text (tap to toggle)
        </text>
        <text class="mb-1 text-[11px] text-gray-500">
          Expected: "Visible content" on pink background
        </text>
        <app-conditional-text>
          <text>Visible content</text>
        </app-conditional-text>

        <!-- Test F: Real-world pattern (UiCardTitle mock) -->
        <text class="mb-2.5 mt-2 text-[15px] font-bold text-gray-700">
          F. Real-world: UiCardTitle pattern
        </text>
        <text class="mb-1 text-[11px] text-gray-500">
          Expected: "My Card Title" in bold 16px
        </text>
        <app-card-title-mock>My Card Title</app-card-title-mock>

        <!-- Test G: Styled text-in-text -->
        <text class="mb-2.5 mt-2 text-[15px] font-bold text-gray-700">
          G. Inline styled wrapper (no helper component)
        </text>
        <text class="mb-1 text-[11px] text-gray-500">
          Expected: "Blue bold text" in blue on blue background
        </text>
        <app-text-wrapper>
          <text class="font-bold text-blue-800">Blue bold text</text>
        </app-text-wrapper>

        <!-- Summary -->
        <view class="mt-6 rounded-lg bg-gray-100 p-3">
          <text class="mb-1 text-[13px] font-bold text-gray-700">
            Summary
          </text>
          <text class="text-[11px] text-gray-500">
            If ALL tests above render expected text, ng-content works inside
            text elements and the blotch/ui component pattern is valid. If any
            fail, components need input() for labels.
          </text>
        </view>
      </view>
    </scroll-view>
  `,
})
export class TextProjectionValidation {}
