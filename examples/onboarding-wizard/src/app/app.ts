import { Component, computed, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { UiProgress } from '../components/ui/progress';
import { UiRadioGroup, UiRadioGroupItem } from '../components/ui/radio-group';
import { UiCheckbox } from '../components/ui/checkbox';
import { UiButton } from '../components/ui/button';
import { UiCard, UiCardContent, UiCardHeader, UiCardTitle } from '../components/ui/card';
import { UiSeparator } from '../components/ui/separator';
import { UiLabel } from '../components/ui/label';

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
    <scroll-view scroll-orientation="vertical" class="page">
      <view class="container">
        <view class="progress-section">
          <view class="progress-labels">
            <text class="step-text">Step {{ step() }} of {{ totalSteps }}</text>
            <text class="step-percent">{{ Math.round(progress()) }}%</text>
          </view>
          <ui-progress [value]="progress()" />
        </view>

        @if (step() === 1) {
          <view class="welcome">
            <text class="welcome-emoji">👋</text>
            <text class="welcome-title">Welcome to AngularLynx</text>
            <text class="welcome-subtitle">Let's personalize your experience. This only takes a minute.</text>
          </view>
        }

        @if (step() === 2) {
          <view class="step-section">
            <text class="step-title">What's your role?</text>
            <ui-radio-group [(value)]="role">
              <view class="option-list">
                @for (opt of roles; track opt.value) {
                  <view class="option-card">
                    <ui-radio-group-item [value]="opt.value" [id]="opt.value" />
                    <view class="option-info">
                      <ui-label [for]="opt.value">{{ opt.label }}</ui-label>
                      <text class="option-desc">{{ opt.desc }}</text>
                    </view>
                  </view>
                }
              </view>
            </ui-radio-group>
          </view>
        }

        @if (step() === 3) {
          <view class="step-section">
            <text class="step-title">What are you building?</text>
            <text class="step-subtitle">Select all that apply.</text>
            <view class="option-list">
              @for (opt of interests; track opt.value) {
                <view class="option-card"
                      [class.option-card-selected]="selectedInterests().includes(opt.value)"
                      (bindtap)="toggleInterest(opt.value)">
                  <ui-checkbox [checked]="selectedInterests().includes(opt.value)"
                               (checkedChange)="toggleInterest(opt.value)" />
                  <view class="option-info">
                    <text class="option-label">{{ opt.label }}</text>
                    <text class="option-desc">{{ opt.desc }}</text>
                  </view>
                </view>
              }
            </view>
          </view>
        }

        @if (step() === 4) {
          <view class="step-section">
            <text class="step-title">You're all set! 🎉</text>
            <ui-card>
              <ui-card-header><ui-card-title>Your Profile</ui-card-title></ui-card-header>
              <ui-card-content>
                <view class="profile-rows">
                  <view class="profile-row">
                    <text class="profile-label">Role</text>
                    <text class="profile-value">{{ roleName() }}</text>
                  </view>
                  <ui-separator />
                  <view class="profile-col">
                    <text class="profile-label">Interests</text>
                    <text class="profile-value">{{ interestNames() }}</text>
                  </view>
                </view>
              </ui-card-content>
            </ui-card>
          </view>
        }

        <view class="button-row">
          @if (step() > 1) {
            <ui-button variant="outline" class="flex-1" (pressed)="back()">Back</ui-button>
          }
          @if (step() < totalSteps) {
            <ui-button class="flex-1" (pressed)="next()">{{ step() === 1 ? 'Get Started' : 'Continue' }}</ui-button>
          } @else {
            <ui-button class="flex-1" (pressed)="finish()">Finish</ui-button>
          }
        </view>
      </view>
    </scroll-view>
  `,
  styles: `
    .page { height: 100vh; background-color: #fafafa; }
    .container { display: flex; flex-direction: column; gap: 24px; padding: 24px; }
    .progress-section { display: flex; flex-direction: column; gap: 8px; }
    .progress-labels { display: flex; flex-direction: row; justify-content: space-between; }
    .step-text { font-size: 14px; color: #71717a; }
    .step-percent { font-size: 14px; color: #71717a; }
    .welcome { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 32px 0; }
    .welcome-emoji { font-size: 48px; }
    .welcome-title { font-size: 26px; font-weight: bold; color: #18181b; text-align: center; }
    .welcome-subtitle { font-size: 14px; color: #71717a; text-align: center; line-height: 20px; }
    .step-section { display: flex; flex-direction: column; gap: 16px; }
    .step-title { font-size: 22px; font-weight: bold; color: #18181b; }
    .step-subtitle { font-size: 14px; color: #71717a; }
    .option-list { display: flex; flex-direction: column; gap: 10px; }
    .option-card { display: flex; flex-direction: row; align-items: center; gap: 12px; padding: 14px 16px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; }
    .option-card-selected { border-color: #6366f1; background-color: #eef2ff; }
    .option-info { display: flex; flex-direction: column; gap: 2px; flex: 1; }
    .option-label { font-size: 14px; font-weight: 500; color: #18181b; }
    .option-desc { font-size: 12px; color: #a1a1aa; }
    .profile-rows { display: flex; flex-direction: column; gap: 12px; }
    .profile-row { display: flex; flex-direction: row; justify-content: space-between; }
    .profile-col { display: flex; flex-direction: column; gap: 4px; }
    .profile-label { font-size: 14px; color: #71717a; }
    .profile-value { font-size: 14px; font-weight: 500; color: #18181b; }
    .button-row { display: flex; flex-direction: row; gap: 12px; }
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
