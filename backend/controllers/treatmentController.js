import Treatment from '../models/Treatment.js';

export const saveTreatment = async (req, res) => {
  try {
    const { disease_name, general_notes, detection_id, products } = req.body;
    const newTreatment = new Treatment({
      userId: req.user.id,
      disease_name,
      general_notes,
      detection_id,
      products
    });
    await newTreatment.save();
    res.status(201).json({ treatment: newTreatment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTreatment = async (req, res) => {
  try {
    const { id } = req.params;
    const { disease_name, general_notes, detection_id, products } = req.body;
    const treatment = await Treatment.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { disease_name, general_notes, detection_id, products, updatedAt: new Date() },
      { new: true }
    );
    if (!treatment) return res.status(404).json({ message: 'Tratamiento no encontrado' });
    res.json(treatment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllTreatments = async (req, res) => {
  try {
    const treatments = await Treatment.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(treatments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTreatment = async (req, res) => {
  try {
    const { id } = req.params;
    await Treatment.findOneAndDelete({ _id: id, userId: req.user.id });
    res.json({ message: 'Tratamiento eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};