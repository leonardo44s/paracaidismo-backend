const bcrypt = require("bcrypt")
const mysql = require("mysql2/promise")
require("dotenv").config()

async function createUsers() {
  // Crear pool de conexiones a MySQL
  const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "paracaidismo_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })

  try {
    // Generar hash para la contraseña 'admin123'
    const password = "admin123"
    const hashedPassword = await bcrypt.hash(password, 10)

    console.log("Contraseña hasheada:", hashedPassword)

    // Eliminar usuarios existentes con estos emails
    await pool.query("DELETE FROM usuarios WHERE email IN (?, ?)", [
      "admin@paracaidismo.com",
      "instructor@paracaidismo.com",
    ])

    // Insertar usuario administrador
    await pool.query("INSERT INTO usuarios (nombre, apellido, email, password, rol) VALUES (?, ?, ?, ?, ?)", [
      "Admin",
      "Sistema",
      "admin@paracaidismo.com",
      hashedPassword,
      "admin",
    ])

    console.log("Usuario administrador creado")

    // Insertar usuario instructor
    await pool.query("INSERT INTO usuarios (nombre, apellido, email, password, rol) VALUES (?, ?, ?, ?, ?)", [
      "Juan",
      "Pérez",
      "instructor@paracaidismo.com",
      hashedPassword,
      "instructor",
    ])

    console.log("Usuario instructor creado")

    console.log("Usuarios creados exitosamente")
  } catch (error) {
    console.error("Error al crear usuarios:", error)
  } finally {
    // Cerrar la conexión
    await pool.end()
  }
}

createUsers()
