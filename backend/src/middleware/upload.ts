// This file is disabled for serverless deployment
// We now use image URLs instead of file uploads
export const upload = {
  single: () => (req: any, res: any, next: any) => next(),
  none: () => (req: any, res: any, next: any) => next(),
};
