// Minimal serverless function for testing
export default async (req: any, res: any) => {
  console.log('Minimal function invoked:', req.method, req.url);
  
  try {
    // Simple test response
    return res.json({ 
      message: 'Minimal serverless function working!',
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Function error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};