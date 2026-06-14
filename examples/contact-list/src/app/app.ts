import { Component, computed, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { UiAvatar } from '@blotch/ui/components/avatar';
import { UiInput } from '@blotch/ui/components/input';
import { UiSeparator } from '@blotch/ui/components/separator';
import { UiDialog, UiDialogHeader, UiDialogTitle, UiDialogFooter } from '@blotch/ui/components/dialog';
import {
  UiAlertDialog,
  UiAlertDialogHeader,
  UiAlertDialogTitle,
  UiAlertDialogDescription,
  UiAlertDialogFooter,
} from '@blotch/ui/components/alert-dialog';
import { UiButton } from '@blotch/ui/components/button';
import { UiEmptyState } from '@blotch/ui/components/empty-state';
import { UiLabel } from '@blotch/ui/components/label';

interface Contact {
  id: number;
  name: string;
  phone: string;
  email: string;
}

@Component({
  selector: 'app-root',
  imports: [
    LYNX_ELEMENTS,
    UiAvatar, UiInput, UiSeparator,
    UiDialog, UiDialogHeader, UiDialogTitle, UiDialogFooter,
    UiAlertDialog, UiAlertDialogHeader, UiAlertDialogTitle,
    UiAlertDialogDescription, UiAlertDialogFooter,
    UiButton, UiEmptyState, UiLabel,
  ],
  template: `
    <view class="flex flex-col h-full">
      <view class="flex flex-row items-center justify-between p-4 border-b border-border">
        <text class="text-xl font-bold text-foreground">Contacts</text>
        <ui-button size="sm" (tap)="openAdd()">+ Add</ui-button>
      </view>

      <view class="px-4 pt-3 pb-2">
        <ui-input [value]="query()" (valueChange)="query.set($event)" placeholder="Search contacts..." />
      </view>

      <scroll-view scroll-orientation="vertical" class="flex-1">
        @if (grouped().length === 0) {
          <view class="p-6">
            <ui-empty-state title="No contacts" description="Add your first contact above." />
          </view>
        }
        @for (group of grouped(); track group.letter) {
          <view class="flex flex-col">
            <view class="px-4 py-1 bg-muted">
              <text class="text-xs font-bold text-muted-foreground">{{ group.letter }}</text>
            </view>
            @for (contact of group.contacts; track contact.id; let last = $last) {
              <view class="flex flex-row items-center gap-3 px-4 py-3" (bindtap)="viewContact(contact)">
                <ui-avatar size="sm" src="" [fallback]="initials(contact.name)" />
                <view class="flex flex-col gap-0.5 flex-1">
                  <text class="text-sm font-medium text-foreground">{{ contact.name }}</text>
                  <text class="text-xs text-muted-foreground">{{ contact.phone }}</text>
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
          <view class="flex flex-col items-center gap-2 pb-2">
            <ui-avatar size="lg" src="" [fallback]="initials(selected()!.name)" />
            <ui-dialog-title>{{ selected()!.name }}</ui-dialog-title>
          </view>
        </ui-dialog-header>
        <view class="flex flex-col gap-3 p-4">
          <view class="flex flex-col gap-0.5">
            <text class="text-xs text-muted-foreground">Phone</text>
            <text class="text-sm text-foreground">{{ selected()!.phone }}</text>
          </view>
          <view class="flex flex-col gap-0.5">
            <text class="text-xs text-muted-foreground">Email</text>
            <text class="text-sm text-foreground">{{ selected()!.email }}</text>
          </view>
        </view>
        <ui-dialog-footer>
          <ui-button variant="destructive" (tap)="confirmDelete()">Delete</ui-button>
          <ui-button (tap)="viewOpen.set(false)">Close</ui-button>
        </ui-dialog-footer>
      </ui-dialog>
    }

    <ui-dialog [(open)]="addOpen">
      <ui-dialog-header><ui-dialog-title>New Contact</ui-dialog-title></ui-dialog-header>
      <view class="flex flex-col gap-3 p-4">
        <view class="flex flex-col gap-1.5">
          <ui-label>Name</ui-label>
          <ui-input [(value)]="newName" placeholder="Full name" />
        </view>
        <view class="flex flex-col gap-1.5">
          <ui-label>Phone</ui-label>
          <ui-input [(value)]="newPhone" placeholder="+1 555 0100" />
        </view>
        <view class="flex flex-col gap-1.5">
          <ui-label>Email</ui-label>
          <ui-input [(value)]="newEmail" placeholder="name@example.com" />
        </view>
      </view>
      <ui-dialog-footer>
        <ui-button variant="outline" (tap)="addOpen.set(false)">Cancel</ui-button>
        <ui-button (tap)="addContact()">Save</ui-button>
      </ui-dialog-footer>
    </ui-dialog>

    <ui-alert-dialog [(open)]="deleteOpen">
      <ui-alert-dialog-header>
        <ui-alert-dialog-title>Delete Contact</ui-alert-dialog-title>
        <ui-alert-dialog-description>
          Remove {{ selected()?.name }} from your contacts? This cannot be undone.
        </ui-alert-dialog-description>
      </ui-alert-dialog-header>
      <ui-alert-dialog-footer>
        <ui-button variant="outline" (tap)="deleteOpen.set(false)">Cancel</ui-button>
        <ui-button variant="destructive" (tap)="deleteContact()">Delete</ui-button>
      </ui-alert-dialog-footer>
    </ui-alert-dialog>
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
    { id: 1, name: 'Alice Chen', phone: '+1 555 0101', email: 'alice@example.com' },
    { id: 2, name: 'Bob Martinez', phone: '+1 555 0102', email: 'bob@example.com' },
    { id: 3, name: 'Carol White', phone: '+1 555 0103', email: 'carol@example.com' },
    { id: 4, name: 'David Kim', phone: '+1 555 0104', email: 'david@example.com' },
    { id: 5, name: 'Eva Lopez', phone: '+1 555 0105', email: 'eva@example.com' },
  ]);

  readonly filtered = computed(() => {
    const q = this.query().toLowerCase();
    if (!q) return this.contacts();
    return this.contacts().filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q));
  });

  readonly grouped = computed(() => {
    const sorted = [...this.filtered()].sort((a, b) => a.name.localeCompare(b.name));
    const map = new Map<string, Contact[]>();
    for (const c of sorted) {
      const letter = c.name[0].toUpperCase();
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(c);
    }
    return Array.from(map.entries()).map(([letter, contacts]) => ({ letter, contacts }));
  });

  initials(name: string): string {
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  }

  viewContact(c: Contact): void { this.selected.set(c); this.viewOpen.set(true); }

  openAdd(): void {
    this.newName.set(''); this.newPhone.set(''); this.newEmail.set('');
    this.addOpen.set(true);
  }

  addContact(): void {
    const name = this.newName().trim();
    if (!name) return;
    this.contacts.update((list) => [...list, { id: this.#nextId++, name, phone: this.newPhone(), email: this.newEmail() }]);
    this.addOpen.set(false);
  }

  confirmDelete(): void { this.viewOpen.set(false); this.deleteOpen.set(true); }

  deleteContact(): void {
    const id = this.selected()!.id;
    this.contacts.update((list) => list.filter((c) => c.id !== id));
    this.selected.set(null);
    this.deleteOpen.set(false);
  }
}
