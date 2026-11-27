import type { Request, Response } from 'express';
import app from '../server/app.js';

export default (req: Request, res: Response) => {
  const requestUrl = new URL(req.url || '/', 'http://vercel.local');
  const routedPath = requestUrl.searchParams.get('__vercel_path');

  if (routedPath) {
    requestUrl.searchParams.delete('__vercel_path');
    const apiPath = routedPath.startsWith('/') ? routedPath : `/${routedPath}`;
    const query = requestUrl.searchParams.toString();
    req.url = `/api${apiPath}${query ? `?${query}` : ''}`;
  }

  return app(req, res);
};
