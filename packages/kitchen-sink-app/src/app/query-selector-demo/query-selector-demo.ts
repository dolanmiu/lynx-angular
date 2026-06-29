import type { AfterViewInit } from '@angular/core';
import { Component, ElementRef, ViewChild, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-query-selector-demo',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  template: `
    <view class="flex flex-col p-4 bg-gray-100 min-h-screen">
      <text class="text-[24px] font-bold text-center mb-4"
        >querySelector Demo</text
      >

      <view class="mb-4">
        <text class="text-[13px] text-gray-700 mb-2">
          Lynx runs Angular on a background JS thread with no real DOM. This
          demo verifies that querySelector and querySelectorAll work on the
          background thread's virtual element tree.
        </text>
        <text class="text-[13px] text-gray-700 mb-2">
          The box below is the element tree being queried. Results are evaluated
          in ngAfterViewInit via ElementRef.nativeElement and displayed below.
        </text>
      </view>

      <!-- These are the elements being queried — three .qs-item views, one with
           an extra .qs-active class, one with id="qs-first", plus a text with
           class .qs-label for testing compound tag+class selectors. -->
      <text class="text-xs text-gray-400 mb-1.5 italic"
        >Element tree being queried:</text
      >
      <view #subject class="bg-white rounded-lg p-3 mb-4">
        <view class="qs-item p-2 bg-gray-200 rounded mb-1.5" id="qs-first"
          ><text>Item A</text></view
        >
        <view class="qs-item qs-active p-2 bg-blue-100 rounded mb-1.5"
          ><text>Item B (active)</text></view
        >
        <view class="qs-item p-2 bg-gray-200 rounded mb-1.5"
          ><text>Item C</text></view
        >
        <text class="qs-label italic text-gray-500 mt-1">Label</text>
      </view>

      <view class="bg-white rounded-lg p-3">
        <text class="text-[18px] font-bold mb-3">Results</text>

        <view class="mb-2.5 pb-2.5 border-b border-gray-200">
          <text class="text-xs text-gray-600 mb-1 font-[monospace]"
            >querySelector('.qs-active')</text
          >
          <text [style.color]="resultColor(qsActive())">{{ qsActive() }}</text>
        </view>

        <view class="mb-2.5 pb-2.5 border-b border-gray-200">
          <text class="text-xs text-gray-600 mb-1 font-[monospace]"
            >querySelectorAll('.qs-item').length</text
          >
          <text [style.color]="resultColor(qsAllCount())">{{
            qsAllCount()
          }}</text>
        </view>

        <view class="mb-2.5 pb-2.5 border-b border-gray-200">
          <text class="text-xs text-gray-600 mb-1 font-[monospace]"
            >querySelector('#qs-first')</text
          >
          <text [style.color]="resultColor(qsById())">{{ qsById() }}</text>
        </view>

        <view class="mb-2.5 pb-2.5 border-b border-gray-200">
          <text class="text-xs text-gray-600 mb-1 font-[monospace]"
            >querySelector('text.qs-label')</text
          >
          <text [style.color]="resultColor(qsCompound())">{{
            qsCompound()
          }}</text>
        </view>

        <view class="mb-2.5 pb-2.5 border-b border-gray-200">
          <text class="text-xs text-gray-600 mb-1 font-[monospace]"
            >querySelector('view view') — combinator (unsupported)</text
          >
          <text [style.color]="resultColor(qsCombinator())">{{
            qsCombinator()
          }}</text>
        </view>
      </view>
    </view>
  `,
})
export class QuerySelectorDemo implements AfterViewInit {
  @ViewChild('subject', { read: ElementRef }) subject!: ElementRef;

  qsActive = signal('pending');
  qsAllCount = signal('pending');
  qsById = signal('pending');
  qsCompound = signal('pending');
  // Combinator selectors (space between tokens) are intentionally unsupported
  // on the background thread — the expected result is null.
  qsCombinator = signal('pending');

  ngAfterViewInit(): void {
    const el = this.subject.nativeElement;

    this.qsActive.set(el.querySelector('.qs-active') ? 'found ✓' : 'null ✗');
    this.qsAllCount.set(String(el.querySelectorAll('.qs-item').length));
    this.qsById.set(el.querySelector('#qs-first') ? 'found ✓' : 'null ✗');
    this.qsCompound.set(
      el.querySelector('text.qs-label') ? 'found ✓' : 'null ✗',
    );
    this.qsCombinator.set(
      el.querySelector('view view') ? 'found (unexpected) ✗' : 'null ✓',
    );
  }

  /**
   * Returns green for a passing result, red for a failure, gray while pending.
   */
  resultColor(val: string): string {
    if (val === 'pending') return '#888888';
    if (val.endsWith('✓')) return '#28a745';
    return '#dc3545';
  }
}
