import express from 'express';
import { verifyToken, onlyAdmin } from '../middlewares/auth.js';

import {
    // usuarios
    getAllUsers,
    editUser,
    deleteUser,
    // detecciones
    getAllDetections,
    deleteDetection,
    // pathologias
    // savePathology,
    getAllPathologies,
    editPathology,
    toggleBanUser,
    toggleApproveDetection
} from '../services/admin.js';

const router = express.Router();

//______SECCION DE USUARIOS ______
// OBTENER usuarios
router.get('/get-users', verifyToken, onlyAdmin, getAllUsers);
// EDITAR usuarios (proximamente...)
router.put('/edit-user/:id', verifyToken, onlyAdmin, editUser)
// ELIMINAR algun usuario
router.delete('/delete-user/:id', verifyToken, onlyAdmin, deleteUser)

//______SECCION DE DETECCIONES/HISTORIAL______
// OBTENER detecciones
router.get('/get-detections', verifyToken, onlyAdmin, getAllDetections);
// ELIMINAR ALGUNA DETECCION
router.delete('/delete-detection/:id', verifyToken, onlyAdmin, deleteDetection)

//______SECCION DE AFFECCINOES/PATOLOGÍAS______
// SUBIR pathología de prueba
// router.post('/save-pathology', verifyToken, onlyAdmin, savePathology)
// OBTENER patologias
router.get('/get-pathologies', verifyToken, onlyAdmin, getAllPathologies);
// EDITAR pathología (nombre, tratamiento, etc)
router.put('/edit-pathology/:id', verifyToken, onlyAdmin, editPathology);
// Ban
router.patch('/toggle-ban/:id', verifyToken, onlyAdmin, toggleBanUser)

router.patch("/toggle-approve/:id", verifyToken, onlyAdmin, toggleApproveDetection);


export default router
