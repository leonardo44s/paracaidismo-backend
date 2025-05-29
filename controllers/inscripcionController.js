const inscripcionModel = require("../models/inscripcionModel")
const eventoModel = require("../models/eventoModel")
const cursoModel = require("../models/cursoModel")


const inscripcionController = {
  // Crear nueva inscripción a evento
  inscribirEvento: async (req, res) => {
    try {
      const { evento_id } = req.body;
      const usuario_id = req.user.id; // Usuario autenticado
  
      console.log("Intentando inscribir al usuario:", usuario_id, "en el evento:", evento_id);
  
      // Verificar si el evento existe
      const evento = await eventoModel.findById(evento_id);
      if (!evento) {
        console.log("Evento no encontrado:", evento_id);
        return res.status(404).json({ message: "Evento no encontrado" });
      }
  
      console.log("Evento encontrado:", evento);
  
      // Verificar si ya está inscrito
      const inscripciones = await inscripcionModel.findByUsuario(usuario_id);
      console.log("Inscripciones del usuario:", inscripciones);
  
      const yaInscrito = inscripciones.some(
        (inscripcion) =>
          inscripcion.evento_id === Number(evento_id) &&
          inscripcion.estado !== "cancelada" &&
          inscripcion.estado !== "rechazada" // Permitir reinscripción si está rechazada
      );
  
      if (yaInscrito) {
        console.log("El usuario ya está inscrito en este evento.");
        return res.status(400).json({ message: "Ya estás inscrito en este evento" });
      }
  
      // Verificar si hay capacidad disponible
      const inscripcionesEvento = await inscripcionModel.findByEvento(evento_id);
      console.log("Inscripciones activas del evento:", inscripcionesEvento);
  
      const inscripcionesActivas = inscripcionesEvento.filter(
        (inscripcion) => inscripcion.estado !== "cancelada" && inscripcion.estado !== "rechazada"
      );
  
      if (inscripcionesActivas.length >= evento.capacidad) {
        console.log("El evento ha alcanzado su capacidad máxima.");
        return res.status(400).json({ message: "El evento ha alcanzado su capacidad máxima" });
      }
  
      // Crear inscripción
      const inscripcionId = await inscripcionModel.createEventoInscripcion({
        evento_id,
        usuario_id,
        fecha_inscripcion: new Date(),
        estado: "pendiente",
      });
  
      console.log("Inscripción creada exitosamente:", inscripcionId);
      res.status(201).json({
        message: "Inscripción realizada exitosamente",
        inscripcionId,
      });
    } catch (error) {
      console.error("Error al crear inscripción:", error.message || error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  },

  // Crear nueva inscripción a curso
  inscribirCurso: async (req, res) => {
    try {
      console.log("Datos recibidos en el backend:", req.body);
  
      const { curso_id, fecha_preferida, comentarios } = req.body;
      const usuario_id = req.user.id; // Usuario autenticado
  
      // Verificar si el curso existe
      const curso = await cursoModel.getById(curso_id);
      if (!curso) {
        return res.status(404).json({ message: "Curso no encontrado" });
      }
  
      // Verificar si ya está inscrito
      const inscripciones = await inscripcionModel.findCursosByUsuario(usuario_id);
      const yaInscrito = inscripciones.some(
        (inscripcion) =>
          inscripcion.curso_id === Number(curso_id) &&
          inscripcion.estado !== "cancelada" &&
          inscripcion.estado !== "rechazada" // Permitir reinscripción si está rechazada o cancelada
      );
  
      if (yaInscrito) {
        return res.status(400).json({ message: "Ya estás inscrito en este curso" });
      }
  
      // Crear inscripción
      const nuevaInscripcion = await inscripcionModel.createCursoInscripcion({
        curso_id,
        usuario_id,
        fecha_preferida,
        comentarios,
        fecha_inscripcion: new Date(),
        estado: "pendiente",
      });
  
      res.status(201).json({
        message: "Inscripción al curso realizada exitosamente",
        inscripcionId: nuevaInscripcion,
      });
    } catch (error) {
      console.error("Error al crear inscripción al curso:", error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  },
  

  // Obtener inscripciones por usuario
  getByUsuario: async (req, res) => {
    try {
      const usuario_id = req.user.id // Usuario autenticado

      const inscripciones = await inscripcionModel.findByUsuario(usuario_id)
      res.json(inscripciones)
    } catch (error) {
      console.error("Error al obtener inscripciones:", error)
      res.status(500).json({ message: "Error en el servidor" })
    }
  },

  // Obtener inscripciones por evento (solo para instructores y admin)
  getByEvento: async (req, res) => {
    try {
      const { evento_id } = req.params

      // Verificar si el evento existe
      const evento = await eventoModel.findById(evento_id)
      if (!evento) {
        return res.status(404).json({ message: "Evento no encontrado" })
      }

      // Solo el instructor del evento o un admin pueden ver las inscripciones
      if (req.user.rol !== "admin" && req.user.rol !== "instructor") {
        return res.status(403).json({ message: "No tienes permisos para ver esta información" })
      }

      // Si es instructor, solo puede ver sus propios eventos
      if (req.user.rol === "instructor" && evento.instructor_id !== req.user.id) {
        return res.status(403).json({ message: "No tienes permisos para ver esta información" })
      }

      const inscripciones = await inscripcionModel.findByEvento(evento_id)
      res.json(inscripciones)
    } catch (error) {
      console.error("Error al obtener inscripciones del evento:", error)
      res.status(500).json({ message: "Error en el servidor" })
    }
  },

  // Actualizar estado de inscripción (solo para instructores y admin)
  updateEstado: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado } = req.body;
  
      console.log("Actualizando estado de inscripción:", { id, estado });
  
      if (!id || !estado) {
        return res.status(400).json({ message: "El ID y el estado son requeridos" });
      }
  
      // Actualizar estado en inscripciones de eventos o cursos
      const actualizado = await inscripcionModel.updateEstado(id, estado);
  
      if (actualizado) {
        console.log("Estado de inscripción actualizado correctamente.");
        return res.json({ message: "Estado de inscripción actualizado correctamente" });
      }
  
      console.log("No se encontró ninguna inscripción con el ID proporcionado.");
      res.status(404).json({ message: "Inscripción no encontrada" });
    } catch (error) {
      console.error("Error al actualizar estado de inscripción:", error.message || error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  },

  // Cancelar inscripción (usuario puede cancelar su propia inscripción)
  cancelar: async (req, res) => {
    try {
      const { id } = req.params;
  
      console.log("Intentando cancelar inscripción con ID:", id);
  
      const inscripcion = await inscripcionModel.findById(id);
      if (!inscripcion) {
        return res.status(404).json({ message: "Inscripción no encontrada" });
      }
  
      const deleted = await inscripcionModel.updateEstado(id, "Cancelada");
  
      if (deleted) {
        console.log("Inscripción cancelada exitosamente.");
        // Devolver la inscripción actualizada
        const inscripcionActualizada = await inscripcionModel.findById(id);
        console.log("Inscripción actualizada:", inscripcionActualizada);
        return res.json(inscripcionActualizada);
      } else {
        res.status(400).json({ message: "No se pudo cancelar la inscripción" });
      }
    } catch (error) {
      console.error("Error al cancelar inscripción:", error.message || error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  },
}

module.exports = inscripcionController
