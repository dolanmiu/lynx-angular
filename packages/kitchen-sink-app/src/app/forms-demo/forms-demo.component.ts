import { Component, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-forms-demo',
  standalone: true,
  imports: [LYNX_ELEMENTS, ReactiveFormsModule],
  template: `
    <scroll-view scroll-orientation="vertical" style="flex: 1;">
      <view style="padding: 16px;">
        <text style="font-size: 20px; font-weight: bold; margin-bottom: 4px;">
          Angular Forms
        </text>
        <text style="font-size: 13px; color: #666; margin-bottom: 20px;">
          Reactive forms via ControlValueAccessor.
        </text>

        <!-- Name -->
        <text style="font-size: 13px; color: #555; margin-bottom: 4px;"
          >Name *</text
        >
        <input
          type="text"
          placeholder="Your name"
          style="border: 1px solid #ccc; padding: 10px; border-radius: 6px; font-size: 15px; margin-bottom: 4px;"
          [formControl]="form.controls.name"
        />
        @if (form.controls.name.invalid && form.controls.name.touched) {
          <text style="font-size: 12px; color: #e53e3e; margin-bottom: 8px;">
            Name is required
          </text>
        } @else {
          <view style="height: 12px; margin-bottom: 8px;" />
        }

        <!-- Email -->
        <text style="font-size: 13px; color: #555; margin-bottom: 4px;"
          >Email *</text
        >
        <input
          type="email"
          placeholder="you@example.com"
          style="border: 1px solid #ccc; padding: 10px; border-radius: 6px; font-size: 15px; margin-bottom: 4px;"
          [formControl]="form.controls.email"
        />
        @if (form.controls.email.touched) {
          @if (form.controls.email.hasError('required')) {
            <text style="font-size: 12px; color: #e53e3e; margin-bottom: 8px;">
              Email is required
            </text>
          } @else if (form.controls.email.hasError('email')) {
            <text style="font-size: 12px; color: #e53e3e; margin-bottom: 8px;">
              Enter a valid email address
            </text>
          } @else {
            <view style="height: 12px; margin-bottom: 8px;" />
          }
        } @else {
          <view style="height: 12px; margin-bottom: 8px;" />
        }

        <!-- Message -->
        <text style="font-size: 13px; color: #555; margin-bottom: 4px;"
          >Message</text
        >
        <textarea
          placeholder="Write a message..."
          style="border: 1px solid #ccc; padding: 10px; border-radius: 6px; font-size: 15px; height: 80px; margin-bottom: 16px;"
          [formControl]="form.controls.message"
        ></textarea>

        <!-- Form state badges -->
        <view
          style="flex-direction: row; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;"
        >
          <view
            style="padding: 4px 8px; border-radius: 4px;"
            [style]="
              form.valid ? 'background: #dcfce7;' : 'background: #fee2e2;'
            "
          >
            <text style="font-size: 12px;">
              {{ form.valid ? '✓ Valid' : '✗ Invalid' }}
            </text>
          </view>
          @if (form.dirty) {
            <view
              style="padding: 4px 8px; border-radius: 4px; background: #fef9c3;"
            >
              <text style="font-size: 12px;">Dirty</text>
            </view>
          }
          @if (form.touched) {
            <view
              style="padding: 4px 8px; border-radius: 4px; background: #f3e8ff;"
            >
              <text style="font-size: 12px;">Touched</text>
            </view>
          }
          @if (disabled()) {
            <view
              style="padding: 4px 8px; border-radius: 4px; background: #f1f5f9;"
            >
              <text style="font-size: 12px;">Disabled</text>
            </view>
          }
        </view>

        <!-- Action buttons -->
        <view style="flex-direction: row; gap: 8px; margin-bottom: 16px;">
          <view
            style="flex: 1; background: #4f46e5; padding: 12px; border-radius: 6px; align-items: center;"
            (bindtap)="submit()"
          >
            <text style="color: white; font-size: 15px; font-weight: 600;">
              Submit
            </text>
          </view>
          <view
            style="flex: 1; background: #f1f5f9; padding: 12px; border-radius: 6px; align-items: center; border: 1px solid #e2e8f0;"
            (bindtap)="toggleDisable()"
          >
            <text style="font-size: 15px;">
              {{ disabled() ? 'Enable' : 'Disable' }}
            </text>
          </view>
        </view>

        <!-- Result -->
        @if (result()) {
          <view
            style="background: #f0fdf4; border: 1px solid #86efac; padding: 12px; border-radius: 6px;"
          >
            <text
              style="font-size: 13px; color: #166534; margin-bottom: 2px; font-weight: 600;"
            >
              Submitted!
            </text>
            <text style="font-size: 13px; color: #166534;">
              {{ result() }}
            </text>
          </view>
        }
      </view>
    </scroll-view>
  `,
})
export class FormsDemoComponent {
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

  disabled = signal(false);
  result = signal('');

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      const { name, email } = this.form.getRawValue();
      this.result.set(`From ${name} <${email}>`);
      setTimeout(() => {
        this.result.set('');
        this.form.reset();
      }, 4000);
    }
  }

  toggleDisable(): void {
    if (this.disabled()) {
      this.form.enable();
      this.disabled.set(false);
    } else {
      this.form.disable();
      this.disabled.set(true);
    }
  }
}
