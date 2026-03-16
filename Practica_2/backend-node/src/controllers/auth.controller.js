const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const env = require("../config/env");

exports.register = async (req, res) => {
  const { username, email, password, profile_picture_url } = req.body;

  if (!username || !email || !password) {
    return res.status(422).json({ detail: "Faltan campos requeridos: username, email y password" });
  }

  try {
    const [existingUsername] = await pool.execute(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );
    if (existingUsername.length > 0) {
      return res.status(409).json({ detail: "El nombre de usuario ya está registrado" });
    }

    const [existingEmail] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existingEmail.length > 0) {
      return res.status(409).json({ detail: "El correo electrónico ya está registrado" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [result] = await pool.execute(
      `INSERT INTO users (username, email, password_hash, profile_picture_url)
       VALUES (?, ?, ?, ?)`,
      [username, email, password_hash, profile_picture_url || null]
    );

    const [newUserRows] = await pool.execute(
      "SELECT id, username, email, profile_picture_url, created_at FROM users WHERE id = ?",
      [result.insertId]
    );

    const newUser = newUserRows[0];

    return res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        profile_picture_url: newUser.profile_picture_url,
        created_at: newUser.created_at.toISOString()
      }
    });

  } catch (error) {
    console.error("Error en register:", error);
    return res.status(500).json({ detail: "Error interno del servidor" });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(422).json({ detail: "Faltan campos requeridos: username y password" });
  }

  try {
    const [rows] = await pool.execute(
      "SELECT id, username, email, password_hash, profile_picture_url, created_at FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ detail: "Credenciales inválidas" });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ detail: "Credenciales inválidas" });
    }

    const tokenPayload = {
      sub: user.username,
      username: user.username,
      id: user.id
    };

    const token = jwt.sign(tokenPayload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN
    });

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profile_picture_url: user.profile_picture_url,
        created_at: user.created_at.toISOString()
      },
      token: token
    });

  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ detail: "Error interno del servidor" });
  }
};
