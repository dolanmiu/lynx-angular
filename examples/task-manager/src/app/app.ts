import { Component, computed, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { UiCheckbox } from '../components/ui/checkbox';
import { UiTabs, UiTabsList, UiTabsTrigger, UiTabsContent } from '../components/ui/tabs';
import { UiBadge } from '../components/ui/badge';
import { UiSheet, UiSheetHeader, UiSheetTitle, UiSheetFooter } from '../components/ui/sheet';
import { UiInput } from '../components/ui/input';
import { UiSelect, UiSelectItem } from '../components/ui/select';
import { UiButton } from '../components/ui/button';
import { UiLabel } from '../components/ui/label';
import { UiEmptyState } from '../components/ui/empty-state';
import {
  UiActionSheet,
  UiActionSheetTitle,
  UiActionSheetItem,
  UiActionSheetCancel,
} from '../components/ui/action-sheet';

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
    <view class="page">
      <view class="header">
        <text class="title">Tasks</text>
        <ui-button size="sm" (pressed)="newSheetOpen.set(true)">+ New</ui-button>
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
      <scroll-view scroll-orientation="vertical" class="task-scroll">
        <view class="task-list">
          @if (tasks.length === 0) {
            <ui-empty-state title="No tasks" description="Tap + New to add a task." />
          }
          @for (task of tasks; track task.id) {
            <view class="task-card" (longpress)="openOptions(task)">
              <ui-checkbox [checked]="task.done" (checkedChange)="toggle(task.id)" />
              <text class="task-title"
                    [class.task-done]="task.done">{{ task.title }}</text>
              <ui-badge [variant]="priorityVariant(task.priority)">{{ task.priority }}</ui-badge>
            </view>
          }
        </view>
      </scroll-view>
    </ng-template>

    <ui-sheet [(open)]="newSheetOpen">
      <ui-sheet-header><ui-sheet-title>New Task</ui-sheet-title></ui-sheet-header>
      <view class="sheet-form">
        <view class="field">
          <ui-label>Title</ui-label>
          <ui-input [(value)]="newTitle" placeholder="Task title..." />
        </view>
        <view class="field">
          <ui-label>Priority</ui-label>
          <ui-select [(value)]="newPriority">
            <ui-select-item value="high" label="High" />
            <ui-select-item value="medium" label="Medium" />
            <ui-select-item value="low" label="Low" />
          </ui-select>
        </view>
      </view>
      <ui-sheet-footer>
        <ui-button variant="outline" (pressed)="newSheetOpen.set(false)">Cancel</ui-button>
        <ui-button (pressed)="addTask()">Add Task</ui-button>
      </ui-sheet-footer>
    </ui-sheet>

    @if (selectedTask()) {
      <ui-action-sheet [(open)]="optionsOpen">
        <ui-action-sheet-title>{{ selectedTask()!.title }}</ui-action-sheet-title>
        <ui-action-sheet-item variant="destructive" (pressed)="deleteTask()">Delete</ui-action-sheet-item>
        <ui-action-sheet-cancel>Cancel</ui-action-sheet-cancel>
      </ui-action-sheet>
    }
  `,
  styles: `
    .page { display: flex; flex-direction: column; height: 100vh; background-color: #fafafa; }
    .header { display: flex; flex-direction: row; align-items: center; justify-content: space-between; padding: 16px 20px; background-color: #ffffff; border-bottom: 1px solid #e4e4e7; }
    .title { font-size: 22px; font-weight: bold; color: #18181b; }
    .task-scroll { flex: 1; }
    .task-list { display: flex; flex-direction: column; gap: 8px; padding: 16px; }
    .task-card { display: flex; flex-direction: row; align-items: center; gap: 12px; padding: 14px 16px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; }
    .task-title { flex: 1; font-size: 14px; color: #18181b; }
    .task-done { color: #a1a1aa; text-decoration: line-through; }
    .sheet-form { display: flex; flex-direction: column; gap: 16px; padding: 16px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
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
