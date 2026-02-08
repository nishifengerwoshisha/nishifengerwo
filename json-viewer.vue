<script setup lang="ts">
import JsonEditor from 'vue3-ts-jsoneditor';

const jsonData = ref({
  array: [1, 2, 3],
  boolean: true,
  Null: null,
  number: 123,
  seconds: 0,
  string: 'Hello World',
});
const cardHeight = ref(800); // 默认高度

const updateCardHeight = () => {
  const cardElement = document.getElementById('big-json-card');
  if (cardElement) {
    const headerHeight = cardElement.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    const heightTemp = windowHeight - headerHeight - 30;
    cardHeight.value = heightTemp < 500 ? 500 : heightTemp;
  }
};

onMounted(() => {
  // 初始化高度
  updateCardHeight();
  // 监听窗口大小变化
  window.addEventListener('resize', updateCardHeight);
});

onUnmounted(() => {
  // 清理事件监听器
  window.removeEventListener('resize', updateCardHeight);
});
</script>

<template>
  <c-card id="big-json-card" w-full :style="{ height: cardHeight + 'px'}" important:flex-1 important:pa-0>
    <JsonEditor
      mode="text"
      :height="cardHeight"
      v-model:json="jsonData"
    />
  </c-card>
</template>

<style lang="less" scoped>

</style>
