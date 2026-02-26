import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Cargar las variables de entorno desde el archivo .env

const dbURI = process.env.dbURI; // Asegúrarse de que la variable de entorno dbURI esté definida en el archivo .env

mongoose.connect(dbURI)
.then(() => console.log("conectado a la base de datos"))
.catch(error => console.error("Error al conectar a la base de datos:", error));