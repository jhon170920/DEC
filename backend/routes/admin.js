import express from 'express';
import { verifyToken, onlyAdmin } from '../middlewares/auth.js';
import { startExportDataset, getExportStatus, downloadExport } from '../controllers/exportController.js';
import multer from 'multer';
import { uploadPathologyImage } from '../services/admin.js';

const upload = multer({ storage: multer.memoryStorage() });


import {
    getAllUsers,
    editUser,
    deleteUser,
    getAllDetections,
    deleteDetection,
    getAllPathologies,
    editPathology,
    toggleBanUser,
    toggleApproveDetection,
    changeUserRole,
    sendCustomEmail,
} from '../services/admin.js';

const router = express.Router();

//______SECCION DE USUARIOS ______

// OBTENER usuarios
router.get('/get-users', verifyToken, onlyAdmin, getAllUsers);

// EDITAR usuarios (proximamente...)
router.put('/edit-user/:id', verifyToken, onlyAdmin, editUser)

// ELIMINAR algun usuario
router.delete('/delete-user/:id', verifyToken, onlyAdmin, deleteUser)

// OBTENER detecciones
router.get('/get-detections', verifyToken, onlyAdmin, getAllDetections);

// ELIMINAR ALGUNA DETECCION
router.delete('/delete-detection/:id', verifyToken, onlyAdmin, deleteDetection)

//______SECCION DE AFFECCINOES/PATOLOGÍAS______
router.get('/get-pathologies', verifyToken, onlyAdmin, getAllPathologies);

// EDITAR pathología (nombre, tratamiento, etc)
router.put('/edit-pathology/:id', verifyToken, onlyAdmin, editPathology);
router.post('/upload-pathology-image/:id', verifyToken, onlyAdmin, upload.single('image'), uploadPathologyImage);

// Ban
router.patch('/toggle-ban/:id', verifyToken, onlyAdmin, toggleBanUser)

// Aprobar deteccion
router.patch("/toggle-approve/:id", verifyToken, onlyAdmin, toggleApproveDetection);

// Exportar dataset aprobado
router.get('/export/start', verifyToken, onlyAdmin, startExportDataset);
router.get('/export/status/:jobId', verifyToken, onlyAdmin, getExportStatus);
router.get('/export/download/:jobId', verifyToken, onlyAdmin, downloadExport);

// Enviar notificación a todos los usuarios


// Cambiar rol de usuario
router.patch('/change-role/:id', verifyToken, onlyAdmin, changeUserRole);

// Reset Password por admin
// router.post('/sendCustomEmail', verifyToken, onlyAdmin, sendCustomEmail);

// Enviar correo a usuarios (todos o específicos)
router.post('/send-email', verifyToken, onlyAdmin, sendCustomEmail);

export default router