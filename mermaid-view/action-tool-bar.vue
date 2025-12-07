<script setup lang="ts">
import { Download, Maximize, ZoomIn, ZoomOut } from '@vicons/tabler';
import { onDownloadPNG } from '@/tools/mermaid-view/actions';
import { PanZoomState } from '@/tools/mermaid-view/panZoom';

const props = withDefaults(defineProps<{ panZoomState?: PanZoomState }>(), { panZoomState: () => new PanZoomState() });
const panZoomState = props.panZoomState;
</script>

<template>
  <div class="bg-muted h-12 flex items-center justify-between gap-1 rounded-lg p-3" style="background-color: #F2F3F7">
    <!--    -->
    <button class="rounded-md" @click="() => panZoomState.reset()">
      <NIcon size="20" :component="Maximize" />
    </button>
    <div class="h-full w-px bg-gray-300" />
    <button class="rounded-md" @click="() => panZoomState.zoomOut()">
      <NIcon size="20" :component="ZoomOut" />
    </button>

    <button class="rounded-md" @click="() => panZoomState.zoomIn()">
      <NIcon size="20" :component="ZoomIn" />
    </button>

    <div class="h-full w-px bg-gray-300" />

    <!--    <button class="rounded-md" @click="">
      <NIcon size="20" :component="ArrowsDiagonal" />
    </button> -->

    <button class="rounded-md" @click="(event: Event) => onDownloadPNG(event, panZoomState)">
      <NIcon size="20" :component="Download" />
    </button>
  </div>
</template>

<style scoped lang="less">
button {
  display: flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: #F2F3F7;

  &:hover {
    background-color: #DFE4E8;
    cursor: pointer;
  }

  &:active {
    background-color: #DFE4E8;
  }
}
</style>
