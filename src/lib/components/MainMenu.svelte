<script lang="ts">
  import * as Popover from '$/components/ui/popover';
  import { Switch } from '$/components/ui/switch';
  import { mode, setMode } from 'mode-watcher';
</script>

<Popover.Root>
  <Popover.Trigger class="flex items-center gap-0">
    <img class="size-6" src="./favicon.svg" alt="Mermaid Live Editor" />
  </Popover.Trigger>
  <Popover.Content align="start">
    <div class="flex flex-col">
      <div class="flex items-center justify-between">
        Dark Mode <Switch
          checked={$mode === 'dark'}
          onCheckedChange={(dark) => setMode(dark ? 'dark' : 'light')} />
      </div>
    </div>
  </Popover.Content>
</Popover.Root>
