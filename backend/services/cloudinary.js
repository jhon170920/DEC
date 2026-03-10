import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer guarda el archivo en memoria como un Buffer (sin disco, sin cloudinary-storage)
// Esto es compatible con cualquier versión de cloudinary y con Node.js v24+
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes JPG y PNG'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB máximo
});

// Helper para subir el buffer de memoria a Cloudinary
// Retorna la URL segura del archivo subido
export const uploadToCloudinary = (fileBuffer, mimetype) => {
  return new Promise((resolve, reject) => {
    const resourceType = mimetype.startsWith('image/') ? 'image' : 'raw';

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'plant_detections',
        public_id: `detection_${Date.now()}`,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export default cloudinary;
