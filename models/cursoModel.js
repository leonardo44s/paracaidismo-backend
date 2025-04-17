const db = require("./db")

// Crear un nuevo curso
exports.create = async (cursoData) => {
  const { titulo, descripcion, nivel, duracion, precio, instructor_id, imagen } = cursoData

  console.log("Creando curso con datos:", {
    titulo,
    descripcion,
    nivel,
    duracion,
    precio,
    instructor_id: Number(instructor_id),
    imagen,
  })

  const [result] = await db.query(
    `
    INSERT INTO cursos (
      titulo, descripcion, nivel, duracion, precio, instructor_id, imagen, fecha_creacion
    ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
  `,
    [titulo, descripcion, nivel, duracion, precio, Number(instructor_id), imagen],
  )

  return result
}

// Obtener todos los cursos
exports.getAll = async () => {
  const [cursos] = await db.query(`
    SELECT c.*, u.nombre as instructor_nombre, u.apellido as instructor_apellido
    FROM cursos c
    LEFT JOIN usuarios u ON c.instructor_id = u.id
    ORDER BY c.fecha_creacion DESC
  `)

  return cursos
}

// Obtener un curso por ID
exports.getById = async (id) => {
  const [cursos] = await db.query(
    `
    SELECT c.*, u.nombre as instructor_nombre, u.apellido as instructor_apellido
    FROM cursos c
    LEFT JOIN usuarios u ON c.instructor_id = u.id
    WHERE c.id = ?
  `,
    [id],
  )

  return cursos[0]
}

// Actualizar un curso
exports.update = async (id, cursoData) => {
  const { titulo, descripcion, nivel, duracion, precio, instructor_id, imagen } = cursoData

  const [result] = await db.query(
    `
    UPDATE cursos
    SET titulo = ?, descripcion = ?, nivel = ?, duracion = ?, precio = ?, 
        instructor_id = ?, imagen = ?, fecha_actualizacion = NOW()
    WHERE id = ?
  `,
    [titulo, descripcion, nivel, duracion, precio, Number(instructor_id), imagen, id],
  )

  return result
}

// Eliminar un curso
exports.delete = async (id) => {
  const [result] = await db.query("DELETE FROM cursos WHERE id = ?", [id])
  return result
}
