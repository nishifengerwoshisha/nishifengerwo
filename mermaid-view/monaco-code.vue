<script setup lang="ts">
import * as monaco from 'monaco-editor';
import { initEditor } from '@/tools/mermaid-view/monacoExtra';
import { mermaidState, updateCodeHandler } from '@/tools/mermaid-view/mermaid-state';

// 代码编辑器dom
const editorContainer = ref<HTMLElement | null>(null);

// monaco编辑器实例
let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null;
let resizeObserver: ResizeObserver | null = null;

// 组件挂载时创建编辑器
onMounted(() => {
  if (editorContainer.value) {
    // 初始化配置mermaid相关的 monaco编辑器 配置
    initEditor(monaco);
    // 创建monaco编辑器实例
    editorInstance = monaco.editor.create(editorContainer.value, {
      value: mermaidState.value.code || '',
      language: 'mermaid',
      theme: 'mermaid',
      fontSize: 14,
      minimap: { enabled: false }, // 禁用代码缩略图功能
      automaticLayout: true, // 启用自动布局调整
      overviewRulerLanes: 0,
    });

    let currentText = '';
    // 监听编辑器内容变化事件
    editorInstance.onDidChangeModelContent(({ isFlush }) => {
      const newText = editorInstance?.getValue();
      if (!newText || currentText === newText || isFlush) {
        return;
      }
      currentText = newText;
      updateCodeHandler(newText);
    });

    // 监听编辑器尺寸变化
    resizeObserver = new ResizeObserver((entries) => {
      editorInstance?.layout({
        height: entries[0].contentRect.height,
        width: entries[0].contentRect.width,
      });
    });
    if (editorContainer.value.parentElement) {
      resizeObserver.observe(editorContainer.value);
    }
  }
});

// 组件卸载前销毁编辑器
onBeforeUnmount(() => {
  if (editorInstance) {
    editorInstance.dispose();
  }
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>

<template>
  <div id="editorContainer" ref="editorContainer" />
</template>

<style scoped lang="less">
#editorContainer {
  height: calc(100vh - 300px);
  overflow: hidden;
}
</style>
