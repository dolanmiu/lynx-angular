import { Component, computed, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

@Component({
  selector: 'app-root',
  imports: [LYNX_ELEMENTS],
  template: `
    <scroll-view class="container" scroll-orientation="vertical">
      <text class="title">Todos</text>
      <text class="subtitle">{{ remaining() }} remaining</text>

      <view class="input-row">
        <input
          class="input"
          placeholder="What needs to be done?"
          [value]="draft()"
          (bindinput)="onInput($event)"
        />
        <view class="add-button" (bindtap)="addTodo()">
          <text class="add-text">Add</text>
        </view>
      </view>

      @for (todo of todos(); track todo.id) {
        <view class="todo-row" (bindtap)="toggle(todo.id)">
          <text class="checkbox">{{ todo.done ? '✓' : '○' }}</text>
          <text
            class="todo-text"
            [style.color]="todo.done ? '#a0aec0' : '#1a202c'"
            [style.text-decoration]="todo.done ? 'line-through' : 'none'"
          >{{ todo.text }}</text>
          <view class="delete-button" (catchtap)="remove(todo.id)">
            <text class="delete-text">✕</text>
          </view>
        </view>
      } @empty {
        <view class="empty-state">
          <text class="empty-text">All done!</text>
        </view>
      }
    </scroll-view>
  `,
  styles: `
    .container { height: 100vh; padding: 24px 16px; background-color: #f7fafc; }
    .title { font-size: 32px; font-weight: bold; color: #1a202c; }
    .subtitle { font-size: 14px; color: #718096; margin-bottom: 16px; }
    .input-row { display: flex; flex-direction: row; gap: 8px; margin-bottom: 16px; }
    .input { flex: 1; padding: 12px; font-size: 16px; background-color: white; border-radius: 8px; }
    .add-button { background-color: #38a169; border-radius: 8px; padding: 12px 20px; justify-content: center; }
    .add-text { color: white; font-size: 16px; font-weight: bold; }
    .todo-row { display: flex; flex-direction: row; align-items: center; padding: 14px 12px; background-color: white; border-radius: 8px; margin-bottom: 8px; }
    .checkbox { font-size: 20px; color: #38a169; margin-right: 12px; width: 24px; }
    .todo-text { flex: 1; font-size: 16px; }
    .delete-button { padding: 4px 8px; }
    .delete-text { font-size: 18px; color: #e53e3e; }
    .empty-state { padding: 40px; align-items: center; }
    .empty-text { font-size: 18px; color: #a0aec0; }
  `,
})
export class App {
  readonly draft = signal('');
  readonly todos = signal<Todo[]>([
    { id: 1, text: 'Learn AngularLynx', done: false },
    { id: 2, text: 'Build an app', done: false },
  ]);
  #nextId = 3;

  readonly remaining = computed(() => this.todos().filter((t) => !t.done).length);

  onInput(event: Event): void {
    this.draft.set((event as any).detail.value);
  }

  addTodo(): void {
    const text = this.draft().trim();
    if (!text) return;
    this.todos.update((list) => [...list, { id: this.#nextId++, text, done: false }]);
    this.draft.set('');
  }

  toggle(id: number): void {
    this.todos.update((list) => list.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  remove(id: number): void {
    this.todos.update((list) => list.filter((t) => t.id !== id));
  }
}
