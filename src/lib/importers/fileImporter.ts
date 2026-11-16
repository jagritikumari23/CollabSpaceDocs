/**
 * File Importer for CollabSpace
 * Validates and converts .txt and .md files into structured TipTap JSON documents.
 */

export const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export interface ImportResult {
  success: boolean;
  title?: string;
  content?: any;
  error?: string;
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  const fileName = file.name.toLowerCase();
  const validExtensions = ['.txt', '.md', '.markdown'];
  const hasValidExt = validExtensions.some((ext) => fileName.endsWith(ext));

  if (!hasValidExt) {
    return {
      valid: false,
      error: `Unsupported file type "${file.name}". Please upload a .txt or .md file.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the 2MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
    };
  }

  return { valid: true };
}

/**
 * Converts raw markdown/txt text into TipTap document JSON
 */
export function parseContentToTipTap(rawText: string): any {
  if (!rawText || !rawText.trim()) {
    return {
      type: 'doc',
      content: [{ type: 'paragraph' }],
    };
  }

  const lines = rawText.split(/\r?\n/);
  const nodes: any[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        nodes.push({
          type: 'codeBlock',
          content: [{ type: 'text', text: codeBlockLines.join('\n') }],
        });
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    // Heading 1
    if (trimmed.startsWith('# ')) {
      nodes.push({
        type: 'heading',
        attrs: { level: 1 },
        content: parseInlineFormatting(trimmed.substring(2)),
      });
      continue;
    }

    // Heading 2
    if (trimmed.startsWith('## ')) {
      nodes.push({
        type: 'heading',
        attrs: { level: 2 },
        content: parseInlineFormatting(trimmed.substring(3)),
      });
      continue;
    }

    // Heading 3
    if (trimmed.startsWith('### ')) {
      nodes.push({
        type: 'heading',
        attrs: { level: 3 },
        content: parseInlineFormatting(trimmed.substring(4)),
      });
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      nodes.push({
        type: 'blockquote',
        content: [
          {
            type: 'paragraph',
            content: parseInlineFormatting(trimmed.substring(2)),
          },
        ],
      });
      continue;
    }

    // Bullet List (- or *)
    if (/^[-*]\s+/.test(trimmed)) {
      const itemText = trimmed.replace(/^[-*]\s+/, '');
      nodes.push({
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: parseInlineFormatting(itemText),
              },
            ],
          },
        ],
      });
      continue;
    }

    // Numbered List (1. )
    if (/^\d+\.\s+/.test(trimmed)) {
      const itemText = trimmed.replace(/^\d+\.\s+/, '');
      nodes.push({
        type: 'orderedList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: parseInlineFormatting(itemText),
              },
            ],
          },
        ],
      });
      continue;
    }

    // Standard Paragraph
    nodes.push({
      type: 'paragraph',
      content: parseInlineFormatting(line),
    });
  }

  if (inCodeBlock && codeBlockLines.length > 0) {
    nodes.push({
      type: 'codeBlock',
      content: [{ type: 'text', text: codeBlockLines.join('\n') }],
    });
  }

  return {
    type: 'doc',
    content: nodes.length > 0 ? nodes : [{ type: 'paragraph' }],
  };
}

/**
 * Basic inline markdown parsing for bold, italic, and inline code
 */
function parseInlineFormatting(text: string): any[] {
  if (!text) return [];

  // Simple token parser for **bold**, *italic*, and `code`
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = text.split(regex);
  const elements: any[] = [];

  for (const part of parts) {
    if (!part) continue;

    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      elements.push({
        type: 'text',
        marks: [{ type: 'bold' }],
        text: part.slice(2, -2),
      });
    } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      elements.push({
        type: 'text',
        marks: [{ type: 'italic' }],
        text: part.slice(1, -1),
      });
    } else if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      elements.push({
        type: 'text',
        marks: [{ type: 'code' }],
        text: part.slice(1, -1),
      });
    } else {
      elements.push({
        type: 'text',
        text: part,
      });
    }
  }

  return elements.length > 0 ? elements : [{ type: 'text', text }];
}

/**
 * Reads a File object and converts to TipTap document
 */
export async function processImportFile(file: File): Promise<ImportResult> {
  const validation = validateFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const rawText = await file.text();
    const docTitle = file.name.replace(/\.[^/.]+$/, '').trim() || 'Imported Document';
    const content = parseContentToTipTap(rawText);

    return {
      success: true,
      title: docTitle,
      content,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Failed to read file: ${err.message || 'Unknown error'}`,
    };
  }
}
