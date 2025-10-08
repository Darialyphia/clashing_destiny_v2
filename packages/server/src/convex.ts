import { ConvexClient, ConvexHttpClient } from 'convex/browser';

export const convexHttpClient = () => new ConvexHttpClient(process.env.CONVEX_URL!);
export const convexClient = () => new ConvexClient(process.env.CONVEX_URL!);
