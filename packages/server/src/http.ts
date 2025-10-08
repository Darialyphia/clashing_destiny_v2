import { createServer } from 'http';

export const http = () => {
  const httpServer = createServer();
  return httpServer;
};

export type HttpServer = ReturnType<typeof http>;
