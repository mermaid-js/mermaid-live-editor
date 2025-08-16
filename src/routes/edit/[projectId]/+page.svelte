<script lang="ts">
  import Card from '$/components/Card/Card.svelte';
  import DiagramDocButton from '$/components/DiagramDocumentationButton.svelte';
  import Editor from '$/components/Editor.svelte';
  import History from '$/components/History/History.svelte';
  import McWrapper from '$/components/McWrapper.svelte';
  import MermaidChartIcon from '$/components/MermaidChartIcon.svelte';
  import Navbar from '$/components/Navbar.svelte';
  import PanZoomToolbar from '$/components/PanZoomToolbar.svelte';
  import Preset from '$/components/Preset.svelte';
  import Share from '$/components/Share.svelte';
  import SyncRoughToolbar from '$/components/SyncRoughToolbar.svelte';
  import ThemeIcon from '$/components/ThemeIcon.svelte';
  import { Button } from '$/components/ui/button';
  import * as Resizable from '$/components/ui/resizable';
  import { Toggle } from '$/components/ui/toggle';
  import VersionSecurityToolbar from '$/components/VersionSecurityToolbar.svelte';
  import View from '$/components/View.svelte';
  import { TID } from '$/constants';
  import { getCurrentUser } from '$/firebase/firebase.client';
  import { currentUser, type UserModel } from '$/models/user.model';
  import type { EditorMode, Tab } from '$/types';
  import { PanZoomState } from '$/util/panZoom';
  import { stateStore, updateCodeStore, urlsStore } from '$/util/state';
  import { initHandler } from '$/util/util';
  import { mode, setMode } from 'mode-watcher';
  import { onMount } from 'svelte';
  import CodeIcon from '~icons/custom/code';
  import HistoryIcon from '~icons/material-symbols/history';
  import GearIcon from '~icons/material-symbols/settings-outline-rounded';
  import { get } from 'svelte/store';
  import { page } from '$app/stores';
  import { projectService } from '$/services/project.service';
  import type { ProjectModel } from '$/models/project.model';
  import Loader from '$/components/ui/Loader.svelte';
  import ErrorMessage from '$/components/ui/ErrorMessage.svelte';
  import DiagramViewer from '$/components/DiagramViewer.svelte';
  import SkeletonLoader from '$/components/ui/SkeletonLoader.svelte';
  import UserAvatarLoader from '$/components/ui/UserAvatarLoader.svelte';

  const panZoomState = new PanZoomState();

  const tabSelectHandler = (tab: Tab) => {
    const editorMode: EditorMode = tab.id === 'code' ? 'code' : 'config';
    updateCodeStore({ editorMode });
  };

  const editorTabs: Tab[] = [
    {
      icon: CodeIcon,
      id: 'code',
      title: 'Code'
    },
    {
      icon: GearIcon,
      id: 'config',
      title: 'Config'
    }
  ];

  // Dropdown state
  let isDropdownOpen = false;
  let project: ProjectModel | null = null;
  let isLoading = true;
  let loadError = false;
  let errorMessage = '';
  let projectDescription = '';
  let isInitialized = false;

  function toggleDropdown() {
    isDropdownOpen = !isDropdownOpen;
  }
  let isHistoryOpen = false;

  const handleDropdownFocusLoss = (event: FocusEvent) => {
    const target = event.currentTarget as HTMLElement;
    const relatedTarget = event.relatedTarget as HTMLElement | null;

    if (!target) return;
    if (relatedTarget && target.contains(relatedTarget)) return;

    isDropdownOpen = false;
  };

  function autoResize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
  const { projectId } = get(page).params;
  
  // Reactive statement to sync project description changes
  $: if (project && projectDescription !== project.description) {
    project.description = projectDescription;
  }
  
  async function loadProject() {
    if (!projectId) {
      loadError = true;
      errorMessage = 'Missing project ID';
      isLoading = false;
      return;
    }
    
    try {
      isLoading = true;
      loadError = false;
      const projectData = await projectService.getUserProject(projectId);
      
      if (!projectData) {
        loadError = true;
        errorMessage = "Project not found. Please verify the project ID and your permissions.";
      } else {
        project = projectData;
        projectDescription = projectData.description || '';
        // Load project data into the editor state if needed
        // You can add logic here to populate the diagram with project data
      }
    } catch (error) {
      console.error('Error loading project:', error);
      loadError = true;
      errorMessage = 'Error loading project. Please try again.';
    } finally {
      isLoading = false;
    }
  }
  
  onMount(async () => {
    try {
      await initHandler();
      const user: UserModel | null = await getCurrentUser();
      currentUser.set(user);
      
      // Load project after user is authenticated
      if (user) {
        await loadProject();
      } else {
        loadError = true;
        errorMessage = 'You must be signed in to access this project.';
        isLoading = false;
      }
    } finally {
      isInitialized = true;
    }
  });
</script>

