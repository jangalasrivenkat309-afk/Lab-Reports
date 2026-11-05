// Fallback root entry point redirecting to lab-03
import('./lab-03/app.js').catch((err) => {
  console.error('Failed to start lab-03 from root server.js:', err.message);
});
