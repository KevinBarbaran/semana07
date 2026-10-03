import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Role from '../models/Role.js';

export default async function seedUsers() {
    try {
        const adminEmail = 'admin@test.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (!existingAdmin) {
            const adminRole = await Role.findOne({ name: 'admin' });
            if (!adminRole) {
                console.error('El rol admin debe crearse antes de ejecutar seedUsers');
                return;
            }

            const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '10', 10);
            const hashedPassword = await bcrypt.hash('Admin#1234', saltRounds);

            await User.create({
                name: 'Super',
                lastName: 'Admin',
                email: adminEmail,
                password: hashedPassword,
                phoneNumber: '999888777',
                birthdate: new Date('1990-01-01'),
                address: 'Oficina Central',
                roles: [adminRole._id]
            });

            console.log('Usuario Admin sembrado con éxito: admin@test.com / Admin#1234');
        }
    } catch (error) {
        console.error('Error al sembrar usuario admin:', error);
    }
}