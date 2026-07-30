import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FORMAT_TEXT_COMMAND } from 'lexical';
import {
  ListNode,
  ListItemNode,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
} from '@lexical/list';
import { List, ListOrdered } from 'lucide-react';
const initialConfig = {
  namespace: 'ContactSalesEditor',
  theme: {
    paragraph: 'mb-2',
    list: {
      ul: 'ml-6 list-disc',
      ol: 'ml-6 list-decimal',
      listitem: 'ml-2',
    },
    text: {
      bold: 'font-bold',
      italic: 'italic',
      underline: 'underline',
    },
  },
  nodes: [ListNode, ListItemNode],
  onError(error: Error) {
    throw error;
  },
};

export const MessageEditor = () => {
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <Toolbar />

        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-[150px] w-full p-4 text-left text-black outline-none" />
            }
            placeholder={
              <div className="pointer-events-none absolute left-4 top-4 text-sm text-gray-400">
                Write your message here...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
      </div>
    </LexicalComposer>
  );
};

const Toolbar = () => {
  const [editor] = useLexicalComposerContext();
  return (
    <div className="flex gap-1 border-b border-gray-200 bg-gray-50 p-2">
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        className="rounded px-3 py-1 font-bold text-black hover:bg-gray-200"
      >
        B
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        className="rounded px-3 py-1 italic text-black hover:bg-gray-200"
      >
        I
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        className="rounded px-3 py-1 text-black underline hover:bg-gray-200"
      >
        U
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
        className="rounded px-3 py-1 text-black hover:bg-gray-200"
      >
        <List size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
        className="rounded px-3 py-1 text-black hover:bg-gray-200"
      >
        <ListOrdered size={18} />
      </button>
    </div>
  );
};
