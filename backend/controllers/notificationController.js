import User from '../models/users.js';

// Guardar el token push del usuario
export const savePushToken = async (req, res) => {
  try {
    const { pushToken } = req.body;
    if (!pushToken) {
      return res.status(400).json({ message: 'Token requerido' });
    }

    // Agregar token al array sin duplicados
    await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { pushTokens: pushToken } }
    );

    res.json({ message: 'Token guardado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al guardar token' });
  }
};

// Enviar notificación a todos los usuarios (o a un segmento)
export const sendNotificationToAll = async (req, res) => {
  try {
    const { title, body, data } = req.body;
    if (!title || !body) {
      return res.status(400).json({ message: 'Faltan título o cuerpo' });
    }

    // Obtener todos los tokens de usuarios (excluir admins si quieres)
    const users = await User.find({ pushTokens: { $exists: true, $ne: [] } });
    const tokens = users.flatMap(u => u.pushTokens);

    if (tokens.length === 0) {
      return res.status(200).json({ message: 'No hay tokens registrados' });
    }

    // Preparar mensajes para Expo
    const messages = tokens.map(token => ({
      to: token,
      sound: 'default',
      title,
      body,
      data: data || {},
    }));

    // Enviar en lotes de 100 (recomendado por Expo)
    const chunkSize = 100;
    for (let i = 0; i < messages.length; i += chunkSize) {
      const chunk = messages.slice(i, i + chunkSize);
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chunk),
      });
      const result = await response.json();
      if (result.errors) {
        for (const error of result.errors) {
            if (err.error === 'DeviceNotRegistered') {
                //ELiminar token de la base de datos
                await User.updateMany(
                    {pushTokens: err.details?.error },
                    {$pull: {pushTokens: err.details.error}}
                );
            }
        }
      }
    }

    res.json({ message: `Notificación enviada a ${tokens.length} dispositivos` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};