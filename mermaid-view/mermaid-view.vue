<script setup lang="ts" xmlns:important="http://www.w3.org/1999/xhtml">
import mermaid from 'mermaid';
import { nanoid } from 'nanoid';

function mermaidClickHandler(diagram: string, options = {}) {
  return diagram.replace(
    /^(\s*click\s+[^\s]+\s*)$/gm,
    `$1 mermaidClick_${options.id}`,
  );
}

const id = ref('');
const diagram = ref('');

const mermaidContainer = ref<HTMLElement | null>(null);
let mermaidDomId = '';

// 计算属性
const finalValue = computed(() => {
  return mermaidClickHandler(diagram.value, { id: id.value });
});

const allData = computed(() => {
  return [finalValue.value, id.value];
});

// 在组件内容被渲染到页面之后自动执行的函数
onMounted(() => {
  // 初始化 mermaid
  mermaid.initialize({
    securityLevel: 'loose', // 宽松
    startOnLoad: false,
    theme: 'default',
  });

  id.value = nanoid();
  mermaidDomId = `mermaidClick_${id.value}`;
});

// 组件卸载之前执行清理操作
onBeforeUnmount(() => {
  if (typeof window === 'undefined') {
    return;
  }
  delete (window as any)[`mermaidClick_${id.value}`];
});

// Watchers
watch(
  allData,
  async () => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!finalValue.value) {
      return;
    }

    if (!id.value) {
      return;
    }

    if (mermaidContainer.value) {
      mermaidContainer.value.removeAttribute('data-processed');
    }

    // mermaid.parseError = error => emit('parse-error', error)

    try {
      const validNodes = mermaidContainer.value ? [mermaidContainer.value] : [];
      if (validNodes.length > 0) {
        await mermaid.run({
          nodes: validNodes,
        });
      }
    }
    catch (error) {
      console.error('Mermaid parse error', error);
      // Mermaid will throw the error although the parseError function is set
    }
  },
  {
    flush: 'post',
    immediate: true,
  },
);

watch(
  id,
  (newId, previousId) => {
    if (typeof window === 'undefined') {
      return;
    }

    if (previousId) {
      delete (window as any)[`mermaidClick_${previousId}`];
    }
  },
  { immediate: true },
);

const scale = ref(1);
const transformOrigin = ref({
  x: 0,
  y: 0,
});

// 滚轮缩放处理函数
function handleWheel(event: WheelEvent) {
  event.preventDefault();

  // 记录鼠标位置作为缩放中心点
  const rect = (event.target as HTMLElement).getBoundingClientRect();
  transformOrigin.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };

  // 计算缩放比例
  const delta = event.deltaY > 0 ? -0.1 : 0.1;
  scale.value = Math.max(0.1, Math.min(3, scale.value + delta)); // 限制在0.1-3倍之间

};
</script>

<template>
  <c-card class="leftPanel" title="mermaid code">
    <c-input-text
      v-model:value="diagram"
      placeholder="Please input..."
      rows="20"
      multiline
      test-id="leftJson"
      raw-text
      monospace
    />
  </c-card>
  <c-card class="rightPanel" title="mermaid view">
<!--    <div ref="mermaidContainer"-->
<!--         @wheel.passive="handleWheel"-->
<!--         :style="{-->
<!--        transform: `scale(${scale})`,-->
<!--        transformOrigin: `${transformOrigin.x}px ${transformOrigin.y}px`,-->
<!--        transition: 'transform 0.1s ease'-->
<!--      }"-->
<!--    >-->
    <div ref="mermaidContainer" id="mermaidContainer">
      {{ finalValue }}
    </div>
  </c-card>
</template>

<style lang="less" scoped>
.leftPanel {
  flex: 0 0 22%;
  min-height: 50vh;
}

.rightPanel {
  position: relative;
  flex: 0 0 75%;
  min-height: 50vh;
}

</style>
