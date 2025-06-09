import serverless from 'serverless-http';
import { app } from '../../server/index';

// Wrap the Express app with serverless-http to make it compatible with Netlify Functions
export const handler = serverless(app); 