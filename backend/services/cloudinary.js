import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary'; // este estilo de importacion funciona solo con la version 1.41.0 de cloudanary con otras salta error
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    console.log("--- MULTER INICIANDO SUBIDA ---");
    return{
    folder: 'plant_detections', // Carpeta donde se guardarán en la nube
    allowed_formats: ['jpg', 'png', 'jpeg'],
    public_id: `test_${Date.now()}`, // Nombre único
  };
  },
});

export const upload = multer({ storage: storage });
