import {
  Component,
  computed,
  contentChild,
  contentChildren,
  ElementRef,
  signal,
} from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

// --- Reusable wrapper components demonstrating content projection ---

@Component({
  selector: 'app-card',
  template: `
    <view class="card">
      <ng-content />
    </view>
  `,
  imports: [LYNX_ELEMENTS],
  styles: `
    .card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      background-color: #fafafa;
    }
  `,
})
export class CardComponent {}

@Component({
  selector: 'app-panel',
  template: `
    <view class="panel">
      <view class="panel-header">
        <ng-content select="[slot=header]" />
      </view>
      <view class="panel-body">
        <ng-content />
      </view>
    </view>
  `,
  imports: [LYNX_ELEMENTS],
  styles: `
    .panel {
      border: 1px solid #1976d2;
      border-radius: 8px;
      margin-bottom: 12px;
      overflow: hidden;
    }
    .panel-header {
      background-color: #1976d2;
      padding: 10px 16px;
    }
    .panel-body {
      padding: 16px;
    }
  `,
})
export class PanelComponent {}

@Component({
  selector: 'app-collapsible',
  template: `
    <view class="collapsible">
      <view class="collapsible-header" (bindtap)="toggle()">
        <text class="collapsible-title">{{ title() }}</text>
        <text class="collapsible-icon">{{ expanded() ? '▼' : '▶' }}</text>
      </view>
      @if (expanded()) {
        <view class="collapsible-body">
          <ng-content />
        </view>
      }
    </view>
  `,
  imports: [LYNX_ELEMENTS],
  styles: `
    .collapsible {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      margin-bottom: 12px;
      overflow: hidden;
    }
    .collapsible-header {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background-color: #f5f5f5;
    }
    .collapsible-title {
      font-size: 14px;
      font-weight: bold;
    }
    .collapsible-icon {
      font-size: 12px;
      color: #666;
    }
    .collapsible-body {
      padding: 16px;
    }
  `,
})
export class CollapsibleComponent {
  readonly title = signal('Section');
  readonly expanded = signal(true);

  toggle(): void {
    setTimeout(() => this.expanded.update((v) => !v), 0);
  }
}

// Wrapper that uses contentChild() to detect projected content
@Component({
  selector: 'app-query-demo',
  template: `
    <view class="query-demo">
      <text class="query-status">
        Content detected: {{ hasContent() ? 'Yes' : 'No' }}, Items:
        {{ itemCount() }}
      </text>
      <view class="query-body">
        <ng-content />
      </view>
    </view>
  `,
  imports: [LYNX_ELEMENTS],
  styles: `
    .query-demo {
      border: 1px solid #4caf50;
      border-radius: 8px;
      margin-bottom: 12px;
      overflow: hidden;
    }
    .query-status {
      font-size: 12px;
      color: white;
      background-color: #4caf50;
      padding: 8px 16px;
    }
    .query-body {
      padding: 16px;
    }
  `,
})
export class QueryDemoComponent {
  readonly mainContent = contentChild('main', { read: ElementRef });
  readonly items = contentChildren('item', { read: ElementRef });
  readonly hasContent = computed(() => this.mainContent() != null);
  readonly itemCount = computed(() => this.items().length);
}

// --- Main demo component ---

@Component({
  selector: 'app-content-projection-demo',
  imports: [
    LYNX_ELEMENTS,
    CardComponent,
    PanelComponent,
    CollapsibleComponent,
    QueryDemoComponent,
  ],
  templateUrl: './content-projection-demo.component.html',
  styleUrl: './content-projection-demo.component.css',
})
export class ContentProjectionDemoComponent {}
