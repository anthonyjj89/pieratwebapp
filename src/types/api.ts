import { NextRequest } from 'next/server';

export type RouteHandlerParams<T extends Record<string, string>> = {
  params: T;
};

export type RouteHandler<T extends Record<string, string>> = (
  req: NextRequest | Request,
  context: RouteHandlerParams<T>
) => Promise<Response>;
