// Azure Function - NombresFunction
// Maneja GET (listar nombres) y POST (agregar nombre)

// Lista inicial con los integrantes del grupo
// NOTA: Esta lista es volátil (se reinicia con cada cold start de la función)
let registros = [
  { nombre: "Sergio Joel Rodas Velez",              carne: "202200271" },
  { nombre: "Rodrigo Sebastian Castro Aguilar",      carne: "202204496" },
  { nombre: "Moisés Iván Daniel Alvarado García",    carne: "202002907" }
];

module.exports = async function (context, req) {

  // Cabeceras CORS — necesarias para que el frontend en Blob Storage pueda llamar la API
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  // Preflight OPTIONS (CORS)
  if (req.method === "OPTIONS") {
    context.res = { status: 204, headers };
    return;
  }

  // GET — retorna la lista actual
  if (req.method === "GET") {
    context.res = {
      status: 200,
      headers,
      body: {
        mensaje: "Lista de registros obtenida correctamente",
        total: registros.length,
        registros: registros
      }
    };
    return;
  }

  // POST — agrega un nuevo nombre
  if (req.method === "POST") {
    const body = req.body;

    if (!body || !body.nombre) {
      context.res = {
        status: 400,
        headers,
        body: { error: "El campo 'nombre' es requerido en el body." }
      };
      return;
    }

    const nuevoRegistro = {
      nombre: body.nombre.trim(),
      carne: body.carne ? body.carne.trim() : "N/A"
    };

    registros.push(nuevoRegistro);

    context.res = {
      status: 201,
      headers,
      body: {
        mensaje: "Nombre registrado exitosamente",
        registroAgregado: nuevoRegistro,
        totalActual: registros.length,
        registros: registros
      }
    };
    return;
  }

  // Método no permitido
  context.res = {
    status: 405,
    headers,
    body: { error: "Método no permitido. Usa GET o POST." }
  };
};