<div class="flex h-full flex-col overflow-hidden">
  <Navbar>
    <Toggle bind:pressed={isHistoryOpen} size="sm">
      <HistoryIcon />
    </Toggle>
    <Share />
    <Button
      variant="ghost"
      size="icon"
      data-testid={TID.themeToggleButton}
      title="Switch to {$mode === 'dark' ? 'light' : 'dark'} theme"
      class="[&_svg]:size-5"
      onclick={() => setMode($mode === 'dark' ? 'light' : 'dark')}>
      <ThemeIcon />
    </Button>
    <div class="flex items-center gap-4">
      {#if $currentUser}
        <div class="dropdown relative" on:focusout={handleDropdownFocusLoss}>
          <button
            type="button"
            on:click={toggleDropdown}
            class="flex items-center focus:outline-none">
            <img
              src={$currentUser.photoURL}
              alt="Avatar"
              class="h-10 w-10 cursor-pointer rounded-full" />
          </button>

          {#if isDropdownOpen}
            <div
              class="dropdown-content absolute right-0 z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-gradient-to-r from-gray-900 to-gray-800 p-2 shadow-lg">
              <a href="/profile" class="dropdown-item block rounded-2xl p-3 hover:bg-primary"
                >Profile</a>
              <a href="/settings" class="dropdown-item block rounded-2xl p-3 hover:bg-primary"
                >Settings</a>
              <a href="/logout" class="dropdown-item block rounded-2xl p-3 hover:bg-primary"
                >Logout</a>
            </div>
          {/if}
        </div>
      {:else}
        <UserAvatarLoader size="md" />
      {/if}
      <McWrapper>
        <Button
          variant="accent"
          size="sm"
          href={$urlsStore.mermaidChart({ medium: 'save_diagram' }).save}
          target="_blank">
          <MermaidChartIcon />
          Save diagram
        </Button>
      </McWrapper>
    </div>
  </Navbar>

  <!-- Conditional rendering based on loading state -->
  {#if isLoading}
    <SkeletonLoader />
  {:else if loadError}
    <div class="flex flex-1 items-center justify-center">
      <ErrorMessage 
        title="Loading error" 
        message={errorMessage}
        showRetry={true}
        onRetry={loadProject} />
    </div>
  {:else if project}
    <div class="flex flex-1 overflow-hidden">
      <Resizable.PaneGroup direction="horizontal" autoSaveId="liveEditor" class="p-6 pt-0">
        <Resizable.Pane defaultSize={30} minSize={15} class="hidden md:block">
          <div class="flex h-full flex-col gap-6" id="editorPane">
            <Card
              onselect={tabSelectHandler}
              isOpen
              tabs={editorTabs}
              activeTabID={$stateStore.editorMode}
              isClosable={false}>
              {#snippet actions()}
                <DiagramDocButton />
              {/snippet}
              <Editor />
            </Card>

            <div class="group flex flex-wrap justify-between gap-6">
              <DiagramViewer diagram={project?.analysisResultModel?.design} />
              <div class="w-full rounded-2xl bg-gray-700 px-4 py-2">
                <textarea
                  id="projectDescription"
                  bind:value={projectDescription}
                  rows="1"
                  class="w-full resize-none overflow-y-auto bg-transparent text-lg text-gray-300 placeholder-gray-500 outline-none"
                  placeholder="Idem message"
                  on:input={autoResize}></textarea>

                <div class="mt-2 flex items-center justify-between">
                  <div class="flex space-x-2">
                    <button
                      class="flex items-center rounded-full bg-gray-600 px-3 py-1 text-gray-300 hover:bg-gray-500">
                      <i class="pi pi-brain mr-2"></i> Rephrase
                    </button>
                    <button
                      class="flex items-center rounded-full bg-blue-600 px-3 py-1 text-white hover:bg-blue-500">
                      <i class="pi pi-globe mr-2"></i> Correct
                    </button>
                  </div>

                  <div class="flex items-center space-x-3">
                    <i class="pi pi-paperclip cursor-pointer text-xl text-gray-400"></i>
                    <button
                      aria-label="send request button"
                      class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-500 text-gray-300 hover:bg-gray-400">
                      <i class="pi pi-arrow-up"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Resizable.Pane>
        <Resizable.Handle class="mr-1 opacity-0" />
        <Resizable.Pane minSize={15} class="relative flex h-full flex-1 flex-col overflow-hidden">
          <View {panZoomState} shouldShowGrid={$stateStore.grid} />
          <div class="absolute right-0 top-0"><PanZoomToolbar {panZoomState} /></div>
          <div class="absolute bottom-0 right-0"><VersionSecurityToolbar /></div>
          <div class="absolute bottom-0 left-5"><SyncRoughToolbar /></div>
          <div class="rounded bg-primary p-2 text-center shadow md:hidden">
            Code editing not supported on mobile. Please use a desktop browser.
          </div>
        </Resizable.Pane>
        {#if isHistoryOpen}
          <Resizable.Handle class="ml-1 hidden opacity-0 md:block" />
          <Resizable.Pane
            minSize={15}
            defaultSize={30}
            class="hidden h-full flex-grow flex-col md:flex">
            <History />
          </Resizable.Pane>
        {/if}
      </Resizable.PaneGroup>
    </div>
  {/if}
</div>
