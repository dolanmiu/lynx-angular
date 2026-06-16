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
    <scroll-view class="page" scroll-orientation="vertical">
      <view class="container">
        <text class="title">Todos</text>
        <text class="subtitle">{{ remaining() }} remaining</text>

        <view class="input-row">
          <input
            class="input"
            placeholder="What needs to be done?"
            [value]="draft()"
            (bindinput)="onInput($event)"
          />
          <view class="add-btn" (bindtap)="addTodo()">
            <text class="add-btn-text">Add</text>
          </view>
        </view>

        @for (todo of todos(); track todo.id) {
          <view class="todo-card" (bindtap)="toggle(todo.id)">
            <view
              class="checkbox"
              [class.checkbox-done]="todo.done"
            >
              @if (todo.done) {
                <text class="check-icon">✓</text>
              }
            </view>
            <text
              class="todo-text"
              [class.todo-done]="todo.done"
            >{{ todo.text }}</text>
            <view class="delete-btn" (catchtap)="remove(todo.id)">
              <text class="delete-text">✕</text>
            </view>
          </view>
        } @empty {
          <view class="empty-card">
            <text class="empty-icon">🎉</text>
            <text class="empty-text">All done!</text>
          </view>
        }
      </view>
    </scroll-view>
  `,
  styles: `
    .page { height: 100vh; background-color: #fafafa; }
    .container { padding: 24px; }
    .title { font-size: 28px; font-weight: bold; color: #18181b; margin-bottom: 4px; }
    .subtitle { font-size: 13px; color: #71717a; margin-bottom: 20px; }
    .input-row { display: flex; flex-direction: row; gap: 8px; margin-bottom: 16px; }
    .input { flex: 1; padding: 12px 14px; font-size: 15px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 10px; }
    .add-btn { background-color: #6366f1; border-radius: 10px; padding: 12px 20px; justify-content: center; align-items: center; }
    .add-btn-text { color: white; font-size: 15px; font-weight: 600; }
    .todo-card { display: flex; flex-direction: row; align-items: center; padding: 14px 16px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; margin-bottom: 8px; }
    .checkbox { width: 22px; height: 22px; border-radius: 6px; border: 2px solid #e4e4e7; margin-right: 12px; align-items: center; justify-content: center; }
    .checkbox-done { background-color: #6366f1; border-color: #6366f1; }
    .check-icon { font-size: 13px; color: white; font-weight: bold; }
    .todo-text { flex: 1; font-size: 15px; color: #18181b; }
    .todo-done { color: #a1a1aa; text-decoration: line-through; }
    .delete-btn { padding: 4px 8px; }
    .delete-text { font-size: 16px; color: #ef4444; }
    .empty-card { background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 40px; align-items: center; }
    .empty-icon { font-size: 32px; margin-bottom: 8px; }
    .empty-text { font-size: 16px; color: #a1a1aa; }
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
