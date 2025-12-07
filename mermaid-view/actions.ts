import { version as FAVersion } from '@fortawesome/fontawesome-free/package.json';
import dayjs from 'dayjs';
import { toBase64 } from 'js-base64';
import type { PanZoomState } from '@/tools/mermaid-view/panZoom';
import { mermaidState } from '@/tools/mermaid-view/mermaid-state';
import { waitForRender } from '@/tools/mermaid-view/autoSync';

type Exporter = (context: CanvasRenderingContext2D, image: HTMLImageElement) => () => void;
const FONT_AWESOME_URL = `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/${FAVersion}/css/all.min.css`;

/**
 * 获取 mermaid SVG元素
 */
function getSvgElement() {
  const svgElement = document.querySelector('#container svg')?.cloneNode(true) as HTMLElement;
  svgElement.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  return svgElement;
}
/**
 * 获取SVG的base64编码
 * @param svg
 * @param width
 * @param height
 */
function getBase64SVG(svg?: HTMLElement, width?: number, height?: number): string {
  if (svg) {
    // 防止界面的SVG尺寸被更改
    svg = svg.cloneNode(true) as HTMLElement;
  }
  if (height) {
    svg?.setAttribute('height', `${height}px`);
  }
  if (width) {
    svg?.setAttribute('width', `${width}px`);
  }
  if (!svg) {
    svg = getSvgElement();
  }

  svg.style.backgroundColor = window.getComputedStyle(document.body).getPropertyValue('--background');

  const svgString = svg.outerHTML
    .replaceAll('<br>', '<br/>')
    .replaceAll(/<img([^>]*)>/g, (m, g: string) => `<img ${g} />`);

  return toBase64(`<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet href="${FONT_AWESOME_URL}" type="text/css"?>
${svgString}`);
}

async function exportImage(event: Event, exporter: Exporter, panZoomState: PanZoomState) {
  // mermaidState.value.panZoom = false;
  panZoomState.reset();
  await new Promise(resolve => setTimeout(resolve, 1000));
  await waitForRender();
  // 创建画布
  const canvas = document.createElement('canvas');
  const svg = document.querySelector<HTMLElement>('#container svg');
  if (!svg) {
    throw new Error('svg not found');
  }

  const box = svg.getBoundingClientRect();
  const multiplier = 1;
  canvas.width = box.width * multiplier;
  canvas.height = box.height * multiplier;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('context not found');
  }

  // context.fillStyle = window.getComputedStyle(document.body).getPropertyValue('--background');
  context.fillStyle = '#FFFFFF';
  context.fillRect(0, 0, canvas.width, canvas.height);

  const image = new Image();
  image.addEventListener('load', () => {
    exporter(context, image)();
    mermaidState.value.panZoom = true;
  });
  image.src = `data:image/svg+xml;base64,${getBase64SVG(svg, canvas.width, canvas.height)}`;

  setTimeout(() => {
    if (!mermaidState.value.panZoom) {
      mermaidState.value.panZoom = true;
    }
  }, 2000);

  // 阻止事件冒泡和默认行为
  event.stopPropagation();
  event.preventDefault();
}

function simulateDownload(download: string, href: string): void {
  const a = document.createElement('a');
  a.download = download;
  a.href = href;
  a.click();
  a.remove();
}

/**
 * 生成文件名称
 * @param extension
 */
function getFileName(extension: string) {
  return `mermaid-diagram-${dayjs().format('YYYY-MM-DD-HHmmss')}.${extension}`;
}

const downloadImage: Exporter = (context, image) => {
  return () => {
    const { canvas } = context;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    simulateDownload(
      getFileName('png'),
      canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream'),
    );
  };
};

/**
 * 下载图片
 * @param event
 */
async function onDownloadPNG(event: Event, panZoomState: PanZoomState) {
  await exportImage(event, downloadImage, panZoomState);
}

async function copyImage(event: Event, exporter: Exporter, panZoomState: PanZoomState) {
  // mermaidState.value.panZoom = false;
  panZoomState.reset();
  await new Promise(resolve => setTimeout(resolve, 1000));
  await waitForRender();
  // 创建画布
  const canvas = document.createElement('canvas');
  const svg = document.querySelector<HTMLElement>('#container svg');
  if (!svg) {
    throw new Error('svg not found');
  }

  const box = svg.getBoundingClientRect();
  const multiplier = 1;
  canvas.width = box.width * multiplier;
  canvas.height = box.height * multiplier;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('context not found');
  }

  // context.fillStyle = window.getComputedStyle(document.body).getPropertyValue('--background');
  context.fillStyle = '#FFFFFF';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // 构造图片对象并转为 Blob 写入剪贴板
  const imageBlob = await new Promise<Blob>((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      try {
        context.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          }
          else {
            reject(new Error('Failed to create image blob'));
          }
        }, 'image/png');
      }
      catch (err) {
        reject(err);
      }
    };
    img.src = `data:image/svg+xml;base64,${getBase64SVG(svg, canvas.width, canvas.height)}`;
  });

  // 调用浏览器剪贴板API写入数据
  await navigator.clipboard.write([
    new ClipboardItem({ 'image/png': imageBlob }),
  ]);
  setTimeout(() => {
    if (!mermaidState.value.panZoom) {
      mermaidState.value.panZoom = true;
    }
  }, 2000);

  // 阻止事件冒泡和默认行为
  event.stopPropagation();
  event.preventDefault();
}

/**
 * 复制图片到剪贴板
 * @param event
 */
async function onCopyPNG(event: Event, panZoomState: PanZoomState) {
  await copyImage(event, downloadImage, panZoomState);
}

export {
  onDownloadPNG,
  onCopyPNG,
};
