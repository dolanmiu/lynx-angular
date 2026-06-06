import { Component, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  imports: [LYNX_ELEMENTS, ReactiveFormsModule],
  template: `
    <view style="padding: 24px;">
      <text style="font-size: 24px; font-weight: bold; margin-bottom: 4px;">
        Contact Us
      </text>
      <text style="font-size: 14px; color: #666; margin-bottom: 24px;">
        Angular reactive forms — powered by Lynx.
      </text>

      <!-- Name -->
      <text style="font-size: 13px; color: #555; margin-bottom: 4px;"
        >Name *</text
      >
      <input
        type="text"
        placeholder="Your name"
        style="border: 1px solid #ccc; padding: 12px; border-radius: 8px; font-size: 16px; margin-bottom: 4px;"
        [formControl]="form.controls.name"
      />
      @if (form.controls.name.invalid && form.controls.name.touched) {
        <text style="font-size: 12px; color: #e53e3e; margin-bottom: 12px;">
          Name is required
        </text>
      } @else {
        <view style="height: 16px; margin-bottom: 12px;" />
      }

      <!-- Email -->
      <text style="font-size: 13px; color: #555; margin-bottom: 4px;"
        >Email *</text
      >
      <input
        type="email"
        placeholder="you@example.com"
        style="border: 1px solid #ccc; padding: 12px; border-radius: 8px; font-size: 16px; margin-bottom: 4px;"
        [formControl]="form.controls.email"
      />
      @if (form.controls.email.touched) {
        @if (form.controls.email.hasError('required')) {
          <text style="font-size: 12px; color: #e53e3e; margin-bottom: 12px;">
            Email is required
          </text>
        } @else if (form.controls.email.hasError('email')) {
          <text style="font-size: 12px; color: #e53e3e; margin-bottom: 12px;">
            Enter a valid email address
          </text>
        } @else {
          <view style="height: 16px; margin-bottom: 12px;" />
        }
      } @else {
        <view style="height: 16px; margin-bottom: 12px;" />
      }

      <!-- Message -->
      <text style="font-size: 13px; color: #555; margin-bottom: 4px;"
        >Message</text
      >
      <textarea
        placeholder="Write a message..."
        style="border: 1px solid #ccc; padding: 12px; border-radius: 8px; font-size: 16px; height: 100px; margin-bottom: 20px;"
        [formControl]="form.controls.message"
      ></textarea>

      <!-- Submit -->
      <view
        style="background: #4f46e5; padding: 14px; border-radius: 8px; align-items: center;"
        (bindtap)="submit()"
      >
        <text style="color: white; font-size: 16px; font-weight: 600;">
          {{ submitted() ? 'Sent ✓' : 'Send Message' }}
        </text>
      </view>

      @if (submitted()) {
        <view
          style="background: #f0fdf4; border: 1px solid #86efac; padding: 12px; border-radius: 8px; margin-top: 16px;"
        >
          <text style="font-size: 14px; color: #166534; margin-bottom: 4px;">
            Message sent from {{ form.value.name }}!
          </text>
          <text style="font-size: 13px; color: #166534;">
            Reply to: {{ form.value.email }}
          </text>
        </view>
      }
    </view>
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
