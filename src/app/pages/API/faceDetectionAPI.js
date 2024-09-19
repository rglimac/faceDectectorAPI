// Importa las dependencias necesarias
const express = require('express');

// Crea una instancia de Express
const app = express();
const port = 3000;

// Middleware para analizar el cuerpo de la solicitud como JSON
app.use(express.json());

// Ruta de ejemplo para obtener datos
app.get('/api/data', (req, res) => {
  const data = {
    message: '¡Hola desde tu API con JavaScript y Express!',
    timestamp: new Date()
  };
  res.json(data);
});

// Ruta para procesar imágenes mediante un método POST
app.post('/api/reconocimiento-facial', (req, res) => {
  // Simulación de procesamiento de la imagen (aquí iría la lógica real de reconocimiento facial)
  // En este caso, simplemente verificamos si hay una imagen en el cuerpo de la solicitud
  if (req.body.image) {
    // Si se recibe una imagen, devolvemos un mensaje de "correcto"
    res.json({ message: 'Imagen recibida correctamente. Procesamiento en curso...' });
  } else {
    // Si no se recibe una imagen, devolvemos un mensaje de "incorrecto"
    res.status(400).json({ error: 'No se ha proporcionado una imagen en la solicitud.' });
  }
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor API escuchando en el puerto ${port}`);
});