import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { UiText } from '../../components/ui/typography';
import { UiBadge } from '../../components/ui/badge';
import { ScreenHost } from '../screen-host';

/**
 * Visual test matrix for Lynx CSS engine compatibility. Lynx's native style
 * parser doesn't support the full CSS4 spec — for example, the space-separated
 * hsl() syntax (hsl(240 5.9% 10%)) fails silently (A5 is expected to be blank).
 * Run this page on-device whenever changing CSS variable handling in the renderer
 * to verify which formats survive the round-trip through __AddInlineStyle.
 */
@Component({
  selector: 'app-css-var-validation',
  hostDirectives: [ScreenHost],
  standalone: true,
  imports: [LYNX_ELEMENTS, UiText, UiBadge],
  template: `
    <scroll-view class="h-full w-full" scroll-orientation="vertical">
      <view class="flex-col gap-2 p-4 flex">
        <ui-text variant="h3">CSS Variables</ui-text>
        <ui-badge variant="secondary">Validation</ui-badge>
      </view>
      <view class="flex-col p-4 flex">
        <text class="mb-4 text-xs text-gray-400">
          Each swatch should show a dark charcoal color unless the format is
          unsupported
        </text>

        <!-- Section A: Color Formats -->
        <text class="mb-2.5 text-[15px] font-bold text-gray-700">
          A. Color Formats
        </text>

        <text class="mb-1 text-[11px] text-gray-500">A1: hex — #18181b</text>
        <view
          class="mb-4 h-12 w-full items-center rounded-lg justify-center"
          style="background-color: #18181b;"
        >
          <text class="text-[11px] text-white">#18181b</text>
        </view>

        <text class="mb-1 text-[11px] text-gray-500"
          >A2: rgb comma — rgb(24, 24, 27)</text
        >
        <view
          class="mb-4 h-12 w-full items-center rounded-lg justify-center"
          style="background-color: rgb(24, 24, 27);"
        >
          <text class="text-[11px] text-white">rgb(24, 24, 27)</text>
        </view>

        <text class="mb-1 text-[11px] text-gray-500"
          >A3: rgba comma — rgba(24, 24, 27, 0.5)</text
        >
        <view
          class="mb-4 h-12 w-full items-center rounded-lg justify-center"
          style="background-color: rgba(24, 24, 27, 0.5);"
        >
          <text class="text-[11px] text-white">rgba 50%</text>
        </view>

        <text class="mb-1 text-[11px] text-gray-500"
          >A4: hsl comma — hsl(240, 5.9%, 10%)</text
        >
        <view
          class="mb-4 h-12 w-full items-center rounded-lg justify-center"
          style="background-color: hsl(240, 5.9%, 10%);"
        >
          <text class="text-[11px] text-white">hsl(240, 5.9%, 10%)</text>
        </view>

        <text class="mb-1 text-[11px] text-gray-500"
          >A5: hsl space — hsl(240 5.9% 10%) ⚠️ expected to fail</text
        >
        <view
          class="mb-4 h-12 w-full items-center rounded-lg justify-center"
          style="background-color: hsl(240 5.9% 10%);"
        >
          <text class="text-[11px] text-white">hsl(240 5.9% 10%)</text>
        </view>

        <text class="mb-1 text-[11px] text-gray-500"
          >A6: hsla comma — hsla(240, 5.9%, 10%, 0.5)</text
        >
        <view
          class="mb-4 h-12 w-full items-center rounded-lg justify-center"
          style="background-color: hsla(240, 5.9%, 10%, 0.5);"
        >
          <text class="text-[11px] text-white">hsla 50%</text>
        </view>

        <text class="mb-1 text-[11px] text-gray-500"
          >A7: named color — red</text
        >
        <view
          class="mb-4 h-12 w-full items-center rounded-lg justify-center"
          style="background-color: red;"
        >
          <text class="text-[11px] text-white">red</text>
        </view>

        <text class="mb-1 text-[11px] text-gray-500"
          >A8: rgb space — rgb(24 24 27)</text
        >
        <view
          class="mb-6 h-12 w-full items-center rounded-lg justify-center"
          style="background-color: rgb(24 24 27);"
        >
          <text class="text-[11px] text-white">rgb(24 24 27)</text>
        </view>

        <!-- Section B: CSS Variables -->
        <text class="mb-2.5 text-[15px] font-bold text-gray-700">
          B. CSS Variables
        </text>

        <text class="mb-1 text-[11px] text-gray-500"
          >B1: var(--test-hex) → #18181b</text
        >
        <view
          class="mb-4 h-12 w-full items-center rounded-lg justify-center"
          style="background-color: var(--test-hex);"
        >
          <text class="text-[11px] text-white">var(--test-hex)</text>
        </view>

        <text class="mb-1 text-[11px] text-gray-500"
          >B2: var(--primary) — complete rgba() value → should render ✅</text
        >
        <view
          class="mb-4 h-12 w-full items-center rounded-lg justify-center"
          style="background-color: var(--primary);"
        >
          <text class="text-[11px] text-white">var(--primary)</text>
        </view>

        <text class="mb-1 text-[11px] text-gray-500"
          >B3: hsl(var(--primary)) — rgba inside hsl(), invalid → blank</text
        >
        <view
          class="mb-4 h-12 w-full items-center rounded-lg justify-center"
          style="background-color: hsl(var(--primary));"
        >
          <text class="text-[11px] text-white">hsl(var(--primary))</text>
        </view>

        <text class="mb-1 text-[11px] text-gray-500"
          >B4: var(--nonexistent, #18181b) — fallback value</text
        >
        <view
          class="mb-6 h-12 w-full items-center rounded-lg justify-center"
          style="background-color: var(--nonexistent, #18181b);"
        >
          <text class="text-[11px] text-white">var fallback</text>
        </view>

        <!-- Section C: Composition -->
        <text class="mb-2.5 text-[15px] font-bold text-gray-700">
          C. Variable Composition
        </text>

        <text class="mb-1 text-[11px] text-gray-500"
          >C1: rgb(var(--r), var(--g), var(--b)) — channel vars</text
        >
        <view
          class="mb-4 h-12 w-full items-center rounded-lg justify-center"
          style="background-color: rgb(var(--test-rgb-r), var(--test-rgb-g), var(--test-rgb-b));"
        >
          <text class="text-[11px] text-white">rgb(var, var, var)</text>
        </view>

        <text class="mb-1 text-[11px] text-gray-500"
          >C2: Tailwind bg-primary — generates var(--primary) → should render
          ✅</text
        >
        <view
          class="mb-6 h-12 w-full items-center rounded-lg bg-primary justify-center"
        >
          <text class="text-[11px] text-white">bg-primary</text>
        </view>
      </view>
    </scroll-view>
  `,
})
export class CssVarValidation {}
