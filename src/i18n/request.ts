import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  // Provide a static locale, fetch a user setting,
  // or use a middleware to negotiate a locale.
  const locale = 'en';

  return {
    locale,
    messages: (await import(`../../locales/${locale}.json`)).default
  };
});
