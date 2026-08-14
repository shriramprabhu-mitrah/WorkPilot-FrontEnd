export type AuthSource = 'mobile' | 'web';

export const getAuthSource = (): AuthSource => {
  if (typeof window === 'undefined') {
    return 'web';
  }

  const source = new URLSearchParams(window.location.search).get('source');

  return source === 'mobile' ? 'mobile' : 'web';
};
