import { ArrowsShuffle } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.meraid-view.title'),
  path: '/meraid-view',
  description: translate('tools.meraid-view.description'),
  keywords: ['add', 'comma', 'quotation', 'mark'],
  component: () => import('./mermaid-view.vue'),
  icon: ArrowsShuffle,
  createdAt: new Date('2025-11-30'),
});
