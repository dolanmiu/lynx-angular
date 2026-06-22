import { Component, computed, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { UiProgress } from '../components/ui/progress';
import { UiToggle } from '../components/ui/toggle';
import {
  UiCollapsible,
  UiCollapsibleTrigger,
  UiCollapsibleContent,
} from '../components/ui/collapsible';
import { UiButton } from '../components/ui/button';
import { UiAvatar } from '../components/ui/avatar';
import { UiSeparator } from '../components/ui/separator';

type Track = { title: string; artist: string; duration: string };

@Component({
  selector: 'app-root',
  imports: [
    LYNX_ELEMENTS,
    UiProgress,
    UiToggle,
    UiCollapsible,
    UiCollapsibleTrigger,
    UiCollapsibleContent,
    UiButton,
    UiAvatar,
    UiSeparator
],
  template: `
    <scroll-view scroll-orientation="vertical" class="page">
      <view class="container">
        <view class="album-art">
          <ui-avatar size="2xl" src="" fallback="♪" />
        </view>

        <view class="track-info">
          <text class="track-title">{{ currentTrack().title }}</text>
          <text class="track-artist">{{ currentTrack().artist }}</text>
        </view>

        <view class="progress-section">
          <ui-progress [value]="position()" />
          <view class="time-row">
            <text class="time-text">{{ elapsed() }}</text>
            <text class="time-text">{{ currentTrack().duration }}</text>
          </view>
        </view>

        <view class="controls">
          <ui-toggle [(pressed)]="shuffle" aria-label="Shuffle">
            <text class="control-icon">⇌</text>
          </ui-toggle>
          <ui-button variant="ghost" size="icon" (pressed)="prev()">
            <text class="control-icon-lg">⏮</text>
          </ui-button>
          <view class="play-btn" (bindtap)="togglePlay()">
            <text class="play-icon">{{ playing() ? '⏸' : '▶' }}</text>
          </view>
          <ui-button variant="ghost" size="icon" (pressed)="next()">
            <text class="control-icon-lg">⏭</text>
          </ui-button>
          <ui-toggle [(pressed)]="repeat" aria-label="Repeat">
            <text class="control-icon">↺</text>
          </ui-toggle>
        </view>

        <ui-separator class="w-full" />

        <ui-collapsible class="w-full">
          <ui-collapsible-trigger>
            <view class="queue-header">
              <text class="queue-title">Up Next</text>
              <text class="queue-count">{{ queue.length }} tracks</text>
            </view>
          </ui-collapsible-trigger>
          <ui-collapsible-content>
            <view class="queue-list">
              @for (track of queue; track track.title; let i = $index) {
                <view
                  class="queue-item"
                  [class.queue-item-active]="i === trackIndex()"
                  (bindtap)="jumpTo(i)"
                >
                  <ui-avatar size="sm" src="" [fallback]="String(i + 1)" />
                  <view class="queue-item-info">
                    <text class="queue-item-title">{{ track.title }}</text>
                    <text class="queue-item-artist">{{ track.artist }}</text>
                  </view>
                  <text class="queue-item-duration">{{ track.duration }}</text>
                </view>
              }
            </view>
          </ui-collapsible-content>
        </ui-collapsible>
      </view>
    </scroll-view>
  `,
  styles: `
    .page {
      height: 100vh;
      background-color: #fafafa;
    }
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
      padding: 32px 24px;
    }
    .album-art {
      padding: 8px;
      background-color: #ffffff;
      border: 1px solid #e4e4e7;
      border-radius: 20px;
    }
    .track-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .track-title {
      font-size: 22px;
      font-weight: bold;
      color: #18181b;
    }
    .track-artist {
      font-size: 14px;
      color: #71717a;
    }
    .progress-section {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
    }
    .time-row {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
    .time-text {
      font-size: 12px;
      color: #a1a1aa;
    }
    .controls {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 20px;
    }
    .control-icon {
      font-size: 16px;
    }
    .control-icon-lg {
      font-size: 24px;
    }
    .play-btn {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background-color: #6366f1;
      align-items: center;
      justify-content: center;
    }
    .play-icon {
      font-size: 24px;
      color: #ffffff;
    }
    .queue-header {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }
    .queue-title {
      font-size: 14px;
      font-weight: 600;
      color: #18181b;
    }
    .queue-count {
      font-size: 12px;
      color: #a1a1aa;
    }
    .queue-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 8px;
    }
    .queue-item {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 10px;
    }
    .queue-item-active {
      background-color: #eef2ff;
    }
    .queue-item-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
    }
    .queue-item-title {
      font-size: 14px;
      font-weight: 500;
      color: #18181b;
    }
    .queue-item-artist {
      font-size: 12px;
      color: #a1a1aa;
    }
    .queue-item-duration {
      font-size: 12px;
      color: #a1a1aa;
    }
  `,
})
export class App {
  readonly String = String;
  readonly playing = signal(false);
  readonly shuffle = signal(false);
  readonly repeat = signal(false);
  readonly position = signal(35);
  readonly trackIndex = signal(0);

  readonly queue: Track[] = [
    // cspell:disable-next-line
    { title: 'Signals & Noise', artist: 'The Reactives', duration: '3:42' },
    { title: 'Zone-Free Zone', artist: 'Async Await', duration: '4:15' },
    { title: 'Computed Values', artist: 'Signal Corps', duration: '2:58' },
    { title: 'Change Detection', artist: 'OnPush Band', duration: '5:01' },
  ];

  readonly currentTrack = computed(() => this.queue[this.trackIndex()]);

  readonly elapsed = computed(() => {
    const [m, s] = this.currentTrack().duration.split(':').map(Number);
    const totalSecs = m * 60 + s;
    const secs = Math.floor((this.position() / 100) * totalSecs);
    return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
  });

  togglePlay(): void {
    this.playing.update((p) => !p);
  }
  next(): void {
    this.trackIndex.update((i) => (i + 1) % this.queue.length);
    this.position.set(0);
  }
  prev(): void {
    this.trackIndex.update(
      (i) => (i - 1 + this.queue.length) % this.queue.length,
    );
    this.position.set(0);
  }
  jumpTo(index: number): void {
    this.trackIndex.set(index);
    this.position.set(0);
    this.playing.set(true);
  }
}
