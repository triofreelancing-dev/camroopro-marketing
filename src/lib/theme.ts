/**
 * Applies the app's theme to the document.
 *
 * The page cannot use `prefers-color-scheme` on its own: that reports the
 * PHONE's setting, while the app's theme comes from `user.appTheme` on the
 * server via nativewind. Someone running the app in dark mode on a phone set to
 * light would otherwise get a white page inside a `#0F1823` native shell — which
 * is exactly what made the WebView look pasted in.
 *
 * `prefers-color-scheme` stays as the fallback in CSS for the moment before the
 * handoff is read, and for anyone opening the site in a normal browser.
 */
export function applyTheme(theme?: 'light' | 'dark') {
  if (theme !== 'light' && theme !== 'dark') return;
  document.documentElement.dataset.theme = theme;

  // Keeps the status bar and any browser chrome in step with the page rather
  // than leaving a pale strip above a dark layout.
  const meta =
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]') ??
    document.head.appendChild(Object.assign(document.createElement('meta'), { name: 'theme-color' }));
  meta.content = theme === 'dark' ? '#0F1823' : '#F8FAFC';
}
