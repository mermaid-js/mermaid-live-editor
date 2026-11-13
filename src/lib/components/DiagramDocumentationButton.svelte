<script lang="ts">
  import { Button } from '#lib/components/ui/button/index.js';
  import { TID } from '#lib/constants.js';
  import { getDiagramDocumentationUrl } from '#lib/util/diagramDocs.js';
  import { describeDiagram } from '#lib/util/diagramTypes.js';
  import { validatedState } from '#lib/util/state.svelte.js';
  import BookIcon from '~icons/material-symbols/book-2-outline-rounded';

  const doc = $derived.by(() => {
    const { diagramType, editorMode } = validatedState.current;
    return {
      key: describeDiagram(diagramType)?.id ?? '',
      url: getDiagramDocumentationUrl(diagramType, editorMode)
    };
  });
</script>

<Button
  variant="ghost"
  data-testid={TID.diagramDocumentationButton}
  href={doc.url}
  target="_blank"
  title="View documentation for {doc.key.replace('Diagram', '')} diagram">
  <BookIcon />
  Docs
</Button>
