import archiver from 'archiver';
import axios from 'axios';
import Detections from '../models/Detection.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Almacenamiento temporal de trabajos (en producción usa Redis)
const exportJobs = new Map();

// Iniciar un trabajo de exportación (con filtros de fecha)
export const startExportDataset = async (req, res) => {
  console.log('📦 Iniciando exportación...');
  try {
    const { startDate, endDate } = req.query; // recibimos fechas desde el frontend
    const jobId = uuidv4();
    console.log(`Job ID: ${jobId} | Fechas: ${startDate || 'sin inicio'} - ${endDate || 'sin fin'}`);
    
    exportJobs.set(jobId, {
      status: 'preparing',
      total: 0,
      processed: 0,
      message: 'Iniciando exportación...',
      startDate,
      endDate
    });

    // Ejecutar la exportación en segundo plano
    processExport(jobId, startDate, endDate).catch(err => {
      console.error(`Error en job ${jobId}:`, err);
      exportJobs.set(jobId, {
        status: 'error',
        message: err.message
      });
    });

    res.json({ jobId });
  } catch (error) {
    console.error('Error en startExportDataset:', error);
    res.status(500).json({ message: error.message });
  }
};

// Consultar el estado de un trabajo
export const getExportStatus = async (req, res) => {
  const { jobId } = req.params;
  const job = exportJobs.get(jobId);
  if (!job) {
    return res.status(404).json({ message: 'Trabajo no encontrado' });
  }
  res.json(job);
};

// Descargar el ZIP una vez completado
export const downloadExport = async (req, res) => {
  const { jobId } = req.params;
  const job = exportJobs.get(jobId);
  if (!job || job.status !== 'completed') {
    return res.status(404).json({ message: 'Archivo no disponible' });
  }
  
  // Usamos res.download con la ruta absoluta
  res.download(job.filePath, `dataset_${jobId}.zip`, (err) => {
    if (err) {
      console.error('Error enviando archivo:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error al descargar el archivo' });
      }
    }
    // Limpiar el trabajo después de enviar
    exportJobs.delete(jobId);
    // Eliminar el archivo temporal
    fs.unlink(job.filePath, (unlinkErr) => {
      if (unlinkErr) console.error('Error eliminando archivo temporal:', unlinkErr);
    });
  });
};

// Función asíncrona que procesa la exportación con filtros de fecha
async function processExport(jobId, startDate, endDate) {
  console.log(`🔄 Procesando job ${jobId}`);
  const job = exportJobs.get(jobId);
  try {
    // Construir filtro base: aprobadas = true
    let filter = { approved: true };
    
    // Aplicar filtro de fecha inicio
    if (startDate && startDate !== '') {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filter.createdAt = { $gte: start };
    }
    // Aplicar filtro de fecha fin
    if (endDate && endDate !== '') {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { ...filter.createdAt, $lte: end };
    }
    
    const detections = await Detections.find(filter).populate('pathologyId', 'name');
    const total = detections.length;
    console.log(`📊 Encontradas ${total} detecciones aprobadas en el rango`);
    
    if (total === 0) {
      job.status = 'error';
      job.message = 'No hay imágenes aprobadas en el rango de fechas seleccionado';
      return;
    }

    job.total = total;
    job.status = 'processing';
    job.message = 'Preparando archivos...';

    // Crear carpeta temporal si no existe
    const tempDir = path.join(process.cwd(), 'temp_exports');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
      console.log(`📁 Creada carpeta temporal: ${tempDir}`);
    }
    const zipPath = path.join(tempDir, `${jobId}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);
    job.filePath = zipPath;

    // Crear archivo CSV con metadatos
    let csvContent = 'id,pathology,confidence,date,latitude,longitude,imageUrl\n';
    for (const det of detections) {
      const coords = det.location?.coordinates || [];
      csvContent += `${det._id},"${det.pathologyId?.name || ''}",${det.confidence || 0},${det.createdAt},${coords[1] || ''},${coords[0] || ''},${det.imageUrl}\n`;
    }
    archive.append(csvContent, { name: 'metadata.csv' });

    // Procesar cada imagen
    let processed = 0;
    for (const det of detections) {
      try {
        const response = await axios({
          method: 'GET',
          url: det.imageUrl,
          responseType: 'stream',
          timeout: 30000
        });
        const extension = det.imageUrl.split('.').pop().split('?')[0] || 'jpg';
        const fileName = `${det._id}.${extension}`;
        archive.append(response.data, { name: `images/${fileName}` });
        processed++;
        job.processed = processed;
        job.message = `Procesando imagen ${processed} de ${total}`;
        console.log(`✅ Procesada ${processed}/${total}: ${det._id}`);
      } catch (err) {
        console.error(`Error en imagen ${det._id}:`, err.message);
        // Continuar con la siguiente
      }
    }

    archive.finalize();
    await new Promise((resolve, reject) => {
      output.on('close', resolve);
      archive.on('error', reject);
    });

    job.status = 'completed';
    job.message = 'Exportación completada';
    console.log(`🎉 Exportación completada: ${zipPath}`);
  } catch (error) {
    console.error('❌ Error en processExport:', error);
    job.status = 'error';
    job.message = error.message;
  }
}