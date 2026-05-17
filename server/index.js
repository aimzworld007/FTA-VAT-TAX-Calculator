// Canonical API bootstrap lives in backend/server.js.
// Keep this file as a thin compatibility entrypoint for existing scripts.
import { startServer } from '../backend/server.js';

startServer({ defaultPort: 5000 }).catch((error) => {
  console.error('Failed to initialize server:', error);
  process.exit(1);
});
