export function isHomePath(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '') || '/';

  return (
    normalized === base ||
    normalized === `${base}/index.html` ||
    normalized === '/index.html'
  );
}
