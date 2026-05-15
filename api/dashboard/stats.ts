import type { VercelRequest, VercelResponse } from '@vercel/node';
import userDashboard from '../user/dashboard.js';
export default userDashboard as (req: VercelRequest, res: VercelResponse)=>Promise<void>;
