import jwt from 'jsonwebtoken';

export default function authenticate(req, res, next) {
    try {
        const header = req.headers.authorization;

        if (!header || !header.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        const token = header.split(' ')[1];
        const secret = process.env.JWT_SECRET || 'mi_clave_secreta_super_segura_123';

        const payload = jwt.verify(token, secret);

        req.userId = payload.sub;
        req.userRoles = payload.roles || [];
        next();

    } catch (err) {
        return res.status(401).json({ message: 'Token no válido o caducado' });
    }
}