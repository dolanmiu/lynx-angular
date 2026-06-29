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
        <text class="text-xl font-bold text-zinc-900 mb-1">
          CSS Validation
        </text>
        <text class="text-xs text-gray-400 mb-4">
          Each swatch should show a dark charcoal color unless the format is
          unsupported
        </text>

        <!-- Section A: Color Formats -->
        <text class="text-[15px] font-bold text-gray-700 mb-2.5">
          A. Color Formats
        </text>

        <text class="text-[11px] text-gray-500 mb-1">A1: hex — #18181b</text>
        <view
          class="w-full h-12 rounded-lg mb-4 items-center justify-center"
          style="background-color: #18181b;"
        >
          <text class="text-white text-[11px]">#18181b</text>
        </view>

        <text class="text-[11px] text-gray-500 mb-1"
          >A2: rgb comma — rgb(24, 24, 27)</text
        >
        <view
          class="w-full h-12 rounded-lg mb-4 items-center justify-center"
          style="background-color: rgb(24, 24, 27);"
        >
          <text class="text-white text-[11px]">rgb(24, 24, 27)</text>
        </view>

        <text class="text-[11px] text-gray-500 mb-1"
          >A3: rgba comma — rgba(24, 24, 27, 0.5)</text
        >
        <view
          class="w-full h-12 rounded-lg mb-4 items-center justify-center"
          style="background-color: rgba(24, 24, 27, 0.5);"
        >
          <text class="text-white text-[11px]">rgba 50%</text>
        </view>

        <text class="text-[11px] text-gray-500 mb-1"
          >A4: hsl comma — hsl(240, 5.9%, 10%)</text
        >
        <view
          class="w-full h-12 rounded-lg mb-4 items-center justify-center"
          style="background-color: hsl(240, 5.9%, 10%);"
        >
          <text class="text-white text-[11px]">hsl(240, 5.9%, 10%)</text>
        </view>

        <text class="text-[11px] text-gray-500 mb-1"
          >A5: hsl space — hsl(240 5.9% 10%) ⚠️ expected to fail</text
        >
        <view
          class="w-full h-12 rounded-lg mb-4 items-center justify-center"
          style="background-color: hsl(240 5.9% 10%);"
        >
          <text class="text-white text-[11px]">hsl(240 5.9% 10%)</text>
        </view>

        <text class="text-[11px] text-gray-500 mb-1"
          >A6: hsla comma — hsla(240, 5.9%, 10%, 0.5)</text
        >
        <view
          class="w-full h-12 rounded-lg mb-4 items-center justify-center"
          style="background-color: hsla(240, 5.9%, 10%, 0.5);"
        >
          <text class="text-white text-[11px]">hsla 50%</text>
        </view>

        <text class="text-[11px] text-gray-500 mb-1"
          >A7: named color — red</text
        >
        <view
          class="w-full h-12 rounded-lg mb-4 items-center justify-center"
          style="background-color: red;"
        >
          <text class="text-white text-[11px]">red</text>
        </view>

        <text class="text-[11px] text-gray-500 mb-1"
          >A8: rgb space — rgb(24 24 27)</text
        >
        <view
          class="w-full h-12 rounded-lg mb-6 items-center justify-center"
          style="background-color: rgb(24 24 27);"
        >
          <text class="text-white text-[11px]">rgb(24 24 27)</text>
        </view>

        <!-- Section B: CSS Variables -->
        <text class="text-[15px] font-bold text-gray-700 mb-2.5">
          B. CSS Variables
        </text>

        <text class="text-[11px] text-gray-500 mb-1"
          >B1: var(--test-hex) → #18181b</text
        >
        <view
          class="w-full h-12 rounded-lg mb-4 items-center justify-center"
          style="background-color: var(--test-hex);"
        >
          <text class="text-white text-[11px]">var(--test-hex)</text>
        </view>

        <text class="text-[11px] text-gray-500 mb-1"
          >B2: var(--primary) — raw HSL string without hsl() wrapper</text
        >
        <view
          class="w-full h-12 rounded-lg mb-4 items-center justify-center"
          style="background-color: var(--primary);"
        >
          <text class="text-white text-[11px]">var(--primary)</text>
        </view>

        <text class="text-[11px] text-gray-500 mb-1"
          >B3: hsl(var(--primary)) — shadcn composition pattern</text
        >
        <view
          class="w-full h-12 rounded-lg mb-4 items-center justify-center"
          style="background-color: hsl(var(--primary));"
        >
          <text class="text-white text-[11px]">hsl(var(--primary))</text>
        </view>

        <text class="text-[11px] text-gray-500 mb-1"
          >B4: var(--nonexistent, #18181b) — fallback value</text
        >
        <view
          class="w-full h-12 rounded-lg mb-6 items-center justify-center"
          style="background-color: var(--nonexistent, #18181b);"
        >
          <text class="text-white text-[11px]">var fallback</text>
        </view>

        <!-- Section C: Composition -->
        <text class="text-[15px] font-bold text-gray-700 mb-2.5">
          C. Variable Composition
        </text>

        <text class="text-[11px] text-gray-500 mb-1"
          >C1: rgb(var(--r), var(--g), var(--b)) — channel vars</text
        >
        <view
          class="w-full h-12 rounded-lg mb-4 items-center justify-center"
          style="background-color: rgb(var(--test-rgb-r), var(--test-rgb-g), var(--test-rgb-b));"
        >
          <text class="text-white text-[11px]">rgb(var, var, var)</text>
        </view>

        <text class="text-[11px] text-gray-500 mb-1"
          >C2: Tailwind bg-primary — generates hsl(var(--primary) / 1)</text
        >
        <view
          class="w-full h-12 rounded-lg mb-6 items-center justify-center bg-primary"
        >
          <text class="text-white text-[11px]">bg-primary</text>
        </view>
      </view>
    </scroll-view>
  `,
})
export class CssVarValidation {}
