import Detection from "../models/Detection.js";
import User from "../models/users.js";
import Pathology from "../models/pathologies.js";

// Función auxiliar para construir el filtro de fecha
const buildDateFilter = (startDate, endDate) => {
    let filter = {};
    // Verificamos que los strings no estén vacíos antes de crear la fecha
    if ((startDate && startDate !== "") || (endDate && endDate !== "")) {
        filter.createdAt = {};
        if (startDate && startDate !== "") filter.createdAt.$gte = new Date(startDate);
        if (endDate && endDate !== "") filter.createdAt.$lte = new Date(endDate);
    } else {
        // Por defecto: últimos 30 días
        filter.createdAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    }
    return filter;
};

// 1. Incidencia con Filtros (Línea de tiempo)
export const getIncidenceStats = async (req, res) => {
    try {
        const { startDate, endDate, groupBy = 'day' } = req.query; // 'day', 'week', 'month'
        const dateFilter = buildDateFilter(startDate, endDate);

        // Definimos el formato de fecha según la elección
        let format = "%Y-%m-%d"; // Por defecto día
        if (groupBy === 'week') format = "%Y-W%U"; // Año y número de semana
        if (groupBy === 'month') format = "%Y-%m";  // Año y mes

        const stats = await Detection.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: {
                        period: { $dateToString: { format: format, date: "$createdAt" } },
                        pathology: "$pathologyId"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'pathologies',
                    localField: '_id.pathology',
                    foreignField: '_id',
                    as: 'pathologyInfo'
                }
            }
        ]);

        // Procesar datos para Recharts
        const chartMap = {};
        stats.forEach(item => {
            const period = item._id.period;
            if (!chartMap[period]) chartMap[period] = { name: period };
            
            const diseaseName = item.pathologyInfo[0]?.name || "Desconocido";
            chartMap[period][diseaseName] = item.count;
        });

        // Ordenar por fecha antes de enviar
        const sortedData = Object.values(chartMap).sort((a, b) => a.name.localeCompare(b.name));
        res.json(sortedData);
    } catch (error) {
        res.status(500).json({ message: "Error", error: error.message });
    }
};
// Nueva función para el Pie Chart específicamente
export const getPieStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const dateFilter = buildDateFilter(startDate, endDate);

        const stats = await Detection.aggregate([
            { $match: dateFilter },
            { $group: { _id: "$pathologyId", value: { $sum: 1 } } },
            { 
                $lookup: { 
                    from: 'pathologies', 
                    localField: '_id', 
                    foreignField: '_id', 
                    as: 'info' 
                } 
            },
            { $project: { name: { $arrayElemAt: ["$info.name", 0] }, value: 1 } }
        ]);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// 2. Datos del Mapa con Filtros
export const getMapData = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const dateFilter = buildDateFilter(startDate, endDate);

        // Aplicamos el filtro en el find()
        const mapPoints = await Detection.find(dateFilter, 'location confidence createdAt')
            .populate('pathologyId', 'name')
            .lean();

        const formattedPoints = mapPoints.map(p => ({
            id: p._id,
            lat: p.location.coordinates[1],
            lng: p.location.coordinates[0],
            disease: p.pathologyId?.name || "Desconocido",
            confidence: p.confidence,
            date: p.createdAt
        }));

        res.status(200).json(formattedPoints);
    } catch (error) {
        res.status(500).json({ message: "Error en mapa", error: error.message });
    }
};

// 3. KPIs rápidos (Afectados por el filtro de tiempo)
export const getKPIs = async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const totalDetections = await Detection.countDocuments();
      const totalPathologies = await Pathology.countDocuments();
      const avgConfidenceAgg = await Detection.aggregate([
        { $group: { _id: null, avgConfidence: { $avg: "$confidence" } } }
      ]);
      const avgConfidence = avgConfidenceAgg[0]?.avgConfidence || 0;
      res.json({ totalUsers, totalDetections, totalPathologies, avgConfidence });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };