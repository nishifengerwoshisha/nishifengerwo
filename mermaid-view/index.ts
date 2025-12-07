import { ArrowsShuffle } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.mermaid-view.title'),
  path: '/mermaid-view',
  description: translate('tools.mermaid-view.description'),
  keywords: ['add', 'comma', 'quotation', 'mark'],
  component: () => import('./mermaid-view.vue'),
  icon: ArrowsShuffle,
  createdAt: new Date('2025-11-30'),
});
