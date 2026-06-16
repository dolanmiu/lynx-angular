import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  template: `
    <scroll-view class="page" scroll-orientation="vertical">
      <view class="container">
        <text class="title">Text Element</text>
        <text class="subtitle">
          Rendering text with inline styles and truncation.
        </text>

        <view class="card">
          <text class="section-label">Inline Formatting</text>
          <text class="body">
            Regular text with
            <text class="bold"> bold </text>
            and
            <text class="colored"> colored </text>
            inline content.
          </text>
        </view>

        <view class="card">
          <text class="section-label">Truncation</text>
          <text class="truncated" [text-maxline]="2">
            This is a long paragraph that demonstrates text truncation with
            text-maxline. When the text exceeds two lines, it will be truncated
            with an ellipsis at the end of the second line.
          </text>
        </view>
      </view>
    </scroll-view>
  `,
  styles: `
    .page { height: 100%; background-color: #fafafa; }
    .container { padding: 24px; }
    .title { font-size: 28px; font-weight: bold; color: #18181b; margin-bottom: 4px; }
    .subtitle { font-size: 13px; color: #71717a; margin-bottom: 20px; }
    .card { background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
    .section-label { font-size: 11px; font-weight: 700; color: #a1a1aa; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    .body { font-size: 15px; color: #18181b; line-height: 22px; }
    .bold { font-weight: bold; }
    .colored { color: #ef4444; }
    .truncated { font-size: 14px; color: #71717a; line-height: 20px; }
  `,
  imports: [LYNX_ELEMENTS],
})
export class App {}
