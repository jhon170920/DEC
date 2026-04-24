import mongoose from 'mongoose';

const TreatmentProductSchema = new mongoose.Schema({
  product_name: { type: String, required: true },
  dose: { type: String },
  application_date: { type: Date },
  notes: { type: String }
});

const TreatmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  disease_name: { type: String, required: true },
  general_notes: { type: String },
  detection_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Detection' },
  products: [TreatmentProductSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Treatment', TreatmentSchema);