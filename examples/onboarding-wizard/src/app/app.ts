import { Component, computed, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { UiProgress } from '@blotch/ui/components/progress';
import { UiRadioGroup, UiRadioGroupItem } from '@blotch/ui/components/radio-group';
import { UiCheckbox } from '@blotch/ui/components/checkbox';
import { UiButton } from '@blotch/ui/components/button';
import { UiCard, UiCardContent, UiCardHeader, UiCardTitle } from '@blotch/ui/components/card';
import { UiSeparator } from '@blotch/ui/components/separator';
import { UiLabel } from '@blotch/ui/components/label';

type Role = 'developer' | 'designer' | 'manager' | 'founder';

@Component({
  selector: 'app-root',
  imports: [
    LYNX_ELEMENTS,
    UiProgress,
    UiRadioGroup, UiRadioGroupItem,
    UiCheckbox,
    UiButton,
    UiCard, UiCardContent, UiCardHeader, UiCardTitle,
    UiSeparator, UiLabel,
  ],
  template: `
    <scroll-view scroll-orientation="vertical" class="h-full">
      <view class="flex flex-col gap-6 p-6">
        <view class="flex flex-col gap-2">
          <view class="flex flex-row justify-between">
            <text class="text-sm text-muted-foreground">Step {{ step() }} of {{ totalSteps }}</text>
            <text class="text-sm text-muted-foreground">{{ Math.round(progress()) }}%</text>
          </view>
          <ui-progress [value]="progress()" />
        </view>

        @if (step() === 1) {
          <view class="flex flex-col items-center gap-4 py-6">
            <text class="text-4xl">👋</text>
            <text class="text-2xl font-bold text-foreground text-center">Welcome to AngularLynx</text>
            <text class="text-sm text-muted-foreground text-center">Let's personalize your experience. This only takes a minute.</text>
          </view>
        }

        @if (step() === 2) {
          <view class="flex flex-col gap-4">
            <text class="text-xl font-bold text-foreground">What's your role?</text>
            <ui-radio-group [(value)]="role">
              <view class="flex flex-col gap-2">
                @for (opt of roles; track opt.value) {
                  <view class="flex flex-row items-center gap-3 p-3 rounded-lg border border-border">
                    <ui-radio-group-item [value]="opt.value" [id]="opt.value" />
                    <view class="flex flex-col gap-0.5 flex-1">
                      <ui-label [for]="opt.value">{{ opt.label }}</ui-label>
                      <text class="text-xs text-muted-foreground">{{ opt.desc }}</text>
                    </view>
                  </view>
                }
              </view>
            </ui-radio-group>
          </view>
        }

        @if (step() === 3) {
          <view class="flex flex-col gap-4">
            <text class="text-xl font-bold text-foreground">What are you building?</text>
            <text class="text-sm text-muted-foreground">Select all that apply.</text>
            <view class="flex flex-col gap-2">
              @for (opt of interests; track opt.value) {
                <view class="flex flex-row items-center gap-3 p-3 rounded-lg border border-border"
                      [class.border-primary]="selectedInterests().includes(opt.value)"
                      (bindtap)="toggleInterest(opt.value)">
                  <ui-checkbox [checked]="selectedInterests().includes(opt.value)"
                               (checkedChange)="toggleInterest(opt.value)" />
                  <view class="flex flex-col gap-0.5 flex-1">
                    <text class="text-sm font-medium text-foreground">{{ opt.label }}</text>
                    <text class="text-xs text-muted-foreground">{{ opt.desc }}</text>
                  </view>
                </view>
              }
            </view>
          </view>
        }

        @if (step() === 4) {
          <view class="flex flex-col gap-4">
            <text class="text-xl font-bold text-foreground">You're all set! 🎉</text>
            <ui-card>
              <ui-card-header><ui-card-title>Your Profile</ui-card-title></ui-card-header>
              <ui-card-content class="flex flex-col gap-3">
                <view class="flex flex-row justify-between">
                  <text class="text-sm text-muted-foreground">Role</text>
                  <text class="text-sm font-medium text-foreground">{{ roleName() }}</text>
                </view>
                <ui-separator />
                <view class="flex flex-col gap-1">
                  <text class="text-sm text-muted-foreground">Interests</text>
                  <text class="text-sm font-medium text-foreground">{{ interestNames() }}</text>
                </view>
              </ui-card-content>
            </ui-card>
          </view>
        }

        <view class="flex flex-row gap-3">
          @if (step() > 1) {
            <ui-button variant="outline" class="flex-1" (tap)="back()">Back</ui-button>
          }
          @if (step() < totalSteps) {
            <ui-button class="flex-1" (tap)="next()">{{ step() === 1 ? 'Get Started' : 'Continue' }}</ui-button>
          } @else {
            <ui-button class="flex-1" (tap)="finish()">Finish</ui-button>
          }
        </view>
      </view>
    </scroll-view>
  `,
})
export class App {
  readonly Math = Math;
  readonly totalSteps = 4;
  readonly step = signal(1);
  readonly role = signal<Role>('developer');
  readonly selectedInterests = signal<string[]>([]);

  readonly roles = [
    { value: 'developer', label: 'Developer', desc: 'Building apps and features' },
    { value: 'designer', label: 'Designer', desc: 'Creating UI/UX experiences' },
    { value: 'manager', label: 'Manager', desc: 'Leading a product team' },
    { value: 'founder', label: 'Founder', desc: 'Running a company or startup' },
  ];

  readonly interests = [
    { value: 'mobile', label: 'Mobile App', desc: 'iOS and Android native apps' },
    { value: 'web', label: 'Web App', desc: 'Browser-based applications' },
    { value: 'mini', label: 'Mini App', desc: 'In-platform lightweight apps' },
    { value: 'dashboard', label: 'Dashboard', desc: 'Data visualization & analytics' },
  ];

  readonly progress = computed(() => ((this.step() - 1) / (this.totalSteps - 1)) * 100);
  readonly roleName = computed(() => this.roles.find((r) => r.value === this.role())?.label ?? '');
  readonly interestNames = computed(() =>
    this.selectedInterests().length === 0
      ? 'None selected'
      : this.interests.filter((i) => this.selectedInterests().includes(i.value)).map((i) => i.label).join(', '),
  );

  toggleInterest(value: string): void {
    this.selectedInterests.update((list) =>
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    );
  }

  next(): void { this.step.update((s) => Math.min(s + 1, this.totalSteps)); }
  back(): void { this.step.update((s) => Math.max(s - 1, 1)); }
  finish(): void { this.step.set(1); this.role.set('developer'); this.selectedInterests.set([]); }
}
