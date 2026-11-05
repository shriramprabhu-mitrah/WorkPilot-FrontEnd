import type { NodeKey, SerializedLexicalNode, Spread } from 'lexical';

export interface WpRichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  disabled?: boolean;
  className?: string;
  onImageUpload?: (file: File) => Promise<string>;
}

export interface InsertImagePayload {
  src: string;
  altText: string;
  attachmentId?: string;
  width?: number;
  height?: number;
}

export type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
    attachmentId?: string;
    width?: number;
    height?: number;
    type: 'image';
    version: 1;
  },
  SerializedLexicalNode
>;

export interface ImageComponentProps {
  src: string;
  altText: string;
  nodeKey: NodeKey;
  width?: number;
  height?: number;
}

export interface ToolbarButtonProps {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}
