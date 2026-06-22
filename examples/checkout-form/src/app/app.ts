import { Component, computed, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { UiInput } from '../components/ui/input';
import { UiLabel } from '../components/ui/label';
import { UiSelect, UiSelectItem } from '../components/ui/select';
import { UiRadioGroup, UiRadioGroupItem } from '../components/ui/radio-group';
import {
  UiCard,
  UiCardHeader,
  UiCardTitle,
  UiCardContent,
} from '../components/ui/card';
import { UiProgress } from '../components/ui/progress';
import { UiButton } from '../components/ui/button';
import { UiCheckbox } from '../components/ui/checkbox';
import { UiSeparator } from '../components/ui/separator';

@Component({
  selector: 'app-root',
  imports: [
    LYNX_ELEMENTS,
    UiInput,
    UiLabel,
    UiSelect,
    UiSelectItem,
    UiRadioGroup,
    UiRadioGroupItem,
    UiCard,
    UiCardHeader,
    UiCardTitle,
    UiCardContent,
    UiProgress,
    UiButton,
    UiCheckbox,
    UiSeparator,
  ],
  template: `
    <scroll-view scroll-orientation="vertical" class="page">
      <view class="container">
        <view class="progress-section">
          <view class="progress-labels">
            <text class="step-text">Step {{ step() }} of 3</text>
            <text class="step-label">{{ stepLabel() }}</text>
          </view>
          <ui-progress [value]="progress()" />
        </view>

        @if (step() === 1) {
          <view class="form-section">
            <text class="form-title">Shipping Address</text>
            <view class="field">
              <ui-label>Full Name</ui-label>
              <ui-input [(value)]="name" placeholder="Jane Smith" />
            </view>
            <view class="field">
              <ui-label>Street Address</ui-label>
              <ui-input [(value)]="street" placeholder="123 Main St" />
            </view>
            <view class="row">
              <view class="field row-expand">
                <ui-label>City</ui-label>
                <ui-input [(value)]="city" placeholder="New York" />
              </view>
              <view class="field zip-field">
                <ui-label>ZIP</ui-label>
                <ui-input [(value)]="zip" placeholder="10001" />
              </view>
            </view>
            <view class="field">
              <ui-label>Country</ui-label>
              <ui-select [(value)]="country">
                <ui-select-item value="us" label="United States" />
                <ui-select-item value="ca" label="Canada" />
                <ui-select-item value="gb" label="United Kingdom" />
              </ui-select>
            </view>
          </view>
        }

        @if (step() === 2) {
          <view class="form-section">
            <text class="form-title">Payment</text>
            <view class="field-lg">
              <ui-label>Payment Method</ui-label>
              <ui-radio-group [(value)]="paymentMethod">
                <view class="radio-list">
                  @for (opt of paymentOptions; track opt.value) {
                    <view class="radio-row">
                      <ui-radio-group-item
                        [value]="opt.value"
                        [id]="opt.value"
                      />
                      <ui-label>{{ opt.label }}</ui-label>
                    </view>
                  }
                </view>
              </ui-radio-group>
            </view>
            @if (paymentMethod() === 'card') {
              <view class="card-fields">
                <view class="field">
                  <ui-label>Card Number</ui-label>
                  <ui-input
                    [(value)]="cardNumber"
                    placeholder="4242 4242 4242 4242"
                  />
                </view>
                <view class="row">
                  <view class="field row-expand">
                    <ui-label>Expiry</ui-label>
                    <ui-input [(value)]="expiry" placeholder="MM/YY" />
                  </view>
                  <view class="field zip-field">
                    <ui-label>CVV</ui-label>
                    <ui-input [(value)]="cvv" placeholder="123" />
                  </view>
                </view>
              </view>
            }
            <view class="checkbox-row">
              <ui-checkbox [(checked)]="agreeTerms" id="terms" />
              <ui-label for="terms">I agree to the Terms of Service</ui-label>
            </view>
          </view>
        }

        @if (step() === 3) {
          <view class="form-section">
            <text class="form-title">Order Summary</text>
            <ui-card>
              <ui-card-header
                ><ui-card-title>Items</ui-card-title></ui-card-header
              >
              <ui-card-content>
                <view class="summary-rows">
                  <view class="summary-row">
                    <text class="summary-label">AngularLynx Pro Plan</text>
                    <text class="summary-value">$99.00</text>
                  </view>
                  <view class="summary-row">
                    <text class="summary-label">Annual discount (20%)</text>
                    <text class="discount-value">-$19.80</text>
                  </view>
                  <ui-separator />
                  <view class="summary-row">
                    <text class="total-label">Total</text>
                    <text class="total-value">$79.20</text>
                  </view>
                </view>
              </ui-card-content>
            </ui-card>
          </view>
        }

        <view class="button-row">
          @if (step() > 1) {
            <ui-button variant="outline" class="flex-1" (pressed)="back()"
              >Back</ui-button
            >
          }
          @if (step() < 3) {
            <ui-button class="flex-1" (pressed)="next()">Continue</ui-button>
          } @else {
            <ui-button class="flex-1" (pressed)="placeOrder()"
              >Place Order</ui-button
            >
          }
        </view>
      </view>
    </scroll-view>
  `,
  styles: `
    .page {
      height: 100vh;
      background-color: #fafafa;
    }
    .container {
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding: 24px;
    }
    .progress-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .progress-labels {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
    .step-text {
      font-size: 14px;
      font-weight: 500;
      color: #18181b;
    }
    .step-label {
      font-size: 14px;
      color: #71717a;
    }
    .form-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .form-title {
      font-size: 22px;
      font-weight: bold;
      color: #18181b;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .field-lg {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .row {
      display: flex;
      flex-direction: row;
      gap: 12px;
    }
    .row-expand {
      flex: 1;
    }
    .zip-field {
      width: 96px;
    }
    .radio-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .radio-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background-color: #ffffff;
      border: 1px solid #e4e4e7;
      border-radius: 12px;
    }
    .card-fields {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .checkbox-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 10px;
    }
    .summary-rows {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .summary-row {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
    .summary-label {
      font-size: 14px;
      color: #18181b;
    }
    .summary-value {
      font-size: 14px;
      font-weight: 500;
      color: #18181b;
    }
    .discount-value {
      font-size: 14px;
      color: #16a34a;
    }
    .total-label {
      font-size: 14px;
      font-weight: bold;
      color: #18181b;
    }
    .total-value {
      font-size: 14px;
      font-weight: bold;
      color: #18181b;
    }
    .button-row {
      display: flex;
      flex-direction: row;
      gap: 12px;
    }
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
  readonly stepLabel = computed(
    () => ['Shipping', 'Payment', 'Review'][this.step() - 1],
  );

  next(): void {
    this.step.update((s) => Math.min(s + 1, 3));
  }
  back(): void {
    this.step.update((s) => Math.max(s - 1, 1));
  }
  placeOrder(): void {
    this.step.set(1);
  }
}
