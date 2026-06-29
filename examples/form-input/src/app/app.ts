import { Component, computed, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

@Component({
  selector: 'app-root',
  imports: [LYNX_ELEMENTS],
  template: `
    <scroll-view class="h-screen bg-zinc-50" scroll-orientation="vertical">
      <view class="p-6">
        <text class="text-[28px] font-bold text-zinc-900 mb-1"
          >Profile Form</text
        >
        <text class="text-[13px] text-zinc-500 mb-5"
          >Input validation with signal-based state.</text
        >

        <view class="bg-white border border-zinc-200 rounded-xl p-5 mb-5">
          <text class="text-[13px] font-semibold text-zinc-900 mb-1.5"
            >Name</text
          >
          <input
            class="px-3.5 py-3 text-[15px] bg-white rounded-lg border border-zinc-200"
            [class.border-indigo-500]="focusedField() === 'name'"
            [class.border-red-500]="submitted() && !name()"
            placeholder="Enter your name"
            [value]="name()"
            (bindinput)="name.set($any($event).detail.value)"
            (bindfocus)="focusedField.set('name')"
            (bindblur)="focusedField.set(null)"
            confirm-type="next"
          />
          @if (submitted() && !name()) {
            <text class="text-xs text-red-500 mt-1">Name is required</text>
          }

          <text class="text-[13px] font-semibold text-zinc-900 mb-1.5 mt-4"
            >Email</text
          >
          <input
            class="px-3.5 py-3 text-[15px] bg-white rounded-lg border border-zinc-200"
            [class.border-indigo-500]="focusedField() === 'email'"
            [class.border-red-500]="submitted() && !validEmail()"
            placeholder="you@example.com"
            input-type="email"
            [value]="email()"
            (bindinput)="email.set($any($event).detail.value)"
            (bindfocus)="focusedField.set('email')"
            (bindblur)="focusedField.set(null)"
            confirm-type="next"
          />
          @if (submitted() && !validEmail()) {
            <text class="text-xs text-red-500 mt-1">Enter a valid email</text>
          }

          <text class="text-[13px] font-semibold text-zinc-900 mb-1.5 mt-4"
            >Bio</text
          >
          <textarea
            class="px-3.5 py-3 text-[15px] bg-white rounded-lg border border-zinc-200 h-[100px]"
            [class.border-indigo-500]="focusedField() === 'bio'"
            placeholder="Tell us about yourself..."
            [value]="bio()"
            (bindinput)="bio.set($any($event).detail.value)"
            (bindfocus)="focusedField.set('bio')"
            (bindblur)="focusedField.set(null)"
          ></textarea>
          <text class="text-xs text-zinc-400 text-right mt-1"
            >{{ bio().length }} / 200</text
          >
        </view>

        <view
          class="bg-indigo-500 rounded-[10px] p-3.5 items-center"
          (bindtap)="submit()"
        >
          <text class="text-white text-base font-semibold">Save Profile</text>
        </view>

        @if (successMessage()) {
          <view
            class="bg-green-50 border border-green-200 rounded-xl p-3.5 mt-4 items-center"
          >
            <text class="text-sm text-green-800">{{ successMessage() }}</text>
          </view>
        }
      </view>
    </scroll-view>
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
