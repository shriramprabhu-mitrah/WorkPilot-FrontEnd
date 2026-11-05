import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { ImageNode } from '../nodes/ImageNode';
import { logger } from '@/src/lib/utils/logger';

const theme = {
  paragraph: 'mb-1',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
    underlineStrikethrough: 'underline line-through',
  },
  link: 'cursor-pointer text-blue-600 underline',
  list: {
    ul: 'ml-6 list-disc',
    ol: 'ml-6 list-decimal',
    listitem: 'ml-1',
  },
  heading: {
    h1: 'text-2xl font-bold',
    h2: 'text-xl font-bold',
    h3: 'text-lg font-semibold',
  },
  quote: 'border-l-4 border-gray-300 pl-4 italic text-gray-600',
};

export const initialConfig = {
  namespace: 'WpRichTextEditor',
  theme,
  onError(error: Error) {
    logger.log('Error is ', error);
  },
  nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, AutoLinkNode, ImageNode],
};
