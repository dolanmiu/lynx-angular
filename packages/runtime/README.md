# Angular Runtime for Lynx

> 🚧 **Work in Progress**  
> This is an early proof of concept. Only a minimal subset of Angular features is currently supported.

## Progress

### Built-in Elements

- [x] [view](https://lynxjs.org/api/elements/built-in/view.html)
- [x] [text](https://lynxjs.org/api/elements/built-in/text.html) _(basic rendering only)_
- [x] [image](https://lynxjs.org/api/elements/built-in/image.html) _(basic rendering only)_
- [x] [scroll-view](https://lynxjs.org/api/elements/built-in/scroll-view.html) _(basic rendering only)_
- [x] [list](https://lynxjs.org/api/elements/built-in/list.html) _(basic implementation, needs further development)_
- [x] [block](https://lynxjs.org/api/elements/built-in/block.html) _(basic support)_
- [x] [if](https://lynxjs.org/api/elements/built-in/if.html) _(basic support)_
- [x] [for](https://lynxjs.org/api/elements/built-in/for.html) _(basic support)_

### Styling Support

- [x] No encapsulation (global styles)
- [ ] Emulated encapsulation (Angular’s default)
- [ ] Inline styles via `style` property in `@Component` decorator

### Developer Experience (DX)

- [ ] Hot Module Replacement (HMR)
- [ ] Live reload during development
- [ ] Compiler warnings & error messages

### Motion & Animation

- [x] CSS transitions (`transition` property in stylesheets or inline styles)
- [x] CSS keyframe animations (`@keyframes` + `animation` property)
- [x] JavaScript animate API (`element.animate()`)

### Threading Model

- [ ] Support for directives running in the background thread only
- [ ] Communication between background and main thread via worklets

---

## Motion & Animation

Lynx provides three motion capabilities, all supported by this runtime.

### CSS Transitions

Set `transition` in your component stylesheet or inline styles. The native Lynx layer automatically interpolates property changes over time.

```css
.box {
  background-color: #6200ee;
  transition: background-color 0.5s ease-in-out;
}

.box-active {
  background-color: #03dac6;
}
```

```html
<view class="box" [class.box-active]="isActive()" (bindtap)="toggle()">
  <text>Tap me</text>
</view>
```

### CSS Keyframe Animations

Define `@keyframes` in your stylesheet and apply via the `animation` property or class toggle.

```css
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.spinning {
  animation: rotate 2s linear infinite;
}
```

```html
<view class="box" [class.spinning]="spin()">
  <text>Rotating</text>
</view>
```

### JavaScript Animate API

For programmatic, dynamic animations, use `element.animate()` on a native element reference. This calls the Lynx `__ElementAnimate` PAPI under the hood.

```typescript
import { Component, viewChild, type ElementRef } from '@angular/core';
import { type LynxAnimation } from '@blotch/angular-lynx';

@Component({
  selector: 'app-example',
  template: `
    <view #box class="box" (bindtap)="runAnimation()">
      <text>Tap to animate</text>
    </view>
  `,
})
export class ExampleComponent {
  boxRef = viewChild<ElementRef>('box');
  #animation: LynxAnimation | null = null;

  runAnimation(): void {
    setTimeout(() => {
      const el = this.boxRef();
      if (!el) return;

      // Cancel previous animation before starting a new one.
      this.#animation?.cancel();

      this.#animation = el.nativeElement.animate(
        [
          { transform: 'scale(1)', opacity: 1 },
          { transform: 'scale(1.3)', opacity: 0.7 },
          { transform: 'scale(1)', opacity: 1 },
        ],
        {
          duration: 600,
          easing: 'ease-in-out',
        },
      );
    }, 0);
  }
}
```

#### `animate()` API

```typescript
element.nativeElement.animate(
  keyframes: Record<string, string | number>[],
  options?: number | LynxAnimationOptions,
): LynxAnimation
```

**Parameters:**

| Parameter   | Type                                 | Description                                                               |
| ----------- | ------------------------------------ | ------------------------------------------------------------------------- |
| `keyframes` | `Record<string, string \| number>[]` | Array of keyframe objects. Each object maps CSS property names to values. |
| `options`   | `number \| LynxAnimationOptions`     | Duration in ms (shorthand) or full options object.                        |

**`LynxAnimationOptions`:**

| Option                          | Type               | Description                                                                            |
| ------------------------------- | ------------------ | -------------------------------------------------------------------------------------- |
| `duration`                      | `number \| string` | Animation duration in milliseconds.                                                    |
| `delay`                         | `number \| string` | Delay before animation starts.                                                         |
| `iterations` / `iterationCount` | `number \| string` | Number of repetitions. Use `Infinity` for infinite.                                    |
| `easing` / `timingFunction`     | `string`           | Easing function (`linear`, `ease-in`, `ease-out`, `ease-in-out`, `cubic-bezier(...)`). |
| `fill` / `fillMode`             | `string`           | How styles persist after animation (`none`, `forwards`, `backwards`, `both`).          |
| `direction`                     | `string`           | Play direction (`normal`, `reverse`, `alternate`, `alternate-reverse`).                |
| `name`                          | `string`           | Optional animation name (auto-generated if omitted).                                   |

**Returns:** `LynxAnimation` with control methods:

| Method     | Description                        |
| ---------- | ---------------------------------- |
| `play()`   | Resume a paused animation.         |
| `pause()`  | Pause the animation.               |
| `cancel()` | Cancel and clean up the animation. |

#### Animation Events

Lynx fires standard animation events on elements. Listen in templates using bind-prefixed event names:

```html
<view
  class="animated-box"
  (bindanimationend)="onAnimationEnd($event)"
  (bindtransitionend)="onTransitionEnd($event)"
>
  <text>Animated</text>
</view>
```

Available events: `animationstart`, `animationend`, `animationcancel`, `animationiteration`, `transitionstart`, `transitionend`, `transitioncancel`.

#### Important Notes

- The `animate()` API is **main-thread only**. Calling it on the background thread throws an error.
- Wrap `animate()` calls inside `setTimeout(() => { ... }, 0)` when triggered from Lynx event callbacks (same pattern as navigation) to avoid mutating the element tree inside a worklet.
