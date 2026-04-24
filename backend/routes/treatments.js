import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import { saveTreatment, updateTreatment, getAllTreatments, deleteTreatment } from '../controllers/treatmentController.js';

const router = express.Router();
router.use(verifyToken);

router.post('/', saveTreatment);
router.put('/:id', updateTreatment);
router.get('/', getAllTreatments);
router.delete('/:id', deleteTreatment);

export default router;