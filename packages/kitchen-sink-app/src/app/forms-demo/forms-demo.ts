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
    <scroll-view scroll-orientation="vertical" class="flex-1">
      <view class="p-4">
        <text class="mb-1 text-xl font-bold"> Angular Forms </text>
        <text class="mb-5 text-[13px] text-gray-500">
          Reactive forms via ControlValueAccessor.
        </text>

        <!-- Name -->
        <text class="mb-1 text-[13px] text-gray-600">Name *</text>
        <input
          type="text"
          placeholder="Your name"
          class="mb-1 rounded-md border border-gray-300 p-2.5 text-[15px]"
          [formControl]="form.controls.name"
        />
        @if (form.controls.name.invalid && form.controls.name.touched) {
          <text class="mb-2 text-xs text-red-500"> Name is required </text>
        } @else {
          <view class="mb-2 h-3" />
        }

        <!-- Email -->
        <text class="mb-1 text-[13px] text-gray-600">Email *</text>
        <input
          type="email"
          placeholder="you@example.com"
          class="mb-1 rounded-md border border-gray-300 p-2.5 text-[15px]"
          [formControl]="form.controls.email"
        />
        @if (form.controls.email.touched) {
          @if (form.controls.email.hasError('required')) {
            <text class="mb-2 text-xs text-red-500"> Email is required </text>
          } @else if (form.controls.email.hasError('email')) {
            <text class="mb-2 text-xs text-red-500">
              Enter a valid email address
            </text>
          } @else {
            <view class="mb-2 h-3" />
          }
        } @else {
          <view class="mb-2 h-3" />
        }

        <!-- Message -->
        <text class="mb-1 text-[13px] text-gray-600">Message</text>
        <textarea
          placeholder="Write a message..."
          class="mb-4 h-[80px] rounded-md border border-gray-300 p-2.5 text-[15px]"
          [formControl]="form.controls.message"
        ></textarea>

        <!-- Form state badges -->
        <view class="mb-4 flex-row flex-wrap gap-2 flex">
          <view
            class="rounded px-2 py-1"
            [class.bg-green-100]="form.valid"
            [class.bg-red-100]="!form.valid"
          >
            <text class="text-xs">
              {{ form.valid ? '✓ Valid' : '✗ Invalid' }}
            </text>
          </view>
          @if (form.dirty) {
            <view class="rounded bg-yellow-100 px-2 py-1">
              <text class="text-xs">Dirty</text>
            </view>
          }
          @if (form.touched) {
            <view class="rounded bg-purple-100 px-2 py-1">
              <text class="text-xs">Touched</text>
            </view>
          }
          @if (disabled()) {
            <view class="rounded bg-slate-100 px-2 py-1">
              <text class="text-xs">Disabled</text>
            </view>
          }
        </view>

        <!-- Action buttons -->
        <view class="mb-4 flex-row gap-2 flex">
          <view
            class="flex-1 items-center rounded-md bg-indigo-600 p-3"
            (bindtap)="submit()"
          >
            <text class="text-[15px] font-semibold text-white"> Submit </text>
          </view>
          <view
            class="flex-1 items-center rounded-md border border-slate-200 bg-slate-100 p-3"
            (bindtap)="toggleDisable()"
          >
            <text class="text-[15px]">
              {{ disabled() ? 'Enable' : 'Disable' }}
            </text>
          </view>
        </view>

        <!-- Result -->
        @if (result()) {
          <view class="rounded-md border border-green-300 bg-green-50 p-3">
            <text class="mb-0.5 text-[13px] font-semibold text-green-800">
              Submitted!
            </text>
            <text class="text-[13px] text-green-800">
              {{ result() }}
            </text>
          </view>
        }
      </view>
    </scroll-view>
  `,
})
export class FormsDemo {
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

  // `disabled` mirrors form.disabled as a signal because Angular's FormGroup
  // doesn't expose its enabled/disabled state as a signal — the template can't
  // reactively read form.disabled without an explicit signal bridge.
  disabled = signal(false);
  result = signal('');

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      const { name, email } = this.form.getRawValue();
      this.result.set(`From ${name} <${email}>`);
      // Clear the result banner after 4 seconds and reset the form.
      // setTimeout is safe here — it's outside the native event callback.
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
