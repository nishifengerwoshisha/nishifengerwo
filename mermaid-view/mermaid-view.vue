<script setup lang="ts" xmlns:important="http://www.w3.org/1999/xhtml">
import { Pane, Splitpanes } from 'splitpanes';
import { PanZoomState } from '@/tools/mermaid-view/panZoom';
import MonacoCode from '@/tools/mermaid-view/monaco-code.vue';
import MermaidShow from '@/tools/mermaid-view/mermaid-show.vue';
import 'splitpanes/dist/splitpanes.css';

// 管理平移和缩放状态
const panZoomState = new PanZoomState();
</script>

<template>
  <Splitpanes class="default-theme h-full" style="flex: 0 0 100%;">
    <Pane id="leftPane" min-size="15" size="30" class="h-full">
      <div class="flex items-center p-2 space-x-2" style="background-color: #E1E5E9">
        <icon-mdi-code />
        <span>代码编辑器</span>
      </div>
      <MonacoCode />
    </Pane>

    <Pane id="rightPane" min-size="15" size="70" class="h-full" style="background-color: white">
      <div class="absolute right-10 top-60">
        <ActionToolBar :pan-zoom-state="panZoomState" />
      </div>
      <MermaidShow :pan-zoom-state="panZoomState" class="h-full" />
    </Pane>
  </Splitpanes>
</template>

<style lang="less" scoped>
#leftPane {
  border-radius: 10px;
}

#rightPane {
  border-radius: 10px;
}

:deep(.splitpanes__splitter) {
  background-color: #F1F5F9 !important;
}
</style>
