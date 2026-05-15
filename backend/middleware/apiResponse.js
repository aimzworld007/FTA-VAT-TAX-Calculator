export const ok = (res, data) => res.json({ success: true, data });
export const fail = (res, status, message, code = 'ERROR') => res.status(status).json({ success: false, message, code });
