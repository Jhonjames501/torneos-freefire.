const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());

// Servir la interfaz gráfica (frontend) desde la carpeta correspondiente
app.use(express.static(path.join(__dirname, '../frontend')));

// Simulación de base de datos en memoria (puedes reemplazarlo luego por PostgreSQL o MongoDB)
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

// 2. Crear un torneo de Free Fire
app.post('/api/crear-torneo', (req, res) => {
    const { titulo, costo_inscripcion, premio_total, cupos_maximos } = req.body;

    const nuevoTorneo = {
        id: torneos.length + 1,
        titulo,
        costo_inscripcion,
        premio_total,
        cupos_maximos,
        estado: 'abierto', // abierto, jugando, finalizado
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

    if (torneo.estado !== 'abierto') {
        return res.status(400).json({ error: 'Las inscripciones para este torneo están cerradas.' });
    }

    const nuevaInscripcion = {
        id: inscripciones.length + 1,
        torneo_id,
        usuario_id,
        estado_pago: 'pendiente_verificacion'
    };

    inscripciones.push(nuevaInscripcion);
    res.json({ mensaje: 'Inscripción registrada. Realiza el pago para confirmar tu cupo.', inscripcion: nuevaInscripcion });
});

// 4. Subir resultado (Captura de Booyah)
app.post('/api/resultado', (req, res) => {
    const { torneo_id, usuario_id, link_captura } = req.body;

    const inscripcion = inscripciones.find(i => i.torneo_id === torneo_id && i.usuario_id === usuario_id);
    if (!inscripcion) {
        return res.status(404).json({ error: 'Inscripción no encontrada.' });
    }

    inscripcion.link_captura = link_captura;
    inscripcion.estado_resultado = 'en_revision';

    res.json({ mensaje: 'Captura enviada correctamente. El administrador la verificará.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de torneos corriendo en el puerto ${PORT}`);
});
