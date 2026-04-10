import Detection from "../models/Detection.js";
import User from "../models/users.js";
import Pathology from "../models/pathologies.js";

// Función auxiliar para construir el filtro de fecha
const buildDateFilter = (startDate, endDate) => {
    let filter = {};
    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
    } else {
        // OPCIONAL: Si no mandan fechas, filtrar por defecto los últimos 30 días
        filter.createdAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    }
    return filter;
};

// 1. Incidencia con Filtros (Línea de tiempo)
export const getIncidenceStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const dateFilter = buildDateFilter(startDate, endDate);

        const stats = await Detection.aggregate([
            {
                // ETAPA 1: Filtrar por fecha ANTES de agrupar (Muy importante para el rendimiento)
                $match: dateFilter
            },
            {
                $group: {
                    _id: {
                        day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        pathology: "$pathologyId"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "pathologies", 
                    localField: "_id.pathology",
                    foreignField: "_id",
                    as: "pathologyInfo"
                }
            },
            { $unwind: "$pathologyInfo" },
            {
                $group: {
                    _id: "$_id.day",
                    detecciones: {
                        $push: { k: "$pathologyInfo.name", v: "$count" }
                    }
                }
            },
            {
                $project: {
                    name: "$_id",
                    data: { $arrayToObject: "$detecciones" }
                }
            },
            { $sort: { name: 1 } }
        ]);

        const formatted = stats.map(s => ({ name: s.name, ...s.data }));
        res.status(200).json(formatted);
    } catch (error) {
        res.status(500).json({ message: "Error en estadísticas", error: error.message });
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
export const getGeneralKPIs = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const dateFilter = buildDateFilter(startDate, endDate);

        const [totalUsers, activeUsers, detectionsInPeriod] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ lastSync: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
            Detection.countDocuments(dateFilter) // Solo cuenta las detecciones del rango elegido
        ]);

        res.status(200).json({
            totalUsers,
            activeUsers,
            detectionsInPeriod,
        });
    } catch (error) {
        res.status(500).json({ message: "Error en KPIs", error: error.message });
    }
};