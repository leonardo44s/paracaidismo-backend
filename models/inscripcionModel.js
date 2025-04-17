const pool = require("./db");

const inscripcionModel = {
  // Crear una nueva inscripción a evento
  createEventoInscripcion: async (inscripcionData) => {
    try {
      const { evento_id, usuario_id, fecha_inscripcion, estado } = inscripcionData;

      if (!evento_id || !usuario_id) {
        throw new Error("El evento_id y usuario_id son requeridos");
      }

      // Verificar si el usuario ya está inscrito en el evento
      const [existingInscription] = await pool.query(
        "SELECT id FROM inscripciones WHERE evento_id = ? AND usuario_id = ?",
        [evento_id, usuario_id]
      );

      if (existingInscription.length > 0) {
        throw new Error("Ya estás inscrito en este evento");
      }

      // Crear la inscripción
      const [result] = await pool.query(
        "INSERT INTO inscripciones (evento_id, usuario_id, fecha_inscripcion, estado) VALUES (?, ?, ?, ?)",
        [evento_id, usuario_id, fecha_inscripcion || new Date(), estado || "pendiente"]
      );

      return result.insertId;
    } catch (error) {
      console.error("Error al crear inscripción a evento:", error.message || error);
      throw error;
    }
  },

  // Crear una nueva inscripción a curso
  createCursoInscripcion: async (inscripcionData) => {
    try {
      const { curso_id, usuario_id, fecha_preferida, comentarios = "", fecha_inscripcion, estado } = inscripcionData;

      if (!curso_id || !usuario_id) {
        throw new Error("El curso_id y usuario_id son requeridos");
      }

      // Crear la inscripción
      const [result] = await pool.query(
        "INSERT INTO inscripciones_cursos (curso_id, usuario_id, fecha_preferida, comentarios, fecha_inscripcion, estado) VALUES (?, ?, ?, ?, ?, ?)",
        [curso_id, usuario_id, fecha_preferida || null, comentarios, fecha_inscripcion || new Date(), estado || "pendiente"]
      );

      return result.insertId;
    } catch (error) {
      console.error("Error al crear inscripción a curso:", error.message || error);
      throw error;
    }
  },

  // Buscar inscripción por ID (general)
  findById: async (id) => {
    try {
      if (!id) {
        throw new Error("El ID es requerido");
      }

      console.log("Buscando inscripción con ID:", id);

      // Buscar en inscripciones de eventos
      const [eventosRows] = await pool.query(
        `
        SELECT i.*, e.titulo as evento_titulo, e.instructor_id, u.nombre as usuario_nombre, u.apellido as usuario_apellido 
        FROM inscripciones i
        JOIN eventos e ON i.evento_id = e.id
        JOIN usuarios u ON i.usuario_id = u.id
        WHERE i.id = ?
        `,
        [id]
      );

      if (eventosRows.length > 0) {
        console.log("Inscripción encontrada en eventos:", eventosRows[0]);
        return { ...eventosRows[0], tipo: "evento" };
      }

      // Buscar en inscripciones de cursos
      const [cursosRows] = await pool.query(
        `
        SELECT i.*, c.titulo as curso_titulo, c.instructor_id, u.nombre as usuario_nombre, u.apellido as usuario_apellido 
        FROM inscripciones_cursos i
        JOIN cursos c ON i.curso_id = c.id
        JOIN usuarios u ON i.usuario_id = u.id
        WHERE i.id = ?
        `,
        [id]
      );

      if (cursosRows.length > 0) {
        console.log("Inscripción encontrada en cursos:", cursosRows[0]);
        return { ...cursosRows[0], tipo: "curso" };
      }

      console.log("No se encontró ninguna inscripción con el ID proporcionado.");
      return null;
    } catch (error) {
      console.error("Error al buscar inscripción por ID:", error.message || error);
      throw error;
    }
  },

  // Listar inscripciones por evento
  findByEvento: async (eventoId) => {
    try {
      if (!eventoId) {
        throw new Error("El eventoId es requerido");
      }

      const [rows] = await pool.query(
        `
        SELECT i.*, u.nombre as usuario_nombre, u.apellido as usuario_apellido 
        FROM inscripciones i
        JOIN usuarios u ON i.usuario_id = u.id
        WHERE i.evento_id = ?
        ORDER BY i.fecha_inscripcion DESC
        `,
        [eventoId]
      );

      return rows;
    } catch (error) {
      console.error("Error al listar inscripciones por evento:", error.message || error);
      throw error;
    }
  },

  // Listar inscripciones por usuario (general)
  findByUsuario: async (usuarioId) => {
    try {
      if (!usuarioId) {
        throw new Error("El usuarioId es requerido");
      }
  
      // Obtener inscripciones a eventos
      const [eventosRows] = await pool.query(
        `
        SELECT i.*, 'evento' as tipo, e.titulo, e.fecha as fecha_evento, e.hora, e.lugar, e.instructor_id, i.estado
        FROM inscripciones i
        JOIN eventos e ON i.evento_id = e.id
        WHERE i.usuario_id = ?
        ORDER BY i.fecha_inscripcion DESC
        `,
        [usuarioId]
      );
  
      // Obtener inscripciones a cursos
      const [cursosRows] = await pool.query(
        `
        SELECT i.*, 'curso' as tipo, c.titulo, c.nivel, c.precio, c.instructor_id, i.estado
        FROM inscripciones_cursos i
        JOIN cursos c ON i.curso_id = c.id
        WHERE i.usuario_id = ?
        ORDER BY i.fecha_inscripcion DESC
        `,
        [usuarioId]
      );
  
      return [...eventosRows, ...cursosRows];
    } catch (error) {
      console.error("Error al listar inscripciones por usuario:", error.message || error);
      throw error;
    }
  },

  // Actualizar estado de inscripción (general)
  updateEstado: async (id, estado) => {
    try {
      if (!id || !estado) {
        throw new Error("El ID y el estado son requeridos");
      }
  
      console.log("Actualizando estado de inscripción en la base de datos:", { id, estado });
  
      // Intentar actualizar en inscripciones de eventos
      const [eventosResult] = await pool.query("UPDATE inscripciones SET estado = ? WHERE id = ?", [estado, id]);
      if (eventosResult.affectedRows > 0) {
        console.log("Estado actualizado en inscripciones de eventos.");
        return true;
      }
  
      // Intentar actualizar en inscripciones de cursos
      const [cursosResult] = await pool.query("UPDATE inscripciones_cursos SET estado = ? WHERE id = ?", [estado, id]);
      if (cursosResult.affectedRows > 0) {
        console.log("Estado actualizado en inscripciones de cursos.");
        return true;
      }
  
      console.log("No se encontró ninguna inscripción con el ID proporcionado.");
      return false;
    } catch (error) {
      console.error("Error al actualizar estado de inscripción:", error.message || error);
      throw error;
    }
  },
};

module.exports = inscripcionModel;