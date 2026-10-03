import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userRepository from '../repositories/UserRepository.js';
import roleRepository from '../repositories/RoleRepository.js';

class AuthService {

    async signUp({ email, password, name, lastName, phoneNumber, birthdate, roles = ['user'] }) {
        // 1. Validar la contraseña en texto plano antes de hashearla
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[#$%&*@])[A-Za-z\d#$%&*@]{8,}$/;
        if (!passwordRegex.test(password)) {
            const err = new Error('La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un caracter especial (# $ % & * @).');
            err.status = 400;
            throw err;
        }

        const existing = await userRepository.findByEmail(email);
        if (existing) {
            const err = new Error('El email ya se encuentra en uso');
            err.status = 400;
            throw err;
        }

        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '10', 10);
        const hashed = await bcrypt.hash(password, saltRounds);

        const roleDocs = [];
        for (const r of roles) {
            let roleDoc = await roleRepository.findByName(r);
            if (!roleDoc) roleDoc = await roleRepository.create({ name: r });
            roleDocs.push(roleDoc._id);
        }

        // 2. Pasar todos los campos obligatorios a userRepository.create
        const user = await userRepository.create({
            email,
            password: hashed,
            name,
            lastName,
            phoneNumber,
            birthdate,
            roles: roleDocs
        });

        return {
            id: user._id,
            email: user.email,
            name: user.name
        };
    }

    async signIn({ email, password }) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            const err = new Error('Credenciales inválidas');
            err.status = 401;
            throw err;
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            const err = new Error('Credenciales inválidas');
            err.status = 401;
            throw err;
        }

        const secret = process.env.JWT_SECRET || 'mi_clave_secreta_super_segura_123';

        const rolesPayload = Array.isArray(user.roles)
            ? user.roles.map(r => (typeof r === 'object' && r.name ? r.name : r.toString()))
            : [];

        const token = jwt.sign(
            { 
                sub: user._id, 
                roles: rolesPayload 
            }, 
            secret, 
            { 
                expiresIn: process.env.JWT_EXPIRES_IN || '1h' 
            }
        );

        return { token };
    }
}

export default new AuthService();