import { Component, computed, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { UiProgress } from '@blotch/ui/components/progress';
import { UiToggle } from '@blotch/ui/components/toggle';
import { UiCard, UiCardContent } from '@blotch/ui/components/card';
import { UiCollapsible, UiCollapsibleTrigger, UiCollapsibleContent } from '@blotch/ui/components/collapsible';
import { UiButton } from '@blotch/ui/components/button';
import { UiAvatar } from '@blotch/ui/components/avatar';
import { UiSeparator } from '@blotch/ui/components/separator';

interface Track { title: string; artist: string; duration: string; }

@Component({
  selector: 'app-root',
  imports: [
    LYNX_ELEMENTS,
    UiProgress, UiToggle,
    UiCard, UiCardContent,
    UiCollapsible, UiCollapsibleTrigger, UiCollapsibleContent,
    UiButton, UiAvatar, UiSeparator,
  ],
  template: `
    <scroll-view scroll-orientation="vertical" class="h-full">
      <view class="flex flex-col items-center gap-6 p-6">
        <ui-avatar size="2xl" src="" fallback="♪" />

        <view class="flex flex-col items-center gap-1">
          <text class="text-xl font-bold text-foreground">{{ currentTrack().title }}</text>
          <text class="text-sm text-muted-foreground">{{ currentTrack().artist }}</text>
        </view>

        <view class="flex flex-col gap-1 w-full">
          <ui-progress [value]="position()" />
          <view class="flex flex-row justify-between">
            <text class="text-xs text-muted-foreground">{{ elapsed() }}</text>
            <text class="text-xs text-muted-foreground">{{ currentTrack().duration }}</text>
          </view>
        </view>

        <view class="flex flex-row items-center gap-6">
          <ui-toggle [(pressed)]="shuffle" aria-label="Shuffle">
            <text class="text-base">⇌</text>
          </ui-toggle>
          <ui-button variant="ghost" size="icon" (tap)="prev()">
            <text class="text-2xl">⏮</text>
          </ui-button>
          <ui-button size="icon" class="w-16 h-16 rounded-full" (tap)="togglePlay()">
            <text class="text-2xl">{{ playing() ? '⏸' : '▶' }}</text>
          </ui-button>
          <ui-button variant="ghost" size="icon" (tap)="next()">
            <text class="text-2xl">⏭</text>
          </ui-button>
          <ui-toggle [(pressed)]="repeat" aria-label="Repeat">
            <text class="text-base">↺</text>
          </ui-toggle>
        </view>

        <ui-separator class="w-full" />

        <ui-collapsible class="w-full">
          <ui-collapsible-trigger>
            <view class="flex flex-row justify-between items-center py-2">
              <text class="text-sm font-semibold text-foreground">Up Next</text>
              <text class="text-xs text-muted-foreground">{{ queue.length }} tracks</text>
            </view>
          </ui-collapsible-trigger>
          <ui-collapsible-content>
            <view class="flex flex-col gap-2 mt-2">
              @for (track of queue; track track.title; let i = $index) {
                <view class="flex flex-row items-center gap-3 p-2 rounded-md"
                      [class.bg-accent]="i === trackIndex()"
                      (bindtap)="jumpTo(i)">
                  <ui-avatar size="sm" src="" [fallback]="String(i + 1)" />
                  <view class="flex flex-col gap-0.5 flex-1">
                    <text class="text-sm font-medium text-foreground">{{ track.title }}</text>
                    <text class="text-xs text-muted-foreground">{{ track.artist }}</text>
                  </view>
                  <text class="text-xs text-muted-foreground">{{ track.duration }}</text>
                </view>
              }
            </view>
          </ui-collapsible-content>
        </ui-collapsible>
      </view>
    </scroll-view>
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

  togglePlay(): void { this.playing.update((p) => !p); }
  next(): void { this.trackIndex.update((i) => (i + 1) % this.queue.length); this.position.set(0); }
  prev(): void { this.trackIndex.update((i) => (i - 1 + this.queue.length) % this.queue.length); this.position.set(0); }
  jumpTo(index: number): void { this.trackIndex.set(index); this.position.set(0); this.playing.set(true); }
}
