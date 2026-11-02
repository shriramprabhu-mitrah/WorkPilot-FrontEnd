import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

interface UseCopyLinkOptions {
  itemKey?: string | number | null;
  orgSlug?: string;
  projectSlug?: string;
}

export const useCopyLink = ({ itemKey, orgSlug, projectSlug }: UseCopyLinkOptions) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = useCallback(async () => {
    if (!itemKey || typeof window === 'undefined') return;
    const key = String(itemKey);
    const currentUrl = window.location.href;
    let url: string;
    if (currentUrl.includes(key)) {
      url = currentUrl;
    } else {
      const { origin, pathname } = window.location;
      if (orgSlug && projectSlug) {
        const section = pathname.includes('/boards') ? 'boards' : 'backlog';
        url = `${origin}/${orgSlug}/${projectSlug}/${section}/${key}`;
      } else {
        url = `${origin}${pathname}`;
      }
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const copied = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (!copied) {
          throw new Error('Failed to copy link');
        }
      }

      setCopiedLink(true);
      toast.success('Link copied to clipboard');
      window.setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  }, [itemKey, orgSlug, projectSlug]);
  return { handleCopyLink, copiedLink };
};
