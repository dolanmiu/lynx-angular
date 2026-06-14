import { Component, computed, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { UiInput } from '@blotch/ui/components/input';
import { UiLabel } from '@blotch/ui/components/label';
import { UiSelect, UiSelectItem } from '@blotch/ui/components/select';
import { UiRadioGroup, UiRadioGroupItem } from '@blotch/ui/components/radio-group';
import { UiCard, UiCardHeader, UiCardTitle, UiCardContent } from '@blotch/ui/components/card';
import { UiProgress } from '@blotch/ui/components/progress';
import { UiButton } from '@blotch/ui/components/button';
import { UiCheckbox } from '@blotch/ui/components/checkbox';
import { UiSeparator } from '@blotch/ui/components/separator';

@Component({
  selector: 'app-root',
  imports: [
    LYNX_ELEMENTS,
    UiInput, UiLabel,
    UiSelect, UiSelectItem,
    UiRadioGroup, UiRadioGroupItem,
    UiCard, UiCardHeader, UiCardTitle, UiCardContent,
    UiProgress, UiButton, UiCheckbox, UiSeparator,
  ],
  template: `
    <scroll-view scroll-orientation="vertical" class="h-full">
      <view class="flex flex-col gap-6 p-6">
        <view class="flex flex-col gap-2">
          <view class="flex flex-row justify-between">
            <text class="text-sm font-medium text-foreground">Step {{ step() }} of 3</text>
            <text class="text-sm text-muted-foreground">{{ stepLabel() }}</text>
          </view>
          <ui-progress [value]="progress()" />
        </view>

        @if (step() === 1) {
          <view class="flex flex-col gap-4">
            <text class="text-xl font-bold text-foreground">Shipping Address</text>
            <view class="flex flex-col gap-1.5">
              <ui-label>Full Name</ui-label>
              <ui-input [(value)]="name" placeholder="Jane Smith" />
            </view>
            <view class="flex flex-col gap-1.5">
              <ui-label>Street Address</ui-label>
              <ui-input [(value)]="street" placeholder="123 Main St" />
            </view>
            <view class="flex flex-row gap-3">
              <view class="flex flex-col gap-1.5 flex-1">
                <ui-label>City</ui-label>
                <ui-input [(value)]="city" placeholder="New York" />
              </view>
              <view class="flex flex-col gap-1.5 w-24">
                <ui-label>ZIP</ui-label>
                <ui-input [(value)]="zip" placeholder="10001" />
              </view>
            </view>
            <view class="flex flex-col gap-1.5">
              <ui-label>Country</ui-label>
              <ui-select [(value)]="country">
                <ui-select-item value="us">United States</ui-select-item>
                <ui-select-item value="ca">Canada</ui-select-item>
                <ui-select-item value="gb">United Kingdom</ui-select-item>
              </ui-select>
            </view>
          </view>
        }

        @if (step() === 2) {
          <view class="flex flex-col gap-4">
            <text class="text-xl font-bold text-foreground">Payment</text>
            <view class="flex flex-col gap-2">
              <ui-label>Payment Method</ui-label>
              <ui-radio-group [(value)]="paymentMethod">
                <view class="flex flex-col gap-2">
                  @for (opt of paymentOptions; track opt.value) {
                    <view class="flex flex-row items-center gap-2">
                      <ui-radio-group-item [value]="opt.value" [id]="opt.value" />
                      <ui-label [for]="opt.value">{{ opt.label }}</ui-label>
                    </view>
                  }
                </view>
              </ui-radio-group>
            </view>
            @if (paymentMethod() === 'card') {
              <view class="flex flex-col gap-3">
                <view class="flex flex-col gap-1.5">
                  <ui-label>Card Number</ui-label>
                  <ui-input [(value)]="cardNumber" placeholder="4242 4242 4242 4242" />
                </view>
                <view class="flex flex-row gap-3">
                  <view class="flex flex-col gap-1.5 flex-1">
                    <ui-label>Expiry</ui-label>
                    <ui-input [(value)]="expiry" placeholder="MM/YY" />
                  </view>
                  <view class="flex flex-col gap-1.5 w-24">
                    <ui-label>CVV</ui-label>
                    <ui-input [(value)]="cvv" placeholder="123" />
                  </view>
                </view>
              </view>
            }
            <view class="flex flex-row items-center gap-2">
              <ui-checkbox [(checked)]="agreeTerms" id="terms" />
              <ui-label for="terms">I agree to the Terms of Service</ui-label>
            </view>
          </view>
        }

        @if (step() === 3) {
          <view class="flex flex-col gap-4">
            <text class="text-xl font-bold text-foreground">Order Summary</text>
            <ui-card>
              <ui-card-header><ui-card-title>Items</ui-card-title></ui-card-header>
              <ui-card-content class="flex flex-col gap-2">
                <view class="flex flex-row justify-between">
                  <text class="text-sm text-foreground">AngularLynx Pro Plan</text>
                  <text class="text-sm font-medium text-foreground">$99.00</text>
                </view>
                <view class="flex flex-row justify-between">
                  <text class="text-sm text-foreground">Annual discount (20%)</text>
                  <text class="text-sm" style="color: #16a34a;">-$19.80</text>
                </view>
                <ui-separator />
                <view class="flex flex-row justify-between">
                  <text class="text-sm font-bold text-foreground">Total</text>
                  <text class="text-sm font-bold text-foreground">$79.20</text>
                </view>
              </ui-card-content>
            </ui-card>
          </view>
        }

        <view class="flex flex-row gap-3">
          @if (step() > 1) {
            <ui-button variant="outline" class="flex-1" (tap)="back()">Back</ui-button>
          }
          @if (step() < 3) {
            <ui-button class="flex-1" (tap)="next()">Continue</ui-button>
          } @else {
            <ui-button class="flex-1" (tap)="placeOrder()">Place Order</ui-button>
          }
        </view>
      </view>
    </scroll-view>
  `,
})
export class App {
  readonly step = signal(1);
  readonly name = signal('');
  readonly street = signal('');
  readonly city = signal('');
  readonly zip = signal('');
  readonly country = signal('us');
  readonly paymentMethod = signal('card');
  readonly cardNumber = signal('');
  readonly expiry = signal('');
  readonly cvv = signal('');
  readonly agreeTerms = signal(false);

  readonly paymentOptions = [
    { value: 'card', label: 'Credit / Debit Card' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'apple', label: 'Apple Pay' },
  ];

  readonly progress = computed(() => (this.step() / 3) * 100);
  readonly stepLabel = computed(() => ['Shipping', 'Payment', 'Review'][this.step() - 1]);

  next(): void { this.step.update((s) => Math.min(s + 1, 3)); }
  back(): void { this.step.update((s) => Math.max(s - 1, 1)); }
  placeOrder(): void { this.step.set(1); }
}
