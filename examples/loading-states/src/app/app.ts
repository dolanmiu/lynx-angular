import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { UiProgress } from '@blotch/ui/components/progress';
import { UiSkeleton } from '@blotch/ui/components/skeleton';
import { UiSpinner } from '@blotch/ui/components/spinner';
import { UiToaster, toast } from '@blotch/ui/components/toast';
import { UiCard, UiCardContent, UiCardHeader, UiCardTitle } from '@blotch/ui/components/card';
import { UiButton } from '@blotch/ui/components/button';
import { UiBadge } from '@blotch/ui/components/badge';
import { UiSeparator } from '@blotch/ui/components/separator';

interface UploadFile {
  id: number;
  name: string;
  progress: number;
  done: boolean;
}

@Component({
  selector: 'app-root',
  imports: [
    LYNX_ELEMENTS,
    UiProgress, UiSkeleton, UiSpinner, UiToaster,
    UiCard, UiCardContent, UiCardHeader, UiCardTitle,
    UiButton, UiBadge, UiSeparator,
  ],
  template: `
    <scroll-view scroll-orientation="vertical" class="h-full">
      <view class="flex flex-col gap-6 p-6">
        <text class="text-2xl font-bold text-foreground">File Manager</text>

        <ui-card>
          <ui-card-header>
            <view class="flex flex-row items-center justify-between">
              <ui-card-title>Uploads</ui-card-title>
              @if (syncing()) {
                <view class="flex flex-row items-center gap-2">
                  <ui-spinner size="sm" />
                  <text class="text-xs text-muted-foreground">Syncing...</text>
                </view>
              }
            </view>
          </ui-card-header>
          <ui-card-content class="flex flex-col gap-4">
            @for (file of files(); track file.id) {
              <view class="flex flex-col gap-1.5">
                <view class="flex flex-row items-center justify-between">
                  <text class="text-sm text-foreground">{{ file.name }}</text>
                  @if (file.done) {
                    <ui-badge variant="secondary">Done</ui-badge>
                  } @else {
                    <text class="text-xs text-muted-foreground">{{ file.progress }}%</text>
                  }
                </view>
                <ui-progress [value]="file.progress" />
              </view>
            }
            <ui-button size="sm" (tap)="startUpload()" [disabled]="uploading()">
              @if (uploading()) {
                <view class="flex flex-row items-center gap-2">
                  <ui-spinner size="sm" />
                  <text>Uploading...</text>
                </view>
              } @else {
                <text>Upload Files</text>
              }
            </ui-button>
          </ui-card-content>
        </ui-card>

        <ui-separator />

        <view class="flex flex-col gap-3">
          <text class="text-sm font-medium text-foreground">Recent Files</text>
          @if (loading()) {
            @for (i of [1, 2, 3]; track i) {
              <view class="flex flex-row items-center gap-3">
                <ui-skeleton class="w-10 h-10 rounded-md" />
                <view class="flex flex-col gap-2 flex-1">
                  <ui-skeleton class="h-4 w-3/4 rounded" />
                  <ui-skeleton class="h-3 w-1/2 rounded" />
                </view>
              </view>
            }
          } @else {
            @for (file of recentFiles; track file.name) {
              <view class="flex flex-row items-center gap-3">
                <view class="w-10 h-10 rounded-md bg-muted items-center justify-content-center">
                  <text class="text-lg">{{ file.icon }}</text>
                </view>
                <view class="flex flex-col gap-0.5 flex-1">
                  <text class="text-sm font-medium text-foreground">{{ file.name }}</text>
                  <text class="text-xs text-muted-foreground">{{ file.size }} · {{ file.date }}</text>
                </view>
              </view>
            }
          }
        </view>

        <ui-button variant="outline" (tap)="reload()">Reload</ui-button>
      </view>
    </scroll-view>
    <ui-toaster />
  `,
})
export class App {
  readonly loading = signal(true);
  readonly uploading = signal(false);
  readonly syncing = signal(false);
  readonly files = signal<UploadFile[]>([
    { id: 1, name: 'report.pdf', progress: 100, done: true },
    { id: 2, name: 'photo.jpg', progress: 60, done: false },
    { id: 3, name: 'data.csv', progress: 20, done: false },
  ]);

  readonly recentFiles = [
    { icon: '📄', name: 'project-brief.pdf', size: '2.4 MB', date: 'Today' },
    { icon: '🖼️', name: 'design-mockup.png', size: '5.1 MB', date: 'Yesterday' },
    { icon: '📊', name: 'analytics.xlsx', size: '820 KB', date: '2 days ago' },
  ];

  constructor() {
    setTimeout(() => this.loading.set(false), 1500);
  }

  startUpload(): void {
    this.uploading.set(true);
    this.syncing.set(true);
    this.files.update((list) => list.map((f) => ({ ...f, progress: f.done ? 100 : 0 })));
    let tick = 0;
    const interval = setInterval(() => {
      tick += 10;
      this.files.update((list) =>
        list.map((f) => f.done ? f : { ...f, progress: Math.min(f.progress + 15, 100), done: f.progress + 15 >= 100 }),
      );
      if (this.files().every((f) => f.done) || tick >= 100) {
        clearInterval(interval);
        this.uploading.set(false);
        this.syncing.set(false);
        toast('All files uploaded successfully');
      }
    }, 400);
  }

  reload(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 1200);
  }
}
