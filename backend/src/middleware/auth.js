import jwt from 'jsonwebtoken';

export function requireAuth(role=null) {
  return (req, res, next) => {
    try {
      const auth = req.headers.authorization || '';
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
      if (!token) return res.status(401).json({error:'Missing token'});
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev');
      if (role && decoded.role !== role) return res.status(403).json({error:'Forbidden'});
      req.user = decoded;
      next();
    } catch (e) {
      return res.status(401).json({error:'Invalid token'});
    }
  }
}
