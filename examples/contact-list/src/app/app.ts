import { Component, computed, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { UiAvatar } from '../components/ui/avatar';
import { UiInput } from '../components/ui/input';
import { UiSeparator } from '../components/ui/separator';
import {
  UiDialog,
  UiDialogHeader,
  UiDialogTitle,
  UiDialogFooter,
} from '../components/ui/dialog';
import {
  UiAlertDialog,
  UiAlertDialogHeader,
  UiAlertDialogTitle,
  UiAlertDialogDescription,
  UiAlertDialogFooter,
} from '../components/ui/alert-dialog';
import { UiButton } from '../components/ui/button';
import { UiEmptyState } from '../components/ui/empty-state';
import { UiLabel } from '../components/ui/label';

type Contact = {
  id: number;
  name: string;
  phone: string;
  email: string;
};

@Component({
  selector: 'app-root',
  imports: [
    LYNX_ELEMENTS,
    UiAvatar,
    UiInput,
    UiSeparator,
    UiDialog,
    UiDialogHeader,
    UiDialogTitle,
    UiDialogFooter,
    UiAlertDialog,
    UiAlertDialogHeader,
    UiAlertDialogTitle,
    UiAlertDialogDescription,
    UiAlertDialogFooter,
    UiButton,
    UiEmptyState,
    UiLabel,
  ],
  template: `
    <view class="page">
      <view class="header">
        <text class="title">Contacts</text>
        <ui-button size="sm" (pressed)="openAdd()">+ Add</ui-button>
      </view>

      <view class="search-bar">
        <ui-input
          [value]="query()"
          (valueChange)="query.set($event)"
          placeholder="Search contacts..."
        />
      </view>

      <scroll-view scroll-orientation="vertical" class="list">
        @if (grouped().length === 0) {
          <view class="empty-container">
            <ui-empty-state
              title="No contacts"
              description="Add your first contact above."
            />
          </view>
        }
        @for (group of grouped(); track group.letter) {
          <view class="group">
            <view class="section-header">
              <text class="section-letter">{{ group.letter }}</text>
            </view>
            @for (
              contact of group.contacts;
              track contact.id;
              let last = $last
            ) {
              <view class="contact-row" (bindtap)="viewContact(contact)">
                <ui-avatar
                  size="sm"
                  src=""
                  [fallback]="initials(contact.name)"
                />
                <view class="contact-info">
                  <text class="contact-name">{{ contact.name }}</text>
                  <text class="contact-phone">{{ contact.phone }}</text>
                </view>
              </view>
              @if (!last) {
                <ui-separator class="ml-16" />
              }
            }
          </view>
        }
      </scroll-view>
    </view>

    @if (selected()) {
      <ui-dialog [(open)]="viewOpen">
        <ui-dialog-header>
          <view class="dialog-profile">
            <ui-avatar
              size="lg"
              src=""
              [fallback]="initials(selected()!.name)"
            />
            <ui-dialog-title>{{ selected()!.name }}</ui-dialog-title>
          </view>
        </ui-dialog-header>
        <view class="dialog-details">
          <view class="detail-field">
            <text class="detail-label">Phone</text>
            <text class="detail-value">{{ selected()!.phone }}</text>
          </view>
          <view class="detail-field">
            <text class="detail-label">Email</text>
            <text class="detail-value">{{ selected()!.email }}</text>
          </view>
        </view>
        <ui-dialog-footer>
          <ui-button variant="destructive" (pressed)="confirmDelete()"
            >Delete</ui-button
          >
          <ui-button (pressed)="viewOpen.set(false)">Close</ui-button>
        </ui-dialog-footer>
      </ui-dialog>
    }

    <ui-dialog [(open)]="addOpen">
      <ui-dialog-header
        ><ui-dialog-title>New Contact</ui-dialog-title></ui-dialog-header
      >
      <view class="dialog-form">
        <view class="field">
          <ui-label>Name</ui-label>
          <ui-input [(value)]="newName" placeholder="Full name" />
        </view>
        <view class="field">
          <ui-label>Phone</ui-label>
          <ui-input [(value)]="newPhone" placeholder="+1 555 0100" />
        </view>
        <view class="field">
          <ui-label>Email</ui-label>
          <ui-input [(value)]="newEmail" placeholder="name@example.com" />
        </view>
      </view>
      <ui-dialog-footer>
        <ui-button variant="outline" (pressed)="addOpen.set(false)"
          >Cancel</ui-button
        >
        <ui-button (pressed)="addContact()">Save</ui-button>
      </ui-dialog-footer>
    </ui-dialog>

    <ui-alert-dialog [(open)]="deleteOpen">
      <ui-alert-dialog-header>
        <ui-alert-dialog-title>Delete Contact</ui-alert-dialog-title>
        <ui-alert-dialog-description>
          Remove {{ selected()?.name }} from your contacts? This cannot be
          undone.
        </ui-alert-dialog-description>
      </ui-alert-dialog-header>
      <ui-alert-dialog-footer>
        <ui-button variant="outline" (pressed)="deleteOpen.set(false)"
          >Cancel</ui-button
        >
        <ui-button variant="destructive" (pressed)="deleteContact()"
          >Delete</ui-button
        >
      </ui-alert-dialog-footer>
    </ui-alert-dialog>
  `,
  styles: `
    .page {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background-color: #fafafa;
    }
    .header {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background-color: #ffffff;
      border-bottom: 1px solid #e4e4e7;
    }
    .title {
      font-size: 22px;
      font-weight: bold;
      color: #18181b;
    }
    .search-bar {
      padding: 12px 16px 8px 16px;
    }
    .list {
      flex: 1;
    }
    .empty-container {
      padding: 24px;
    }
    .group {
      display: flex;
      flex-direction: column;
    }
    .section-header {
      padding: 6px 16px;
      background-color: #f4f4f5;
    }
    .section-letter {
      font-size: 12px;
      font-weight: bold;
      color: #a1a1aa;
    }
    .contact-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
    }
    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
    }
    .contact-name {
      font-size: 15px;
      font-weight: 500;
      color: #18181b;
    }
    .contact-phone {
      font-size: 12px;
      color: #a1a1aa;
    }
    .dialog-profile {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding-bottom: 8px;
    }
    .dialog-details {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 16px;
    }
    .detail-field {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .detail-label {
      font-size: 12px;
      color: #a1a1aa;
    }
    .detail-value {
      font-size: 14px;
      color: #18181b;
    }
    .dialog-form {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 16px;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
  `,
})
export class App {
  readonly query = signal('');
  readonly viewOpen = signal(false);
  readonly addOpen = signal(false);
  readonly deleteOpen = signal(false);
  readonly selected = signal<Contact | null>(null);
  readonly newName = signal('');
  readonly newPhone = signal('');
  readonly newEmail = signal('');
  #nextId = 6;

  readonly contacts = signal<Contact[]>([
    {
      id: 1,
      name: 'Alice Chen',
      phone: '+1 555 0101',
      email: 'alice@example.com',
    },
    {
      id: 2,
      name: 'Bob Martinez',
      phone: '+1 555 0102',
      email: 'bob@example.com',
    },
    {
      id: 3,
      name: 'Carol White',
      phone: '+1 555 0103',
      email: 'carol@example.com',
    },
    {
      id: 4,
      name: 'David Kim',
      phone: '+1 555 0104',
      email: 'david@example.com',
    },
    {
      id: 5,
      name: 'Eva Lopez',
      phone: '+1 555 0105',
      email: 'eva@example.com',
    },
  ]);

  readonly filtered = computed(() => {
    const q = this.query().toLowerCase();
    if (!q) return this.contacts();
    return this.contacts().filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q),
    );
  });

  readonly grouped = computed(() => {
    const sorted = [...this.filtered()].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    const map = new Map<string, Contact[]>();
    for (const c of sorted) {
      const letter = c.name[0].toUpperCase();
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(c);
    }
    return Array.from(map.entries()).map(([letter, contacts]) => ({
      letter,
      contacts,
    }));
  });

  initials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  viewContact(c: Contact): void {
    this.selected.set(c);
    this.viewOpen.set(true);
  }

  openAdd(): void {
    this.newName.set('');
    this.newPhone.set('');
    this.newEmail.set('');
    this.addOpen.set(true);
  }

  addContact(): void {
    const name = this.newName().trim();
    if (!name) return;
    this.contacts.update((list) => [
      ...list,
      {
        id: this.#nextId++,
        name,
        phone: this.newPhone(),
        email: this.newEmail(),
      },
    ]);
    this.addOpen.set(false);
  }

  confirmDelete(): void {
    this.viewOpen.set(false);
    this.deleteOpen.set(true);
  }

  deleteContact(): void {
    const id = this.selected()!.id;
    this.contacts.update((list) => list.filter((c) => c.id !== id));
    this.selected.set(null);
    this.deleteOpen.set(false);
  }
}
