import { Component } from '@angular/core';
import { LYNX_ELEMENTS } from '@blotch/angular-lynx';
import { UiToaster, toast } from '../components/ui/toast';
import { UiButton } from '../components/ui/button';

@Component({
  selector: 'app-root',
  imports: [LYNX_ELEMENTS, UiToaster, UiButton],
  template: `
    <scroll-view scroll-orientation="vertical" class="h-full">
      <view class="flex-col gap-4 p-6 flex">
        <text class="text-2xl font-bold text-foreground">Toast</text>

        <ui-button (pressed)="showDefault()">Show Toast</ui-button>

        <ui-button variant="outline" (pressed)="showWithDescription()">
          With Description
        </ui-button>

        <ui-button variant="destructive" (pressed)="showDestructive()">
          Destructive
        </ui-button>

        <ui-button variant="secondary" (pressed)="showWithAction()">
          With Action
        </ui-button>
      </view>

      <ui-toaster />
    </scroll-view>
  `,
})
export class App {
  showDefault(): void {
    toast({ title: 'Event has been created' });
  }

  showWithDescription(): void {
    toast({
      title: 'Event has been created',
      description: 'Sunday, December 03, 2023 at 9:00 AM',
    });
  }

  showDestructive(): void {
    toast({
      title: 'Uh oh! Something went wrong.',
      description: 'There was a problem with your request.',
      variant: 'destructive',
    });
  }

  showWithAction(): void {
    toast({
      title: 'Message sent',
      description: 'Your message has been delivered.',
      action: {
        label: 'Undo',
        onAction: () => {
          toast({ title: 'Message unsent' });
        },
      },
    });
  }
}
