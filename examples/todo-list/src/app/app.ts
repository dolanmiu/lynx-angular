import { Component, computed, signal } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';

type Todo = { id: number; text: string; done: boolean };

@Component({
  selector: 'app-root',
  imports: [LYNX_ELEMENTS],
  template: `
    <scroll-view class="h-screen bg-zinc-50" scroll-orientation="vertical">
      <view class="p-6">
        <text class="text-[28px] font-bold text-zinc-900 mb-1">Todos</text>
        <text class="text-[13px] text-zinc-500 mb-5"
          >{{ remaining() }} remaining</text
        >

        <view class="flex flex-row gap-2 mb-4">
          <input
            class="flex-1 px-3.5 py-3 text-[15px] bg-white border border-zinc-200 rounded-[10px]"
            placeholder="What needs to be done?"
            [value]="draft()"
            (bindinput)="onInput($event)"
          />
          <view
            class="bg-indigo-500 rounded-[10px] py-3 px-5 justify-center items-center"
            (bindtap)="addTodo()"
          >
            <text class="text-white text-[15px] font-semibold">Add</text>
          </view>
        </view>

        @for (todo of todos(); track todo.id) {
          <view
            class="flex flex-row items-center px-4 py-3.5 bg-white border border-zinc-200 rounded-xl mb-2"
            (bindtap)="toggle(todo.id)"
          >
            <view
              class="w-[22px] h-[22px] rounded-[6px] border-2 border-zinc-200 mr-3 items-center justify-center"
              [class.bg-indigo-500]="todo.done"
              [class.border-indigo-500]="todo.done"
            >
              @if (todo.done) {
                <text class="text-[13px] text-white font-bold">✓</text>
              }
            </view>
            <text
              class="flex-1 text-[15px] text-zinc-900"
              [class.text-zinc-400]="todo.done"
              [class.line-through]="todo.done"
              >{{ todo.text }}</text
            >
            <view class="py-1 px-2" (catchtap)="remove(todo.id)">
              <text class="text-base text-red-500">✕</text>
            </view>
          </view>
        } @empty {
          <view
            class="bg-white border border-zinc-200 rounded-xl p-10 items-center"
          >
            <text class="text-[32px] mb-2">🎉</text>
            <text class="text-base text-zinc-400">All done!</text>
          </view>
        }
      </view>
    </scroll-view>
  `,
})
export class App {
  readonly draft = signal('');
  readonly todos = signal<Todo[]>([
    { id: 1, text: 'Learn AngularLynx', done: false },
    { id: 2, text: 'Build an app', done: false },
  ]);
  #nextId = 3;

  readonly remaining = computed(
    () => this.todos().filter((t) => !t.done).length,
  );

  onInput(event: Event): void {
    this.draft.set((event as any).detail.value);
  }

  addTodo(): void {
    const text = this.draft().trim();
    if (!text) return;
    this.todos.update((list) => [
      ...list,
      { id: this.#nextId++, text, done: false },
    ]);
    this.draft.set('');
  }

  toggle(id: number): void {
    this.todos.update((list) =>
      list.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  }

  remove(id: number): void {
    this.todos.update((list) => list.filter((t) => t.id !== id));
  }
}
