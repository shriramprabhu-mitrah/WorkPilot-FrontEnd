import {
  DecoratorNode,
  createCommand,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type LexicalCommand,
  type LexicalNode,
  type NodeKey,
} from 'lexical';
import type { InsertImagePayload, SerializedImageNode } from '../types';
import { ImageComponent } from '../components/ImageComponent';

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> =
  createCommand('INSERT_IMAGE_COMMAND');

function convertImageElement(domNode: HTMLElement): DOMConversionOutput | null {
  if (domNode instanceof HTMLImageElement) {
    const { src, alt } = domNode;
    const attachmentId = domNode.getAttribute('data-attachment-id') || undefined;
    const width = domNode.getAttribute('width')
      ? parseInt(domNode.getAttribute('width')!)
      : undefined;
    const height = domNode.getAttribute('height')
      ? parseInt(domNode.getAttribute('height')!)
      : undefined;
    const node = $createImageNode({ src, altText: alt || '', attachmentId, width, height });
    return { node };
  }
  return null;
}

export class ImageNode extends DecoratorNode<React.ReactNode> {
  __src: string;
  __altText: string;
  __attachmentId?: string;
  __width?: number;
  __height?: number;

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__attachmentId,
      node.__width,
      node.__height,
      node.__key
    );
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { src, altText, attachmentId, width, height } = serializedNode;
    return $createImageNode({ src, altText, attachmentId, width, height });
  }

  exportJSON(): SerializedImageNode {
    return {
      src: this.__src,
      altText: this.__altText,
      attachmentId: this.__attachmentId,
      width: this.__width,
      height: this.__height,
      type: 'image',
      version: 1,
    };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: convertImageElement,
        priority: 0,
      }),
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('img');
    element.setAttribute('src', this.__src);
    element.setAttribute('alt', this.__altText);
    if (this.__attachmentId) {
      element.setAttribute('data-attachment-id', this.__attachmentId);
    }
    if (this.__width) {
      element.setAttribute('width', String(this.__width));
    }
    if (this.__height) {
      element.setAttribute('height', String(this.__height));
    }
    return { element };
  }

  constructor(
    src: string,
    altText: string,
    attachmentId?: string,
    width?: number,
    height?: number,
    key?: NodeKey
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__attachmentId = attachmentId;
    this.__width = width;
    this.__height = height;
  }

  createDOM(): HTMLElement {
    return document.createElement('span');
  }

  updateDOM(): false {
    return false;
  }

  decorate(): React.ReactNode {
    return (
      <ImageComponent
        src={this.__src}
        altText={this.__altText}
        nodeKey={this.getKey()}
        width={this.__width}
        height={this.__height}
      />
    );
  }
}

export function $createImageNode({
  src,
  altText,
  attachmentId,
  width,
  height,
}: InsertImagePayload): ImageNode {
  return new ImageNode(src, altText, attachmentId, width, height);
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}
