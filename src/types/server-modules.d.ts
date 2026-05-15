declare module '@vercel/node' {
  import type { IncomingMessage, ServerResponse } from 'http';

  export interface VercelRequest extends IncomingMessage {
    body?: any;
    query: Record<string, string | string[] | undefined>;
    cookies: Record<string, string>;
    method?: string;
    headers: IncomingMessage['headers'];
  }

  export interface VercelResponse extends ServerResponse {
    status(code: number): VercelResponse;
    json(body: any): VercelResponse;
    send(body: any): VercelResponse;
  }
}

declare module 'bcrypt';
declare module 'jsonwebtoken';
