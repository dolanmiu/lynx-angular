import {
  type AfterViewInit,
  type ElementRef,
  Component,
  signal,
  viewChild,
} from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { DemoScreen } from '../demo-screen/demo-screen';
import { ScreenHost } from '../screen-host';

@Component({
  selector: 'app-query-selector-demo',
  hostDirectives: [ScreenHost],
  standalone: true,
  imports: [LYNX_ELEMENTS, DemoScreen],
  template: `
    <app-demo-screen
      heading="querySelector"
      category="Platform"
      description="querySelector on the background thread."
    >
      <view class="mb-4">
        <text class="mb-2 text-[13px] text-gray-700">
          Lynx runs Angular on a background JS thread with no real DOM. This
          demo verifies that querySelector and querySelectorAll work on the
          background thread's virtual element tree.
        </text>
        <text class="mb-2 text-[13px] text-gray-700">
          The box below is the element tree being queried. Results are evaluated
          in ngAfterViewInit via ElementRef.nativeElement and displayed below.
        </text>
      </view>

      <!-- These are the elements being queried — three .qs-item views, one with
           an extra .qs-active class, one with id="qs-first", plus a text with
           class .qs-label for testing compound tag+class selectors. -->
      <text class="mb-1.5 text-xs italic text-gray-400"
        >Element tree being queried:</text
      >
      <view #subject class="mb-4 rounded-lg bg-white p-3">
        <view class="qs-item mb-1.5 rounded bg-gray-200 p-2" id="qs-first"
          ><text>Item A</text></view
        >
        <view class="qs-item qs-active mb-1.5 rounded bg-blue-100 p-2"
          ><text>Item B (active)</text></view
        >
        <view class="qs-item mb-1.5 rounded bg-gray-200 p-2"
          ><text>Item C</text></view
        >
        <text class="qs-label mt-1 italic text-gray-500">Label</text>
      </view>

      <view class="rounded-lg bg-white p-3">
        <text class="mb-3 text-[18px] font-bold">Results</text>

        <view class="mb-2.5 border-b border-gray-200 pb-2.5">
          <text class="mb-1 font-[monospace] text-xs text-gray-600"
            >querySelector('.qs-active')</text
          >
          <text [style.color]="resultColor(qsActive())">{{ qsActive() }}</text>
        </view>

        <view class="mb-2.5 border-b border-gray-200 pb-2.5">
          <text class="mb-1 font-[monospace] text-xs text-gray-600"
            >querySelectorAll('.qs-item').length</text
          >
          <text [style.color]="resultColor(qsAllCount())">{{
            qsAllCount()
          }}</text>
        </view>

        <view class="mb-2.5 border-b border-gray-200 pb-2.5">
          <text class="mb-1 font-[monospace] text-xs text-gray-600"
            >querySelector('#qs-first')</text
          >
          <text [style.color]="resultColor(qsById())">{{ qsById() }}</text>
        </view>

        <view class="mb-2.5 border-b border-gray-200 pb-2.5">
          <text class="mb-1 font-[monospace] text-xs text-gray-600"
            >querySelector('text.qs-label')</text
          >
          <text [style.color]="resultColor(qsCompound())">{{
            qsCompound()
          }}</text>
        </view>

        <view class="mb-2.5 border-b border-gray-200 pb-2.5">
          <text class="mb-1 font-[monospace] text-xs text-gray-600"
            >querySelector('view view') — combinator (unsupported)</text
          >
          <text [style.color]="resultColor(qsCombinator())">{{
            qsCombinator()
          }}</text>
        </view>
      </view>
    </app-demo-screen>
  `,
})
export class QuerySelectorDemo implements AfterViewInit {
  readonly subject = viewChild.required<ElementRef>('subject');

  qsActive = signal('pending');
  qsAllCount = signal('pending');
  qsById = signal('pending');
  qsCompound = signal('pending');
  // Combinator selectors (space between tokens) are intentionally unsupported
  // on the background thread — the expected result is null.
  qsCombinator = signal('pending');

  ngAfterViewInit(): void {
    const el = this.subject().nativeElement;

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
