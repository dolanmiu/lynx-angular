import { Component, computed, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { UiCheckbox } from '@blotch/ui/components/checkbox';
import { UiTabs, UiTabsList, UiTabsTrigger, UiTabsContent } from '@blotch/ui/components/tabs';
import { UiBadge } from '@blotch/ui/components/badge';
import { UiSheet, UiSheetHeader, UiSheetTitle, UiSheetFooter } from '@blotch/ui/components/sheet';
import { UiInput } from '@blotch/ui/components/input';
import { UiSelect, UiSelectItem } from '@blotch/ui/components/select';
import { UiButton } from '@blotch/ui/components/button';
import { UiLabel } from '@blotch/ui/components/label';
import { UiEmptyState } from '@blotch/ui/components/empty-state';
import {
  UiActionSheet,
  UiActionSheetTitle,
  UiActionSheetItem,
  UiActionSheetCancel,
} from '@blotch/ui/components/action-sheet';

type Priority = 'high' | 'medium' | 'low';

interface Task {
  id: number;
  title: string;
  done: boolean;
  priority: Priority;
}

@Component({
  selector: 'app-root',
  imports: [
    LYNX_ELEMENTS,
    UiCheckbox,
    UiTabs, UiTabsList, UiTabsTrigger, UiTabsContent,
    UiBadge,
    UiSheet, UiSheetHeader, UiSheetTitle, UiSheetFooter,
    UiInput, UiSelect, UiSelectItem,
    UiButton, UiLabel, UiEmptyState,
    UiActionSheet, UiActionSheetTitle, UiActionSheetItem, UiActionSheetCancel,
  ],
  template: `
    <view class="flex flex-col h-full">
      <view class="flex flex-row items-center justify-between p-4 border-b border-border">
        <text class="text-xl font-bold text-foreground">Tasks</text>
        <ui-button size="sm" (tap)="newSheetOpen.set(true)">+ New</ui-button>
      </view>

      <ui-tabs [(value)]="activeTab" class="flex-1 flex flex-col">
        <ui-tabs-list class="mx-4 mt-3">
          <ui-tabs-trigger value="all">All <ui-badge>{{ tasks().length }}</ui-badge></ui-tabs-trigger>
          <ui-tabs-trigger value="active">Active <ui-badge>{{ activeTasks().length }}</ui-badge></ui-tabs-trigger>
          <ui-tabs-trigger value="done">Done <ui-badge variant="secondary">{{ doneTasks().length }}</ui-badge></ui-tabs-trigger>
        </ui-tabs-list>

        <ui-tabs-content value="all" class="flex-1">
          <ng-container *ngTemplateOutlet="taskList; context: { tasks: tasks() }" />
        </ui-tabs-content>
        <ui-tabs-content value="active" class="flex-1">
          <ng-container *ngTemplateOutlet="taskList; context: { tasks: activeTasks() }" />
        </ui-tabs-content>
        <ui-tabs-content value="done" class="flex-1">
          <ng-container *ngTemplateOutlet="taskList; context: { tasks: doneTasks() }" />
        </ui-tabs-content>
      </ui-tabs>
    </view>

    <ng-template #taskList let-tasks="tasks">
      <scroll-view scroll-orientation="vertical" class="flex-1">
        <view class="flex flex-col gap-2 p-4">
          @if (tasks.length === 0) {
            <ui-empty-state title="No tasks" description="Tap + New to add a task." />
          }
          @for (task of tasks; track task.id) {
            <view class="flex flex-row items-center gap-3 p-3 rounded-lg border border-border bg-card"
                  (longpress)="openOptions(task)">
              <ui-checkbox [checked]="task.done" (checkedChange)="toggle(task.id)" />
              <text class="flex-1 text-sm text-foreground"
                    [class.line-through]="task.done"
                    [class.text-muted-foreground]="task.done">{{ task.title }}</text>
              <ui-badge [variant]="priorityVariant(task.priority)">{{ task.priority }}</ui-badge>
            </view>
          }
        </view>
      </scroll-view>
    </ng-template>

    <ui-sheet [(open)]="newSheetOpen">
      <ui-sheet-header><ui-sheet-title>New Task</ui-sheet-title></ui-sheet-header>
      <view class="flex flex-col gap-4 p-4">
        <view class="flex flex-col gap-1.5">
          <ui-label>Title</ui-label>
          <ui-input [(value)]="newTitle" placeholder="Task title..." />
        </view>
        <view class="flex flex-col gap-1.5">
          <ui-label>Priority</ui-label>
          <ui-select [(value)]="newPriority">
            <ui-select-item value="high">High</ui-select-item>
            <ui-select-item value="medium">Medium</ui-select-item>
            <ui-select-item value="low">Low</ui-select-item>
          </ui-select>
        </view>
      </view>
      <ui-sheet-footer>
        <ui-button variant="outline" (tap)="newSheetOpen.set(false)">Cancel</ui-button>
        <ui-button (tap)="addTask()">Add Task</ui-button>
      </ui-sheet-footer>
    </ui-sheet>

    @if (selectedTask()) {
      <ui-action-sheet [(open)]="optionsOpen">
        <ui-action-sheet-title>{{ selectedTask()!.title }}</ui-action-sheet-title>
        <ui-action-sheet-item variant="destructive" (tap)="deleteTask()">Delete</ui-action-sheet-item>
        <ui-action-sheet-cancel>Cancel</ui-action-sheet-cancel>
      </ui-action-sheet>
    }
  `,
})
export class App {
  readonly activeTab = signal('all');
  readonly newSheetOpen = signal(false);
  readonly optionsOpen = signal(false);
  readonly newTitle = signal('');
  readonly newPriority = signal<Priority>('medium');
  readonly selectedTask = signal<Task | null>(null);
  #nextId = 4;

  readonly tasks = signal<Task[]>([
    { id: 1, title: 'Set up AngularLynx project', done: true, priority: 'high' },
    { id: 2, title: 'Build settings screen', done: false, priority: 'medium' },
    { id: 3, title: 'Write unit tests', done: false, priority: 'low' },
  ]);

  readonly activeTasks = computed(() => this.tasks().filter((t) => !t.done));
  readonly doneTasks = computed(() => this.tasks().filter((t) => t.done));

  priorityVariant(p: Priority): 'destructive' | 'default' | 'secondary' {
    return p === 'high' ? 'destructive' : p === 'medium' ? 'default' : 'secondary';
  }

  toggle(id: number): void {
    this.tasks.update((list) => list.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  addTask(): void {
    const title = this.newTitle().trim();
    if (!title) return;
    this.tasks.update((list) => [...list, { id: this.#nextId++, title, done: false, priority: this.newPriority() }]);
    this.newTitle.set('');
    this.newSheetOpen.set(false);
  }

  openOptions(task: Task): void {
    this.selectedTask.set(task);
    this.optionsOpen.set(true);
  }

  deleteTask(): void {
    const id = this.selectedTask()!.id;
    this.tasks.update((list) => list.filter((t) => t.id !== id));
    this.optionsOpen.set(false);
  }
}
