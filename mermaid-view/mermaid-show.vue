<script setup lang="ts">
import ContextMenu, { type MenuOptions } from '@imengyu/vue3-context-menu';
import type { MermaidConfig } from 'mermaid';
import { Svg2Roughjs } from 'svg2roughjs';
import { v4 as generateUuidV4 } from 'uuid';
import { NIcon } from 'naive-ui';
import { Copy, Download } from '@vicons/tabler';
import { recordRenderTime, shouldRefreshView } from '@/tools/mermaid-view/autoSync';
import { PanZoomState } from '@/tools/mermaid-view/panZoom';
import type { State } from '@/tools/mermaid-view/mermaid-types';
import { parse as parseDiagram, render as renderDiagram } from '@/tools/mermaid-view/mermaid';
import { mermaidState } from '@/tools/mermaid-view/mermaid-state';
import '@fortawesome/fontawesome-free/css/all.css';
import { onCopyPNG, onDownloadPNG } from '@/tools/mermaid-view/actions';

const props = withDefaults(defineProps<{ panZoomState?: PanZoomState }>(), { panZoomState: () => new PanZoomState() });
const panZoomState = props.panZoomState;

// 响应式数据
const code = ref('');
const config = ref('');
const view = ref<HTMLDivElement | null>(null);
const container = ref<HTMLDivElement | null>(null);
const rough = ref<boolean>(false);
const error = ref<boolean>(false);
const panZoom = ref<boolean>(true);

// 定义菜单配置
function onContextMenu(e: MouseEvent) {
  // prevent the browser's default menu
  e.preventDefault();
  // show our menu
  ContextMenu.showContextMenu({
    items: [
      {
        label: 'copy as image',
        icon: h(NIcon, {
          size: 20,
          component: Copy,
        }),
        onClick: () => { onCopyPNG(e, panZoomState); },
      },
      {
        label: 'download as image',
        icon: h(NIcon, {
          size: 20,
          component: Download,
        }),
        onClick: () => { onDownloadPNG(e, panZoomState); },
      },
    ],
    zIndex: 3,
    minWidth: 230,
    x: e.x,
    y: e.y,
  } as MenuOptions);
}

// 处理平移缩放功能的函数
// 接收当前状态state和SVG元素graphDiv作为参数
// 调用panZoomState.updateElement()方法更新元素的平移缩放状态
// 使用try-catch捕获并记录可能发生的错误
function handlePanZoom(state: State, graphDiv: SVGSVGElement) {
  try {
    panZoomState.updateElement(graphDiv, state);
  }
  catch (error) {
    console.error('PanZoom error:', error);
  }
}

// 处理状态变化并渲染图表
async function handleStateChange(state: State) {
  const startTime = Date.now();
  if (state.error !== undefined) {
    error.value = true;
    return;
  }
  error.value = false;
  let diagramType: string | undefined;

  try {
    if (container.value) {
      // Do not render if there is no change in Code/Config/PanZoom
      if (
        code.value === state.code
        && config.value === state.mermaid
        && rough.value === state.rough
        && panZoom.value === state.panZoom
      ) {
        return;
      }

      try {
        await parseDiagram(state.code);
      }
      catch (e) {
        console.error('Mermaid parse error:', e);
        error.value = true;
        return;
      }

      /**
       * 调用shouldRefreshView()函数检查是否需要刷新视图，如果返回false（不需要刷新），
       * 则直接return退出当前函数，不再执行后续代码。
       */
      if (!shouldRefreshView()) {
        return;
      }

      code.value = state.code;
      config.value = state.mermaid;
      rough.value = state.rough;
      panZoom.value = state.panZoom ?? true;

      if (/fa[blrs]?:fa-[\w-]+/g.test(state.code)) {
        // 等待FontAwesome加载完成
        await Promise.allSettled(Array.from(document.fonts, font => font.load()));
      }

      // 获取当前视图元素父容器的垂直滚动距离
      const scroll = view.value?.parentElement?.scrollTop;
      delete (container.value as any).dataset.processed;
      const viewID = `graph-${generateUuidV4()}`;

      const {
        svg,
        bindFunctions,
        diagramType: detectedDiagramType,
      } = await renderDiagram(JSON.parse(state.mermaid) as MermaidConfig, state.code, viewID);

      diagramType = detectedDiagramType;

      if (svg.length > 0) {
        // 更新容器内容
        container.value.innerHTML = svg;
        let graphDiv = document.querySelector<SVGSVGElement>(`#${viewID}`);

        if (!graphDiv) {
          throw new Error('graph-div not found');
        }
        // TODO 手绘风格
        if (state.rough) {
          const svg2roughjs = new Svg2Roughjs('#container');
          svg2roughjs.svg = graphDiv;
          await svg2roughjs.sketch();
          graphDiv.remove();
          const sketch = document.querySelector<SVGSVGElement>('#container > svg');
          if (!sketch) {
            throw new Error('sketch not found');
          }
          const height = sketch.getAttribute('height');
          const width = sketch.getAttribute('width');
          sketch.setAttribute('id', 'graph-div');
          sketch.setAttribute('height', '100%');
          sketch.setAttribute('width', '100%');
          sketch.setAttribute('viewBox', `0 0 ${width} ${height}`);
          sketch.style.maxWidth = '100%';
          graphDiv = sketch;
        }
        else {
          graphDiv.setAttribute('height', '100%');
          graphDiv.style.maxWidth = '100%';
          if (bindFunctions) {
            bindFunctions(graphDiv);
          }
        }
        // 启用平移缩放功能
        if (state.panZoom) {
          handlePanZoom(state, graphDiv);
        }
      }

      if (view.value?.parentElement && scroll) {
        view.value.parentElement.scrollTop = scroll;
      }

      error.value = false;
    }
  }
  catch (error_) {
    console.error('view fail', error_);
    error.value = true;
  }

  const renderTime = Date.now() - startTime;
  recordRenderTime(renderTime, () => {
    mermaidState.value.updateDiagram = true;
  });
}

// 监听状态变化
const pendingStateChange = ref(Promise.resolve());

watch(
  () => mermaidState.value,
  (newState) => {
    pendingStateChange.value = pendingStateChange.value
      .then(() => handleStateChange(newState))
      .catch((error) => {
        console.error('Mermaid state change error:', error);
        return Promise.resolve();
      })
    ;
  },
  {
    deep: true,
    flush: 'post',
    immediate: true,
  },
);
</script>

<template>
  <div
    id="view"
    ref="view"
    @contextmenu="onContextMenu($event)"
  >
    <div id="container" ref="container" />
  </div>
</template>

<style scoped lang="less">
/*#view {
  height: 70vh;
}*/

#container {
  height: calc(100vh - 260px);
}

.grid-bg-light {
  background-size: 30px 30px;
  background-image: radial-gradient(circle, #e4e4e48c 2px, #0000 2px);
}

.grid-bg-dark {
  background-size: 30px 30px;
  background-image: radial-gradient(circle, #46464646 2px, #0000 2px);
}
</style>
