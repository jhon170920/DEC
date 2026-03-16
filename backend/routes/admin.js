import express from 'express';
import { getAllUsers, getAllDeteccions, getAllPathologies } from '../services/admin.js';
import { verifyToken, onlyAdmin } from '../middlewares/auth.js';

const router = express.Router();

//______SECCION DE VER______
// obtener usuarios
router.get('/get-users', verifyToken, onlyAdmin, getAllUsers);
// obtener detecciones
router.get('/get-deteccions', verifyToken, onlyAdmin, getAllDeteccions);
// obtener patologias
router.get('/get-pathologies', verifyToken, onlyAdmin, getAllPathologies);

//______SECCION DE EDITAR______
// editar usuarios (proximamente...)
// router.put('/edit-users', verifyToken, onlyAdmin, editUser)
// // editar pathología (nombre, tratamiento, etc)
// router.put('/edit-pathology', verifyToken, onlyAdmin, editPathology)


//______SECCION DE ELIMINAR______
// eliminar algun usuario
// router.delete('/delete-user', verifyToken, onlyAdmin, deleteUser)
// eliminar alguna deteccion
export default router
