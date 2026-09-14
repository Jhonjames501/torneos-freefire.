const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());

// Servir la interfaz gráfica (frontend) desde la carpeta correspondiente
app.use(express.static(path.join(__dirname, '../frontend')));

// Simulación de base de datos en memoria
let usuarios = [];
let torneos = [];
let inscripciones = [];

// 1. Registrar un nuevo jugador
app.post('/api/registrar', (req, res) => {
    const { nombre, whatsapp, freefire_id, nickname } = req.body;
    
    if (!freefire_id || !nickname) {
        return res.status(400).json({ error: 'El ID de Free Fire y el Nick son obligatorios.' });
    }

    const nuevoUsuario = {
        id: usuarios.length + 1,
        nombre,
        whatsapp,
        freefire_id,
        nickname,
        saldo: 0.00
    };
    
    usuarios.push(nuevoUsuario);
    res.json({ mensaje: '¡Registro exitoso!', usuario: nuevoUsuario });
});

// NUEVO: Obtener la lista de todos los usuarios (Para el panel de admin)
app.get('/api/usuarios', (req, res) => {
    res.json(usuarios);
});

// NUEVO: Editar un usuario
app.put('/api/usuarios/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { nombre, whatsapp, freefire_id, nickname } = req.body;

    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    usuario.nombre = nombre || usuario.nombre;
    usuario.whatsapp = whatsapp || usuario.whatsapp;
    usuario.freefire_id = freefire_id || usuario.freefire_id;
    usuario.nickname = nickname || usuario.nickname;

    res.json({ mensaje: 'Usuario actualizado correctamente', usuario });
});

// NUEVO: Eliminar un usuario
app.delete('/api/usuarios/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = usuarios.findIndex(u => u.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    usuarios.splice(index, 1);
    res.json({ mensaje: 'Usuario eliminado correctamente' });
});

// 2. Crear un torneo de Free Fire
app.post('/api/crear-torneo', (req, res) => {
    const { titulo, costo_inscripcion, premio_total, cupos_maximos } = req.body;

    const nuevoTorneo = {
        id: torneos.length + 1,
        titulo,
        costo_inscripcion,
        premio_total,
        cupos_maximos,
        estado: 'abierto',
        id_sala: null,
        password_sala: null
    };

    torneos.push(nuevoTorneo);
    res.json({ mensaje: 'Torneo creado con éxito', torneo: nuevoTorneo });
});

// 3. Inscribirse a un torneo
app.post('/api/inscribir', (req, res) => {
    const { torneo_id, usuario_id } = req.body;
    const torneo = torneos.find(t => t.id === torneo_id);
    const usuario = usuarios.find(u => u.id === usuario_id);

    if (!torneo || !usuario) {
        return res.status(404).json({ error: 'Torneo o usuario no encontrado.' });
    }

    const nuevaInscripcion = {
        id: inscripciones.length + 1,
        torneo_id,
        usuario_id,
        estado_pago: 'pendiente_verificacion'
    };

    inscripciones.push(nuevaInscripcion);
    res.json({ mensaje: 'Inscripción registrada.', inscripcion: nuevaInscripcion });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de torneos corriendo en el puerto ${PORT}`);
});
