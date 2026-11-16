import { describe, it, expect } from 'vitest';
import {
  validateFile,
  parseContentToTipTap,
  MAX_FILE_SIZE_BYTES,
} from '../fileImporter';

describe('fileImporter', () => {
  describe('validateFile', () => {
    it('accepts valid .md and .txt files under the limit', () => {
      const validMd = new File(['# Title'], 'notes.md', { type: 'text/markdown' });
      const validTxt = new File(['Hello world'], 'document.txt', { type: 'text/plain' });

      expect(validateFile(validMd).valid).toBe(true);
      expect(validateFile(validTxt).valid).toBe(true);
    });

    it('rejects unsupported file formats', () => {
      const invalidPdf = new File(['%PDF-1.5'], 'document.pdf', { type: 'application/pdf' });
      const res = validateFile(invalidPdf);

      expect(res.valid).toBe(false);
      expect(res.error).toContain('Unsupported file type');
    });

    it('rejects files larger than 2MB', () => {
      // Mock large file
      const largeFile = {
        name: 'large_file.txt',
        size: MAX_FILE_SIZE_BYTES + 500,
      } as File;

      const res = validateFile(largeFile);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('File size exceeds');
    });
  });

  describe('parseContentToTipTap', () => {
    it('returns empty paragraph node for empty string', () => {
      const parsed = parseContentToTipTap('');
      expect(parsed).toEqual({
        type: 'doc',
        content: [{ type: 'paragraph' }],
      });
    });

    it('converts markdown headings to TipTap heading nodes', () => {
      const md = '# Main Heading\n## Sub Heading\n### Minor Heading';
      const parsed = parseContentToTipTap(md);

      expect(parsed.type).toBe('doc');
      expect(parsed.content[0].type).toBe('heading');
      expect(parsed.content[0].attrs.level).toBe(1);
      expect(parsed.content[0].content[0].text).toBe('Main Heading');

      expect(parsed.content[1].type).toBe('heading');
      expect(parsed.content[1].attrs.level).toBe(2);

      expect(parsed.content[2].type).toBe('heading');
      expect(parsed.content[2].attrs.level).toBe(3);
    });

    it('converts lists and blockquotes correctly', () => {
      const md = '- Item 1\n* Item 2\n1. Numbered Item\n> Important quote';
      const parsed = parseContentToTipTap(md);

      expect(parsed.content[0].type).toBe('bulletList');
      expect(parsed.content[1].type).toBe('bulletList');
      expect(parsed.content[2].type).toBe('orderedList');
      expect(parsed.content[3].type).toBe('blockquote');
    });

    it('converts inline bold and italic marks', () => {
      const md = 'This is **bold** and *italic* text';
      const parsed = parseContentToTipTap(md);

      const paragraph = parsed.content[0];
      expect(paragraph.type).toBe('paragraph');

      const boldNode = paragraph.content.find(
        (n: any) => n.marks && n.marks.some((m: any) => m.type === 'bold')
      );
      expect(boldNode).toBeDefined();
      expect(boldNode.text).toBe('bold');

      const italicNode = paragraph.content.find(
        (n: any) => n.marks && n.marks.some((m: any) => m.type === 'italic')
      );
      expect(italicNode).toBeDefined();
      expect(italicNode.text).toBe('italic');
    });

    it('converts fenced code blocks', () => {
      const md = '```\nconst x = 10;\nconsole.log(x);\n```';
      const parsed = parseContentToTipTap(md);

      expect(parsed.content[0].type).toBe('codeBlock');
      expect(parsed.content[0].content[0].text).toBe('const x = 10;\nconsole.log(x);');
    });
  });
});
