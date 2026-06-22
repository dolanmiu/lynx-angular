import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LYNX_ELEMENTS, ReactiveFormsModule],
  template: `
    <scroll-view class="page" scroll-orientation="vertical">
      <view class="container">
        <text class="title">Contact Us</text>
        <text class="subtitle">Angular reactive forms — powered by Lynx.</text>

        <view class="card">
          <!-- Name -->
          <text class="field-label">Name *</text>
          <input
            type="text"
            class="input"
            placeholder="Your name"
            [formControl]="form.controls.name"
          />
          @if (form.controls.name.invalid && form.controls.name.touched) {
            <text class="error">Name is required</text>
          } @else {
            <view class="spacer" />
          }

          <!-- Email -->
          <text class="field-label field-gap">Email *</text>
          <input
            type="email"
            class="input"
            placeholder="you@example.com"
            [formControl]="form.controls.email"
          />
          @if (form.controls.email.touched) {
            @if (form.controls.email.hasError('required')) {
              <text class="error">Email is required</text>
            } @else if (form.controls.email.hasError('email')) {
              <text class="error">Enter a valid email address</text>
            } @else {
              <view class="spacer" />
            }
          } @else {
            <view class="spacer" />
          }

          <!-- Message -->
          <text class="field-label field-gap">Message</text>
          <textarea
            class="textarea"
            placeholder="Write a message..."
            [formControl]="form.controls.message"
          ></textarea>
        </view>

        <!-- Submit -->
        <view class="btn" (bindtap)="submit()">
          <text class="btn-text">
            {{ submitted() ? 'Sent ✓' : 'Send Message' }}
          </text>
        </view>

        @if (submitted()) {
          <view class="success-card">
            <text class="success-title">
              Message sent from {{ form.value.name }}!
            </text>
            <text class="success-detail">
              Reply to: {{ form.value.email }}
            </text>
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
      margin-top: 4px;
    }
    .input {
      padding: 12px 14px;
      font-size: 15px;
      border: 1px solid #e4e4e7;
      border-radius: 8px;
    }
    .textarea {
      padding: 12px 14px;
      font-size: 15px;
      border: 1px solid #e4e4e7;
      border-radius: 8px;
      height: 100px;
    }
    .error {
      font-size: 12px;
      color: #ef4444;
      margin-top: 4px;
      margin-bottom: 8px;
    }
    .spacer {
      height: 12px;
    }
    .btn {
      background-color: #6366f1;
      padding: 14px;
      border-radius: 10px;
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
    }
    .success-title {
      font-size: 14px;
      color: #166534;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .success-detail {
      font-size: 13px;
      color: #166534;
    }
  `,
})
export class App {
  form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    message: new FormControl('', { nonNullable: true }),
  });

  submitted = signal(false);

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      this.submitted.set(true);
      setTimeout(() => {
        this.submitted.set(false);
        this.form.reset();
      }, 3000);
    }
  }
}
