import { diagramData } from '@mermaid-js/examples';
import elkLayouts from '@mermaid-js/layout-elk';
import tidyTreeLayouts from '@mermaid-js/layout-tidy-tree';
import zenuml from '@mermaid-js/mermaid-zenuml';
import type { MermaidConfig, RenderResult } from 'mermaid';
import mermaid from 'mermaid';

mermaid.registerLayoutLoaders([...elkLayouts, ...tidyTreeLayouts]);
const init = mermaid.registerExternalDiagrams([zenuml]);

export async function render(config: MermaidConfig,
  code: string,
  id: string): Promise<RenderResult> {
  await init;

  // Should be able to call this multiple times without any issues.
  mermaid.initialize(config);
  return await mermaid.render(id, code);
}

export async function parse(code: string) {
  return await mermaid.parse(code);
}

export function standardizeDiagramType(diagramType: string) {
  switch (diagramType) {
    case 'class':
    case 'classDiagram': {
      return 'classDiagram';
    }
    case 'graph':
    case 'flowchart':
    case 'flowchart-elk':
    case 'flowchart-v2': {
      return 'flowchart';
    }
    default: {
      return diagramType;
    }
  }
}

type DiagramDefinition = (typeof diagramData)[number];

function isValidDiagram(diagram: DiagramDefinition): diagram is Required<DiagramDefinition> {
  return Boolean(diagram.name && diagram.examples && diagram.examples.length > 0);
}

export function getSampleDiagrams() {
  const diagrams = diagramData
    .filter(d => isValidDiagram(d))
    .map(({
      examples,
      ...rest
    }) => ({
      ...rest,
      example: examples?.filter(({ isDefault }) => isDefault)[0],
    }));
  const examples: Record<string, string> = {};
  for (const diagram of diagrams) {
    examples[diagram.name.replace(/ (Diagram|Chart|Graph)/, '')] = diagram.example.code;
  }
  return examples;
}
