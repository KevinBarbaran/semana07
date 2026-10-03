import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/users.routes.js';
import seedRoles from './utils/seedRoles.js';
import seedUsers from './utils/seedUsers.js'; // <--- Importamos seedUsers

// Obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de Motor de Plantillas EJS y archivos estáticos
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// 1. Rutas de la API (Backend)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/health', (req, res) => res.status(200).json({ ok: true }));

// 2. Rutas para renderizar las vistas EJS (Frontend)
app.get('/', (req, res) => res.redirect('/signIn'));
app.get('/signIn', (req, res) => res.render('signIn'));
app.get('/signUp', (req, res) => res.render('signUp'));
app.get('/profile', (req, res) => res.render('profile'));
app.get('/dashboard-user', (req, res) => res.render('dashboard-user'));
app.get('/dashboard-admin', (req, res) => res.render('dashboard-admin'));
app.get('/403', (req, res) => res.render('403'));

// 3. Manejo de error 404 (para rutas inexistentes)
app.use((req, res, next) => {
    if (req.accepts('html')) {
        return res.status(404).render('404');
    }
    res.status(404).json({ message: 'Ruta no encontrada' });
});

// 4. Manejador global de errores (500)
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/auth_db';

mongoose.connect(MONGODB_URI, { autoIndex: true })
    .then(async () => {
        console.log('Mongo connected');
        await seedRoles();
        await seedUsers(); // <--- Ejecución de creación del usuario admin inicial
        app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
    })
    .catch(err => {
        console.error('Error al conectar con Mongo:', err);
        process.exit(1);
    });