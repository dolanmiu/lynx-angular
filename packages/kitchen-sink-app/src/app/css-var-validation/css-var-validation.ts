import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

/**
 * Visual test matrix for Lynx CSS engine compatibility. Lynx's native style
 * parser doesn't support the full CSS4 spec — for example, the space-separated
 * hsl() syntax (hsl(240 5.9% 10%)) fails silently (A5 is expected to be blank).
 * Run this page on-device whenever changing CSS variable handling in the renderer
 * to verify which formats survive the round-trip through __AddInlineStyle.
 */
@Component({
  selector: 'app-css-var-validation',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  template: `
    <scroll-view class="w-full" scroll-orientation="vertical">
      <view class="p-4 flex flex-col">
        <text
          style="font-size: 20px; font-weight: bold; color: #1a1a1a; margin-bottom: 4px;"
        >
          CSS Validation
        </text>
        <text style="font-size: 12px; color: #888; margin-bottom: 16px;">
          Each swatch should show a dark charcoal color unless the format is
          unsupported
        </text>

        <!-- Section A: Color Formats -->
        <text
          style="font-size: 15px; font-weight: bold; color: #333; margin-bottom: 10px;"
        >
          A. Color Formats
        </text>

        <text style="font-size: 11px; color: #666; margin-bottom: 4px;"
          >A1: hex — #18181b</text
        >
        <view
          class="w-full h-12 rounded-lg mb-4 items-center justify-center"
          style="background-color: #18181b;"
        >
          <text style="color: white; font-size: 11px;">#18181b</text>
        </view>

        <text style="font-size: 11px; color: #666; margin-bottom: 4px;"
          >A2: rgb comma — rgb(24, 24, 27)</text
        >
        <view
          class="w-full h-12 rounded-lg mb-4 items-center justify-center"
          style="background-color: rgb(24, 24, 27);"
        >
          <text style="color: white; font-size: 11px;">rgb(24, 24, 27)</text>
        </view>

        <text style="font-size: 11px; color: #666; margin-bottom: 4px;"
          >A3: rgba comma — rgba(24, 24, 27, 0.5)</text
        >
        <view
          class="w-full h-12 rounded-lg mb-4 items-center justify-center"
          style="background-color: rgba(24, 24, 27, 0.5);"
        >
          <text style="color: white; font-size: 11px;">rgba 50%</text>
        </view>

        <text style="font-size: 11px; color: #666; margin-bottom: 4px;"
          >A4: hsl comma — hsl(240, 5.9%, 10%)</text
        >
        <view
          class="w-full h-12 rounded-lg mb-4 items-center justify-center"
          style="background-color: hsl(240, 5.9%, 10%);"
        >
          <text style="color: white; font-size: 11px;"
            >hsl(240, 5.9%, 10%)</text
          >
        </view>

        <text style="font-size: 11px; color: #666; margin-bottom: 4px;"
          >A5: hsl space — hsl(240 5.9% 10%) ⚠️ expected to fail</text
        >
        <view
          class="w-full h-12 rounded-lg mb-4 items-center justify-center"
          style="background-color: hsl(240 5.9% 10%);"
        >
          <text style="color: white; font-size: 11px;">hsl(240 5.9% 10%)</text>
        </view>

        <text style="font-size: 11px; color: #666; margin-bottom: 4px;"
          >A6: hsla comma — hsla(240, 5.9%, 10%, 0.5)</text
        >
        <view
          class="w-full h-12 rounded-lg mb-4 items-center justify-center"
          style="background-color: hsla(240, 5.9%, 10%, 0.5);"
        >
          <text style="color: white; font-size: 11px;">hsla 50%</text>
        </view>

        <text style="font-size: 11px; color: #666; margin-bottom: 4px;"
          >A7: named color — red</text
        >
        <view
          class="w-full h-12 rounded-lg mb-4 items-center justify-center"
          style="background-color: red;"
        >
          <text style="color: white; font-size: 11px;">red</text>
        </view>

        <text style="font-size: 11px; color: #666; margin-bottom: 4px;"
          >A8: rgb space — rgb(24 24 27)</text
        >
        <view
          class="w-full h-12 rounded-lg mb-6 items-center justify-center"
          style="background-color: rgb(24 24 27);"
        >
          <text style="color: white; font-size: 11px;">rgb(24 24 27)</text>
        </view>

        <!-- Section B: CSS Variables -->
        <text
          style="font-size: 15px; font-weight: bold; color: #333; margin-bottom: 10px;"
        >
          B. CSS Variables
        </text>

        <text style="font-size: 11px; color: #666; margin-bottom: 4px;"
          >B1: var(--test-hex) → #18181b</text
        >
        <view
          class="w-full h-12 rounded-lg mb-4 items-center justify-center"
          style="background-color: var(--test-hex);"
        >
          <text style="color: white; font-size: 11px;">var(--test-hex)</text>
        </view>

        <text style="font-size: 11px; color: #666; margin-bottom: 4px;"
          >B2: var(--primary) — raw HSL string without hsl() wrapper</text
        >
        <view
          class="w-full h-12 rounded-lg mb-4 items-center justify-center"
          style="background-color: var(--primary);"
        >
          <text style="color: white; font-size: 11px;">var(--primary)</text>
        </view>

        <text style="font-size: 11px; color: #666; margin-bottom: 4px;"
          >B3: hsl(var(--primary)) — shadcn composition pattern</text
        >
        <view
          class="w-full h-12 rounded-lg mb-4 items-center justify-center"
          style="background-color: hsl(var(--primary));"
        >
          <text style="color: white; font-size: 11px;"
            >hsl(var(--primary))</text
          >
        </view>

        <text style="font-size: 11px; color: #666; margin-bottom: 4px;"
          >B4: var(--nonexistent, #18181b) — fallback value</text
        >
        <view
          class="w-full h-12 rounded-lg mb-6 items-center justify-center"
          style="background-color: var(--nonexistent, #18181b);"
        >
          <text style="color: white; font-size: 11px;">var fallback</text>
        </view>

        <!-- Section C: Composition -->
        <text
          style="font-size: 15px; font-weight: bold; color: #333; margin-bottom: 10px;"
        >
          C. Variable Composition
        </text>

        <text style="font-size: 11px; color: #666; margin-bottom: 4px;"
          >C1: rgb(var(--r), var(--g), var(--b)) — channel vars</text
        >
        <view
          class="w-full h-12 rounded-lg mb-4 items-center justify-center"
          style="background-color: rgb(var(--test-rgb-r), var(--test-rgb-g), var(--test-rgb-b));"
        >
          <text style="color: white; font-size: 11px;">rgb(var, var, var)</text>
        </view>

        <text style="font-size: 11px; color: #666; margin-bottom: 4px;"
          >C2: Tailwind bg-primary — generates hsl(var(--primary) / 1)</text
        >
        <view
          class="w-full h-12 rounded-lg mb-6 items-center justify-center bg-primary"
        >
          <text style="color: white; font-size: 11px;">bg-primary</text>
        </view>
      </view>
    </scroll-view>
  `,
})
export class CssVarValidation {}
