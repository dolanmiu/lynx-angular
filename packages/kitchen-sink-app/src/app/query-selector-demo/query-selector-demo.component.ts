import type { AfterViewInit } from '@angular/core';
import { Component, ElementRef, ViewChild, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-query-selector-demo',
  standalone: true,
  imports: [LYNX_ELEMENTS],
  template: `
    <view class="container">
      <text class="title">querySelector Demo</text>

      <view class="explainer">
        <text class="explainer-text">
          Lynx runs Angular on a background JS thread with no real DOM. This
          demo verifies that querySelector and querySelectorAll work on the
          background thread's virtual element tree.
        </text>
        <text class="explainer-text">
          The box below is the element tree being queried. Results are evaluated
          in ngAfterViewInit via ElementRef.nativeElement and displayed below.
        </text>
      </view>

      <!-- These are the elements being queried — three .qs-item views, one with
           an extra .qs-active class, one with id="qs-first", plus a text with
           class .qs-label for testing compound tag+class selectors. -->
      <text class="subject-label">Element tree being queried:</text>
      <view #subject class="subject">
        <view class="qs-item" id="qs-first"><text>Item A</text></view>
        <view class="qs-item qs-active"><text>Item B (active)</text></view>
        <view class="qs-item"><text>Item C</text></view>
        <text class="qs-label">Label</text>
      </view>

      <view class="section">
        <text class="section-title">Results</text>

        <view class="result-row">
          <text class="result-label">querySelector('.qs-active')</text>
          <text [style.color]="resultColor(qsActive())">{{ qsActive() }}</text>
        </view>

        <view class="result-row">
          <text class="result-label">querySelectorAll('.qs-item').length</text>
          <text [style.color]="resultColor(qsAllCount())">{{
            qsAllCount()
          }}</text>
        </view>

        <view class="result-row">
          <text class="result-label">querySelector('#qs-first')</text>
          <text [style.color]="resultColor(qsById())">{{ qsById() }}</text>
        </view>

        <view class="result-row">
          <text class="result-label">querySelector('text.qs-label')</text>
          <text [style.color]="resultColor(qsCompound())">{{
            qsCompound()
          }}</text>
        </view>

        <view class="result-row">
          <text class="result-label"
            >querySelector('view view') — combinator (unsupported)</text
          >
          <text [style.color]="resultColor(qsCombinator())">{{
            qsCombinator()
          }}</text>
        </view>
      </view>
    </view>
  `,
  styles: [
    `
      .container {
        display: flex;
        flex-direction: column;
        padding: 16px;
        background-color: #f5f5f5;
        min-height: 100vh;
      }

      .title {
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        margin-bottom: 16px;
      }

      .explainer {
        margin-bottom: 16px;
      }

      .explainer-text {
        font-size: 13px;
        color: #444;
        margin-bottom: 8px;
        line-height: 1.4;
      }

      .subject-label {
        font-size: 12px;
        color: #888;
        margin-bottom: 6px;
        font-style: italic;
      }

      .subject {
        background-color: white;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 16px;
      }

      .qs-item {
        padding: 8px;
        background-color: #e9ecef;
        border-radius: 4px;
        margin-bottom: 6px;
      }

      .qs-active {
        background-color: #cce5ff;
      }

      .qs-label {
        font-style: italic;
        color: #666;
        margin-top: 4px;
      }

      .section {
        background-color: white;
        border-radius: 8px;
        padding: 12px;
      }

      .section-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 12px;
      }

      .result-row {
        margin-bottom: 10px;
        padding-bottom: 10px;
        border-bottom-width: 1px;
        border-bottom-color: #eee;
        border-bottom-style: solid;
      }

      .result-label {
        font-size: 12px;
        color: #555;
        margin-bottom: 4px;
        font-family: monospace;
      }
    `,
  ],
})
export class QuerySelectorDemoComponent implements AfterViewInit {
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

  // Returns green for a passing result, red for a failure, gray while pending.
  resultColor(val: string): string {
    if (val === 'pending') return '#888888';
    if (val.endsWith('✓')) return '#28a745';
    return '#dc3545';
  }
}
