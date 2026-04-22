import express from 'express';
import { verifyToken, onlyAdmin } from '../middlewares/auth.js';
import { 
    getIncidenceStats, 
    getMapData, 
    getKPIs 
} from '../controllers/statsController.js';

const router = express.Router();

// Todas estas rutas requieren ser Administrador
router.get('/incidence', verifyToken, onlyAdmin, getIncidenceStats);
router.get('/map', verifyToken, onlyAdmin, getMapData);
router.get('/kpis', verifyToken, onlyAdmin, getKPIs);

export default router;  