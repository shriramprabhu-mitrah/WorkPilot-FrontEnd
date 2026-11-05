import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { PASTE_COMMAND, COMMAND_PRIORITY_LOW, $getSelection, $isRangeSelection } from 'lexical';
import { $generateNodesFromDOM } from '@lexical/html';

export function HtmlPastePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event: ClipboardEvent) => {
        const html = event.clipboardData?.getData('text/html');
        if (!html) {
          return false;
        }
        event.preventDefault();
        editor.update(() => {
          const parser = new DOMParser();
          const dom = parser.parseFromString(html, 'text/html');
          const nodes = $generateNodesFromDOM(editor, dom);
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.insertNodes(nodes);
          }
        });

        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  return null;
}
