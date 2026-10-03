import authService from '../services/AuthService.js';

class AuthController {

    async signUp(req, res, next) {
        try {
            const { name, lastName, phoneNumber, birthdate, email, password, roles } = req.body;

            // Validar que todos los campos obligatorios requeridos por la tarea estén presentes
            if (!name || !lastName || !phoneNumber || !birthdate || !email || !password) {
                return res.status(400).json({ 
                    message: 'Todos los campos son obligatorios: nombre, apellido, teléfono, fecha de nacimiento, correo y contraseña.' 
                });
            }

            const user = await authService.signUp({ 
                name, 
                lastName, 
                phoneNumber, 
                birthdate, 
                email, 
                password, 
                roles 
            });

            return res.status(201).json(user);
        } catch (err) {
            next(err);
        }
    }

    async signIn(req, res, next) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: 'El email y password son requeridos' });
            }

            const token = await authService.signIn({ email, password });
            return res.status(200).json(token);
        } catch (err) {
            next(err);
        }
    }
}

export default new AuthController();