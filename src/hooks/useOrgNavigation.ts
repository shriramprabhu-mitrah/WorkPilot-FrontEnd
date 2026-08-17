import { useRouter, useParams } from 'next/navigation';
import { useAppSelector } from '@/src/store';
import { useCallback } from 'react';

type NavigateOptions = {
  scroll?: boolean;
  shallow?: boolean;
  locale?: string | false;
};

/**
 * Hook that provides organization-aware navigation
 * Automatically prepends the organization slug to navigation paths
 */
export const useOrgNavigation = () => {
  const router = useRouter();
  const params = useParams();
  const organization = useAppSelector((state) => state.organization);
  
  // Get org slug from params or store
  const orgSlug = (params?.orgSlug as string) || organization.slug;

  const push = useCallback((path: string, options?: NavigateOptions) => {
    // If path already starts with org slug or is an absolute URL, use as-is
    if (path.startsWith(`/${orgSlug}`) || path.startsWith('http') || !orgSlug) {
      router.push(path, options);
    } else {
      // Remove leading slash if present
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      router.push(`/${orgSlug}/${cleanPath}`, options);
    }
  }, [router, orgSlug]);

  const replace = useCallback((path: string, options?: NavigateOptions) => {
    // If path already starts with org slug or is an absolute URL, use as-is
    if (path.startsWith(`/${orgSlug}`) || path.startsWith('http') || !orgSlug) {
      router.replace(path, options);
    } else {
      // Remove leading slash if present
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      router.replace(`/${orgSlug}/${cleanPath}`, options);
    }
  }, [router, orgSlug]);

  return {
    push,
    replace,
    router, // Original router for special cases
    orgSlug,
  };
};
