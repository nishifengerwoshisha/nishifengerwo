import { debounce } from 'lodash-es';

let shouldSync = true;
let updater: () => void;
let renderPromise: Promise<void> | undefined;
let resolveRenderPromise: (() => void) | undefined;
const renderDelay = 1000;
const slowRenderThreshold = 150;

const debouncedRender = debounce(() => {
  shouldSync = true;
  updater();
}, renderDelay);

export function recordRenderTime(renderTimeMs: number, updaterFunction: () => void): void {
  resolveRenderPromise?.();
  updater = updaterFunction;
  // 如果渲染时间超过阈值150毫秒，则认为是慢渲染
  const isSlow = renderTimeMs > slowRenderThreshold;
  if (!shouldSync) {
    debouncedRender();
  }
  shouldSync = !isSlow;
}

/**
 * 检测是否要刷新视图
 */
export function shouldRefreshView(): boolean {
  // renderPromise用于控制渲染时机，避免重复触发
  // 如果renderPromise不存在，则创建一个新的Promise
  // Promise内部保存了resolveRenderPromise回调函数
  // 调用resolveRenderPromise会清空renderPromise并resolve掉这个promise
  // 这样可以确保在某个时机只执行一次渲染操作
  if (!renderPromise) {
    renderPromise = new Promise((resolve) => {
      resolveRenderPromise = () => {
        renderPromise = undefined;
        resolve();
      };
    });
  }

  if (!shouldSync) {
    debouncedRender();
  }
  return shouldSync;
}

export function waitForRender(): Promise<void> {
  return renderPromise ?? Promise.resolve();
}
