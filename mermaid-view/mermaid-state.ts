import type { State } from '@/tools/mermaid-view/mermaid-types';

// 数据对象
const defaultMermaidState: State = {
  /* 默认代码 */
  code: `flowchart TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[fa:fa-car Car]
  `,
  /* 是否显示网格 */
  grid: true,
  /* Mermaid配置对象，设置主题为"default" */
  mermaid: JSON.stringify({
    theme: 'default',
    error: false,
    securityLevel: 'loose',
  }, undefined, 2),
  /* 是否启用平移缩放 */
  panZoom: true,
  /* 是否使用手绘风格 */
  rough: false,
  /* 是否更新图表 */
  updateDiagram: true,
  serialized: '',
};

// 数据存储对象
const mermaidState: ReturnType<typeof useStorage<State>> = useSessionStorage('mermaid-state', defaultMermaidState);

// 更新代码
function updateCodeHandler(code: string,
  { updateDiagram = false, resetPanZoom = false }: { updateDiagram?: boolean; resetPanZoom?: boolean } = {}) {
  mermaidState.value = { ...mermaidState.value, code, updateDiagram };
}

// 更新Mermaid配置对象
function updateMermaidStateHandler(newState: Partial<State>) {
  mermaidState.value = { ...mermaidState.value, ...newState };
}

export { defaultMermaidState, mermaidState, updateCodeHandler, updateMermaidStateHandler };
