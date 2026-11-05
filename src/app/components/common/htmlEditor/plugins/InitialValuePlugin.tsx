import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $insertNodes } from 'lexical';
import { $generateNodesFromDOM } from '@lexical/html';

export function InitialValuePlugin({ value }: { value?: string }) {
  const [editor] = useLexicalComposerContext();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) {
      return;
    }

    if (!value) {
      initialized.current = true;
      return;
    }
    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(value, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();
      if (nodes.length > 0) {
        root.select();
        $insertNodes(nodes);
      }
    });

    initialized.current = true;
  }, [editor, value]);

  return null;
}
