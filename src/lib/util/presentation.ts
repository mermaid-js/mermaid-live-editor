import type { MermaidConfig } from 'mermaid';

export const layoutOptions = ['default', 'dagre', 'elk', 'elk.stress', 'elk.force'] as const;
export type LayoutOption = (typeof layoutOptions)[number];

export const lookOptions = ['default', 'classic', 'handDrawn', 'neo'] as const;
export type LookOption = (typeof lookOptions)[number];

export interface PresentationSettings {
  handDrawnSeed?: number;
  layout: LayoutOption;
  look: LookOption;
}

export interface AccessibilityMetadata {
  description: string;
  title: string;
}

const formatJSON = (data: unknown): string => JSON.stringify(data, undefined, 2);

const accessibilityPatterns = {
  description: /^(\s*)accDescr\s*:\s*(.*)$/im,
  title: /^(\s*)accTitle\s*:\s*(.*)$/im
};

export const getPresentationSettings = (config: string): PresentationSettings => {
  const mermaidConfig = JSON.parse(config) as MermaidConfig;
  return {
    handDrawnSeed: mermaidConfig.handDrawnSeed,
    layout: layoutOptions.includes(mermaidConfig.layout as LayoutOption)
      ? (mermaidConfig.layout as LayoutOption)
      : 'default',
    look: lookOptions.includes(mermaidConfig.look as LookOption)
      ? (mermaidConfig.look as LookOption)
      : 'default'
  };
};

export const updatePresentationConfig = (
  config: string,
  settings: PresentationSettings
): string => {
  const mermaidConfig = JSON.parse(config) as MermaidConfig;

  if (settings.layout === 'default') {
    delete mermaidConfig.layout;
  } else {
    mermaidConfig.layout = settings.layout;
  }

  if (settings.look === 'default') {
    delete mermaidConfig.look;
  } else {
    mermaidConfig.look = settings.look;
  }

  if (settings.look === 'handDrawn' && settings.handDrawnSeed !== undefined) {
    mermaidConfig.handDrawnSeed = settings.handDrawnSeed;
  } else {
    delete mermaidConfig.handDrawnSeed;
  }

  return formatJSON(mermaidConfig);
};

export const getAccessibilityMetadata = (code: string): AccessibilityMetadata => ({
  description: code.match(accessibilityPatterns.description)?.[2]?.trim() ?? '',
  title: code.match(accessibilityPatterns.title)?.[2]?.trim() ?? ''
});

const findMetadataInsertLine = (lines: string[]): number => {
  let index = 0;
  if (lines[index]?.trim() === '---') {
    index++;
    while (index < lines.length && lines[index].trim() !== '---') {
      index++;
    }
    if (index < lines.length) {
      index++;
    }
  }

  while (
    index < lines.length &&
    (lines[index].trim() === '' || lines[index].trim().startsWith('%%'))
  ) {
    index++;
  }

  return Math.min(index + 1, lines.length);
};

const setAccessibilityLine = (
  code: string,
  key: 'description' | 'title',
  value: string
): string => {
  const directive = key === 'title' ? 'accTitle' : 'accDescr';
  const pattern = accessibilityPatterns[key];

  if (pattern.test(code)) {
    return value.trim()
      ? code.replace(pattern, `$1${directive}: ${value.trim()}`)
      : code
          .replace(new RegExp(`^\\s*${directive}\\s*:\\s*.*(?:\\r?\\n)?`, 'im'), '')
          .replace(/\n{3,}/g, '\n\n')
          .trimEnd();
  }

  if (!value.trim()) {
    return code;
  }

  const lines = code.split('\n');
  const insertLine = findMetadataInsertLine(lines);
  lines.splice(insertLine, 0, `    ${directive}: ${value.trim()}`);
  return lines.join('\n');
};

export const setAccessibilityMetadata = (code: string, metadata: AccessibilityMetadata): string => {
  const withDescription = setAccessibilityLine(code, 'description', metadata.description);
  return setAccessibilityLine(withDescription, 'title', metadata.title);
};
