import HomePage from '@/app/page';

// Required for `output: 'export'`: this catch-all exists so deep links like
// /product/some-slug, /cart, /track-order etc. don't 404 on a full page
// load or refresh. We don't know every product slug at build time, so we
// intentionally generate zero pages here — the web server's rewrite rule
// (see .htaccess) falls back to this same app shell for any unmatched
// path, and the client-side code in app/page.tsx reads window.location on
// mount to restore the correct view (product page, cart, etc.).
export async function generateStaticParams() {
  return [];
}

export default function CatchAllPage() {
  return <HomePage />;
}
