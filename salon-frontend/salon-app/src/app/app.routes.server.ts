import { RenderMode, ServerRoute } from '@angular/ssr';

// Use Server so routes are rendered on-demand instead of at build time.
// Prerender was causing build timeouts in CI (Render) when routes hit the API.
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
