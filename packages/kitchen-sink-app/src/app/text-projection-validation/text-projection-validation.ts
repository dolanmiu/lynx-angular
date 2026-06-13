import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-text-wrapper',
  template: `
    <view style="background-color: #c8e6c9; padding: 8px 12px; border-radius: 4px; margin-bottom: 8px;">
      <text style="font-size: 14px; color: #1a1a1a;"><ng-content /></text>
    </view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class TextWrapper {}

@Component({
  selector: 'app-multi-slot-text',
  template: `
    <text style="font-size: 14px; padding: 8px 12px; background-color: #fff3e0; border-radius: 4px; margin-bottom: 8px;">
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
      <text style="font-size: 14px; padding: 8px 12px; background-color: #fce4ec; border-radius: 4px; margin-bottom: 8px;">
        @if (show()) {
          <ng-content />
        } @else {
          <text style="color: #999;">[hidden]</text>
        }
      </text>
    </view>
  `,
  imports: [LYNX_ELEMENTS],
})
export class ConditionalText {
  readonly show = signal(true);

  toggle(): void {
    setTimeout(() => this.show.update((v) => !v), 0);
  }
}

@Component({
  selector: 'app-card-title-mock',
  template: `<text style="font-size: 16px; font-weight: bold; color: #1a1a1a; line-height: 1;"><ng-content /></text>`,
  imports: [LYNX_ELEMENTS],
})
export class CardTitleMock {}

@Component({
  selector: 'app-text-projection-validation',
  imports: [LYNX_ELEMENTS, TextWrapper, MultiSlotText, ConditionalText, CardTitleMock],
  template: `
    <scroll-view class="w-full" scroll-orientation="vertical">
      <view class="p-4 flex flex-col">
        <text style="font-size: 20px; font-weight: bold; color: #1a1a1a; margin-bottom: 4px;">
          ng-content in text Validation
        </text>
        <text style="font-size: 12px; color: #888; margin-bottom: 16px;">
          Tests whether Angular content projection works inside Lynx text elements
        </text>

        <!-- Test A: Raw text projected into <text> -->
        <text style="font-size: 15px; font-weight: bold; color: #333; margin-bottom: 10px;">
          A. Raw text projected into text element
        </text>
        <text style="font-size: 11px; color: #666; margin-bottom: 4px;">
          Expected: "Hello World" on green background
        </text>
        <app-text-wrapper>Hello World</app-text-wrapper>

        <!-- Test B: <text> projected into <text> (text-in-text) -->
        <text style="font-size: 15px; font-weight: bold; color: #333; margin-top: 8px; margin-bottom: 10px;">
          B. text-in-text via projection
        </text>
        <text style="font-size: 11px; color: #666; margin-bottom: 4px;">
          Expected: "Bold text" in bold on green background
        </text>
        <app-text-wrapper>
          <text style="font-weight: bold;">Bold text</text>
        </app-text-wrapper>

        <!-- Test C: Multiple projected text nodes -->
        <text style="font-size: 15px; font-weight: bold; color: #333; margin-top: 8px; margin-bottom: 10px;">
          C. Multiple projected children
        </text>
        <text style="font-size: 11px; color: #666; margin-bottom: 4px;">
          Expected: "One" and "Two" both visible on green background
        </text>
        <app-text-wrapper>
          <text>One </text>
          <text style="color: #d32f2f;">Two</text>
        </app-text-wrapper>

        <!-- Test D: Named slot projection into <text> -->
        <text style="font-size: 15px; font-weight: bold; color: #333; margin-top: 8px; margin-bottom: 10px;">
          D. Named slot in text
        </text>
        <text style="font-size: 11px; color: #666; margin-bottom: 4px;">
          Expected: star followed by "Main content" on orange background
        </text>
        <app-multi-slot-text>
          <text prefix style="color: #ff6f00;">* </text>
          <text>Main content</text>
        </app-multi-slot-text>

        <!-- Test E: Conditional projection inside <text> -->
        <text style="font-size: 15px; font-weight: bold; color: #333; margin-top: 8px; margin-bottom: 10px;">
          E. Conditional projection in text (tap to toggle)
        </text>
        <text style="font-size: 11px; color: #666; margin-bottom: 4px;">
          Expected: "Visible content" on pink background
        </text>
        <app-conditional-text>
          <text>Visible content</text>
        </app-conditional-text>

        <!-- Test F: Real-world pattern (UiCardTitle mock) -->
        <text style="font-size: 15px; font-weight: bold; color: #333; margin-top: 8px; margin-bottom: 10px;">
          F. Real-world: UiCardTitle pattern
        </text>
        <text style="font-size: 11px; color: #666; margin-bottom: 4px;">
          Expected: "My Card Title" in bold 16px
        </text>
        <app-card-title-mock>My Card Title</app-card-title-mock>

        <!-- Test G: Styled text-in-text -->
        <text style="font-size: 15px; font-weight: bold; color: #333; margin-top: 8px; margin-bottom: 10px;">
          G. Inline styled wrapper (no helper component)
        </text>
        <text style="font-size: 11px; color: #666; margin-bottom: 4px;">
          Expected: "Blue bold text" in blue on blue background
        </text>
        <app-text-wrapper>
          <text style="color: #1565c0; font-weight: bold;">Blue bold text</text>
        </app-text-wrapper>

        <!-- Summary -->
        <view style="margin-top: 24px; padding: 12px; background-color: #f5f5f5; border-radius: 8px;">
          <text style="font-size: 13px; font-weight: bold; color: #333; margin-bottom: 4px;">
            Summary
          </text>
          <text style="font-size: 11px; color: #666;">
            If ALL tests above render expected text, ng-content works inside text elements
            and the blotch/ui component pattern is valid. If any fail, components need input() for labels.
          </text>
        </view>
      </view>
    </scroll-view>
  `,
})
export class TextProjectionValidation {}
