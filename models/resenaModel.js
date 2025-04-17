const db = require("./db")

const resenaModel = {
  // Crear una nueva reseña
  create: async (resena) => {
    try {
      const { usuario_id, curso_id, titulo, contenido, calificacion } = resena

      const query = `
        INSERT INTO resenas (usuario_id, curso_id, titulo, contenido, calificacion, estado, fecha_creacion)
        VALUES (?, ?, ?, ?, ?, 'pendiente', NOW())
      `

      const [result] = await db.query(query, [usuario_id, curso_id, titulo, contenido, calificacion])

      return result.insertId
    } catch (error) {
      console.error("Error en resenaModel.create:", error)
      throw error
    }
  },

  // Encontrar todas las reseñas aprobadas
  findAll: async () => {
    try {
      const query = `
        SELECT r.*, u.nombre, u.apellido, c.nombre as curso_nombre
        FROM resenas r
        LEFT JOIN usuarios u ON r.usuario_id = u.id
        LEFT JOIN cursos c ON r.curso_id = c.id
        WHERE r.estado = 'aprobada'
        ORDER BY r.fecha_creacion DESC
      `

      const [resenas] = await db.query(query)
      return resenas
    } catch (error) {
      console.error("Error en resenaModel.findAll:", error)
      throw error
    }
  },

  // Encontrar reseñas por curso
  findByCurso: async (cursoId) => {
    try {
      const query = `
        SELECT r.*, u.nombre, u.apellido
        FROM resenas r
        JOIN usuarios u ON r.usuario_id = u.id
        WHERE r.curso_id = ? AND r.estado = 'aprobada'
        ORDER BY r.fecha_creacion DESC
      `

      const [resenas] = await db.query(query, [cursoId])
      return resenas
    } catch (error) {
      console.error("Error en resenaModel.findByCurso:", error)
      throw error
    }
  },

  // Encontrar reseñas por usuario
  findByUsuario: async (usuarioId) => {
    try {
      const query = `
        SELECT r.*, c.titulo AS curso_nombre
      FROM resenas r
      LEFT JOIN cursos c ON r.curso_id = c.id
      WHERE r.usuario_id = ?
      ORDER BY r.fecha_creacion DESC
      `

      const [resenas] = await db.query(query, [usuarioId])
      return resenas
    } catch (error) {
      console.error("Error en resenaModel.findByUsuario:", error)
      throw error
    }
  },

  // Encontrar reseñas pendientes
  findPendientes: async () => {
    try {
      const query = `
        SELECT r.*, u.nombre, u.apellido, c.titulo AS curso_nombre
      FROM resenas r
      JOIN usuarios u ON r.usuario_id = u.id
      LEFT JOIN cursos c ON r.curso_id = c.id
      WHERE r.estado = 'pendiente'
      ORDER BY r.fecha_creacion DESC
      `

      const [resenas] = await db.query(query)
      return resenas
    } catch (error) {
      console.error("Error en resenaModel.findPendientes:", error)
      throw error
    }
  },

  // Encontrar reseña por ID
  findById: async (id) => {
    try {
      const query = `
        SELECT r.*, u.nombre, u.apellido, c.nombre as curso_nombre
        FROM resenas r
        JOIN usuarios u ON r.usuario_id = u.id
        LEFT JOIN cursos c ON r.curso_id = c.id
        WHERE r.id = ?
      `

      const [resenas] = await db.query(query, [id])
      return resenas[0]
    } catch (error) {
      console.error("Error en resenaModel.findById:", error)
      throw error
    }
  },

  // Aprobar una reseña
  aprobar: async (id) => {
    try {
      const query = `
        UPDATE resenas
        SET estado = 'aprobada', fecha_actualizacion = NOW()
        WHERE id = ?
      `

      const [result] = await db.query(query, [id])
      return result.affectedRows > 0
    } catch (error) {
      console.error("Error en resenaModel.aprobar:", error)
      throw error
    }
  },

  // Rechazar una reseña
  rechazar: async (id, motivo) => {
    try {
      const query = `
        UPDATE resenas
        SET estado = 'rechazada', motivo_rechazo = ?, fecha_actualizacion = NOW()
        WHERE id = ?
      `

      const [result] = await db.query(query, [motivo, id])
      return result.affectedRows > 0
    } catch (error) {
      console.error("Error en resenaModel.rechazar:", error)
      throw error
    }
  },

  // Eliminar una reseña
  delete: async (id) => {
    try {
      const query = `
        DELETE FROM resenas
        WHERE id = ?
      `

      const [result] = await db.query(query, [id])
      return result.affectedRows > 0
    } catch (error) {
      console.error("Error en resenaModel.delete:", error)
      throw error
    }
  },

  // Obtener cursos disponibles para reseñar (cursos en los que el usuario está inscrito)
  getCursosDisponibles: async (usuarioId) => {
    try {
      const query = `
        SELECT c.id, c.nombre, c.descripcion, c.imagen
        FROM cursos c
        JOIN inscripciones i ON c.id = i.curso_id
        WHERE i.usuario_id = ? AND i.estado = 'completada'
        AND NOT EXISTS (
          SELECT 1 FROM resenas r 
          WHERE r.usuario_id = ? AND r.curso_id = c.id
        )
      `

      const [cursos] = await db.query(query, [usuarioId, usuarioId])
      return cursos
    } catch (error) {
      console.error("Error en resenaModel.getCursosDisponibles:", error)
      throw error
    }
  },
}

module.exports = resenaModel
