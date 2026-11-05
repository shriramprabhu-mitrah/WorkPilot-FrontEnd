import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export function LinkClickPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (!rootElement) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');
      if (!link) return;
      const href = link.href;
      if (!href) return;
      event.preventDefault();
      event.stopPropagation();
      window.open(href, '_blank', 'noopener,noreferrer');
    };
    rootElement.addEventListener('click', handleClick, true);
    return () => {
      rootElement.removeEventListener('click', handleClick, true);
    };
  }, [editor]);

  return null;
}
