const pool = require("./db")

const eventoModel = {
  // Crear un nuevo evento
  create: async (eventoData) => {
    const { titulo, descripcion, fecha, hora, lugar, capacidad, instructor_id } = eventoData

    const [result] = await pool.query(
      "INSERT INTO eventos (titulo, descripcion, fecha, hora, lugar, capacidad, instructor_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [titulo, descripcion, fecha, hora, lugar, capacidad, instructor_id],
    )

    return result.insertId
  },

  // Buscar evento por ID
  findById: async (id) => {
    const [rows] = await pool.query(
      `
      SELECT e.*, u.nombre as instructor_nombre, u.apellido as instructor_apellido 
      FROM eventos e
      LEFT JOIN usuarios u ON e.instructor_id = u.id
      WHERE e.id = ?
    `,
      [id],
    )

    return rows[0]
  },

  // Listar todos los eventos
  findAll: async () => {
    const [rows] = await pool.query(`
      SELECT e.*, u.nombre as instructor_nombre, u.apellido as instructor_apellido 
      FROM eventos e
      LEFT JOIN usuarios u ON e.instructor_id = u.id
      ORDER BY e.fecha DESC
    `)

    return rows
  },

  // Listar eventos por instructor
  findByInstructor: async (instructorId) => {
    const [rows] = await pool.query(
      `
      SELECT e.*, u.nombre as instructor_nombre, u.apellido as instructor_apellido 
      FROM eventos e
      LEFT JOIN usuarios u ON e.instructor_id = u.id
      WHERE e.instructor_id = ?
      ORDER BY e.fecha DESC
    `,
      [instructorId],
    )

    return rows
  },

  // Actualizar evento
  update: async (id, eventoData) => {
    const { titulo, descripcion, fecha, hora, lugar, capacidad, instructor_id } = eventoData

    const [result] = await pool.query(
      "UPDATE eventos SET titulo = ?, descripcion = ?, fecha = ?, hora = ?, lugar = ?, capacidad = ?, instructor_id = ? WHERE id = ?",
      [titulo, descripcion, fecha, hora, lugar, capacidad, instructor_id, id],
    )

    return result.affectedRows > 0
  },

  // Eliminar evento
  delete: async (id) => {
    const [result] = await pool.query("DELETE FROM eventos WHERE id = ?", [id])
    return result.affectedRows > 0
  },
}

module.exports = eventoModel
