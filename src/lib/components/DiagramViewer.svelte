<script lang="ts">
  import type { DiagramModel } from '$/models/diagram.model';
  import type { SectionModel } from '$/models/section.model';
  import { onMount } from 'svelte';
  import { stateStore, updateCode } from '$lib/util/state';
  import Loader from '$/components/ui/Loader.svelte';

  export let diagram: DiagramModel | undefined = undefined;
  export let selectedSection: string = '';

  let sections: SectionModel[] = [];
  let currentSection: SectionModel | undefined = undefined;

  $: if (diagram?.sections) {
    sections = diagram.sections;
    if (sections.length > 0 && !selectedSection) {
      selectedSection = sections[0].name;
    }
  }

  $: if (selectedSection && sections.length > 0) {
    currentSection = sections.find(section => section.name === selectedSection);
    if (currentSection?.data) {
      // Format the diagram data with proper mermaid syntax
      const formattedData = formatDiagramData(currentSection.data);
      // Update the editor with the selected diagram content
      updateCode(formattedData, { updateDiagram: true });
    }
  }

  function formatDiagramData(data: string): string {
    // Remove any existing backticks and trim whitespace
    let cleanData = data.replace(/^```[\s\S]*?```$/g, '').trim();
    
    // Remove "mermaid" keyword if it exists at the beginning
    if (cleanData.toLowerCase().startsWith('mermaid')) {
      cleanData = cleanData.substring(7).trim(); // Remove "mermaid" and trim
    }
    
    // Return clean data without any formatting
    return cleanData;
  }

  function selectSection(sectionName: string) {
    selectedSection = sectionName;
  }

  function getSectionDisplayName(name: string): string {
    // Use the name directly from the backend, but clean it up for display
    return name || 'Diagram';
  }

  onMount(() => {
    if (diagram?.content && !diagram?.sections?.length) {
      // Fallback for projects with content but no sections
      const formattedContent = formatDiagramData(diagram.content);
      updateCode(formattedContent, { updateDiagram: true });
    }
  });
</script>

{#if diagram}
  <div class="diagram-viewer">
    {#if sections.length > 0}
      <!-- Section tabs -->
      <div class="mb-4 border-b border-gray-200 dark:border-gray-700">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          {#each sections as section}
            <button
              on:click={() => selectSection(section.name)}
              class="whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium transition-colors
                {selectedSection === section.name
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}"
              aria-current={selectedSection === section.name ? 'page' : undefined}
            >
              {getSectionDisplayName(section.name)}
            </button>
          {/each}
        </nav>
      </div>

      <!-- Current section info -->
      {#if currentSection}
        <div class="mb-4 rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {getSectionDisplayName(currentSection.name)}
          </h3>
          {#if currentSection.summary}
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {currentSection.summary}
            </p>
          {/if}
        </div>
      {/if}
    {:else if diagram.content}
      <!-- Fallback for projects with content but no sections -->
      <div class="mb-4 rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {diagram.title || 'Project diagram'}
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Main project diagram
        </p>
      </div>
    {:else}
      <!-- No diagram data available -->
      <div class="mb-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4">
        <h3 class="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
          No diagram available
        </h3>
        <p class="text-sm text-yellow-600 dark:text-yellow-300">
          This project does not contain any diagrams yet. You can start creating one in the editor.
        </p>
      </div>
    {/if}
  </div>
{:else}
  <!-- Loading state or no diagram -->
  <div class="diagram-viewer">
    <Loader size="md" message="Loading diagrams..." />
  </div>
{/if}

<style>
  .diagram-viewer {
    width: 100%;
  }
</style>
