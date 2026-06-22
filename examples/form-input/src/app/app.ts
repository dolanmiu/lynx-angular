import { Component, computed, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  imports: [LYNX_ELEMENTS],
  template: `
    <scroll-view class="page" scroll-orientation="vertical">
      <view class="container">
        <text class="title">Profile Form</text>
        <text class="subtitle">Input validation with signal-based state.</text>

        <view class="card">
          <text class="field-label">Name</text>
          <input
            class="input"
            [class.input-focused]="focusedField() === 'name'"
            [class.input-error]="submitted() && !name()"
            placeholder="Enter your name"
            [value]="name()"
            (bindinput)="name.set($any($event).detail.value)"
            (bindfocus)="focusedField.set('name')"
            (bindblur)="focusedField.set(null)"
            confirm-type="next"
          />
          @if (submitted() && !name()) {
            <text class="error">Name is required</text>
          }

          <text class="field-label field-gap">Email</text>
          <input
            class="input"
            [class.input-focused]="focusedField() === 'email'"
            [class.input-error]="submitted() && !validEmail()"
            placeholder="you@example.com"
            input-type="email"
            [value]="email()"
            (bindinput)="email.set($any($event).detail.value)"
            (bindfocus)="focusedField.set('email')"
            (bindblur)="focusedField.set(null)"
            confirm-type="next"
          />
          @if (submitted() && !validEmail()) {
            <text class="error">Enter a valid email</text>
          }

          <text class="field-label field-gap">Bio</text>
          <textarea
            class="textarea"
            [class.input-focused]="focusedField() === 'bio'"
            placeholder="Tell us about yourself..."
            [value]="bio()"
            (bindinput)="bio.set($any($event).detail.value)"
            (bindfocus)="focusedField.set('bio')"
            (bindblur)="focusedField.set(null)"
          ></textarea>
          <text class="char-count">{{ bio().length }} / 200</text>
        </view>

        <view class="btn" (bindtap)="submit()">
          <text class="btn-text">Save Profile</text>
        </view>

        @if (successMessage()) {
          <view class="success-card">
            <text class="success-text">{{ successMessage() }}</text>
          </view>
        }
      </view>
    </scroll-view>
  `,
  styles: `
    .page {
      height: 100vh;
      background-color: #fafafa;
    }
    .container {
      padding: 24px;
    }
    .title {
      font-size: 28px;
      font-weight: bold;
      color: #18181b;
      margin-bottom: 4px;
    }
    .subtitle {
      font-size: 13px;
      color: #71717a;
      margin-bottom: 20px;
    }
    .card {
      background-color: #ffffff;
      border: 1px solid #e4e4e7;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .field-label {
      font-size: 13px;
      font-weight: 600;
      color: #18181b;
      margin-bottom: 6px;
    }
    .field-gap {
      margin-top: 16px;
    }
    .input {
      padding: 12px 14px;
      font-size: 15px;
      background-color: #ffffff;
      border-radius: 8px;
      border: 1px solid #e4e4e7;
    }
    .input-focused {
      border-color: #6366f1;
    }
    .input-error {
      border-color: #ef4444;
    }
    .textarea {
      padding: 12px 14px;
      font-size: 15px;
      background-color: #ffffff;
      border-radius: 8px;
      border: 1px solid #e4e4e7;
      height: 100px;
    }
    .char-count {
      font-size: 12px;
      color: #a1a1aa;
      text-align: right;
      margin-top: 4px;
    }
    .error {
      font-size: 12px;
      color: #ef4444;
      margin-top: 4px;
    }
    .btn {
      background-color: #6366f1;
      border-radius: 10px;
      padding: 14px;
      align-items: center;
    }
    .btn-text {
      color: white;
      font-size: 16px;
      font-weight: 600;
    }
    .success-card {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 12px;
      padding: 14px;
      margin-top: 16px;
      align-items: center;
    }
    .success-text {
      font-size: 14px;
      color: #166534;
    }
  `,
})
export class App {
  readonly name = signal('');
  readonly email = signal('');
  readonly bio = signal('');
  readonly focusedField = signal<string | null>(null);
  readonly submitted = signal(false);
  readonly successMessage = signal('');

  readonly validEmail = computed(() =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email()),
  );

  submit(): void {
    this.submitted.set(true);
    this.successMessage.set('');
    if (!this.name() || !this.validEmail()) return;
    this.successMessage.set(`Saved: ${this.name()} (${this.email()})`);
    this.submitted.set(false);
  }
}
