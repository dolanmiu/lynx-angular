import { Component, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { UiProgress } from '../components/ui/progress';
import { UiSkeleton } from '../components/ui/skeleton';
import { UiSpinner } from '../components/ui/spinner';
import { UiToaster, toast } from '../components/ui/toast';
import { UiCard, UiCardContent, UiCardHeader, UiCardTitle } from '../components/ui/card';
import { UiButton } from '../components/ui/button';
import { UiBadge } from '../components/ui/badge';
import { UiSeparator } from '../components/ui/separator';

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
    <scroll-view scroll-orientation="vertical" class="page">
      <view class="container">
        <text class="title">File Manager</text>

        <ui-card>
          <ui-card-header>
            <view class="card-header-row">
              <ui-card-title>Uploads</ui-card-title>
              @if (syncing()) {
                <view class="sync-indicator">
                  <ui-spinner size="sm" />
                  <text class="sync-text">Syncing...</text>
                </view>
              }
            </view>
          </ui-card-header>
          <ui-card-content>
            <view class="upload-list">
              @for (file of files(); track file.id) {
                <view class="upload-item">
                  <view class="upload-info">
                    <text class="file-name">{{ file.name }}</text>
                    @if (file.done) {
                      <ui-badge variant="secondary">Done</ui-badge>
                    } @else {
                      <text class="file-progress">{{ file.progress }}%</text>
                    }
                  </view>
                  <ui-progress [value]="file.progress" />
                </view>
              }
              <ui-button size="sm" (pressed)="startUpload()" [disabled]="uploading()">
                @if (uploading()) {
                  <view class="btn-loading">
                    <ui-spinner size="sm" />
                    <text>Uploading...</text>
                  </view>
                } @else {
                  <text>Upload Files</text>
                }
              </ui-button>
            </view>
          </ui-card-content>
        </ui-card>

        <ui-separator />

        <view class="recent-section">
          <text class="section-title">Recent Files</text>
          @if (loading()) {
            @for (i of [1, 2, 3]; track i) {
              <view class="skeleton-row">
                <ui-skeleton class="skeleton-icon" />
                <view class="skeleton-text-group">
                  <ui-skeleton class="skeleton-line" />
                  <ui-skeleton class="skeleton-line-short" />
                </view>
              </view>
            }
          } @else {
            @for (file of recentFiles; track file.name) {
              <view class="file-row">
                <view class="file-icon">
                  <text class="file-icon-text">{{ file.icon }}</text>
                </view>
                <view class="file-details">
                  <text class="file-detail-name">{{ file.name }}</text>
                  <text class="file-detail-meta">{{ file.size }} · {{ file.date }}</text>
                </view>
              </view>
            }
          }
        </view>

        <ui-button variant="outline" (pressed)="reload()">Reload</ui-button>
      </view>
    </scroll-view>
    <ui-toaster />
  `,
  styles: `
    .page { height: 100vh; background-color: #fafafa; }
    .container { display: flex; flex-direction: column; gap: 24px; padding: 24px; }
    .title { font-size: 28px; font-weight: bold; color: #18181b; }
    .card-header-row { display: flex; flex-direction: row; align-items: center; justify-content: space-between; }
    .sync-indicator { display: flex; flex-direction: row; align-items: center; gap: 8px; }
    .sync-text { font-size: 12px; color: #a1a1aa; }
    .upload-list { display: flex; flex-direction: column; gap: 16px; }
    .upload-item { display: flex; flex-direction: column; gap: 6px; }
    .upload-info { display: flex; flex-direction: row; align-items: center; justify-content: space-between; }
    .file-name { font-size: 14px; color: #18181b; }
    .file-progress { font-size: 12px; color: #a1a1aa; }
    .btn-loading { display: flex; flex-direction: row; align-items: center; gap: 8px; }
    .recent-section { display: flex; flex-direction: column; gap: 12px; }
    .section-title { font-size: 14px; font-weight: 500; color: #18181b; }
    .skeleton-row { display: flex; flex-direction: row; align-items: center; gap: 12px; }
    .skeleton-icon { width: 40px; height: 40px; border-radius: 8px; }
    .skeleton-text-group { display: flex; flex-direction: column; gap: 8px; flex: 1; }
    .skeleton-line { height: 14px; width: 75%; border-radius: 4px; }
    .skeleton-line-short { height: 12px; width: 50%; border-radius: 4px; }
    .file-row { display: flex; flex-direction: row; align-items: center; gap: 12px; padding: 10px 14px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; }
    .file-icon { width: 40px; height: 40px; border-radius: 8px; background-color: #f4f4f5; align-items: center; justify-content: center; }
    .file-icon-text { font-size: 18px; }
    .file-details { display: flex; flex-direction: column; gap: 2px; flex: 1; }
    .file-detail-name { font-size: 14px; font-weight: 500; color: #18181b; }
    .file-detail-meta { font-size: 12px; color: #a1a1aa; }
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
        toast({ title: 'All files uploaded successfully' });
      }
    }, 400);
  }

  reload(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 1200);
  }
}
