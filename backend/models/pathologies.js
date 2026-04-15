import mongoose from "mongoose";

const RecommendationSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  activeIngredient: { type: String },
  dose: { type: String, required: true }, // ej: "2 L/ha"
  price: { type: String }, // ej: "$120.000"
  supplier: { type: String }, // ej: "Bayer"
  link: { type: String } // URL de compra
});

const PathologySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  treatment: { type: String, required: true },
  alert: { type: Boolean, default: false },
  imageUrl: { type: String, default: '' }, // URL de Cloudinary
  recommendations: [RecommendationSchema] // array de insumos
}, { timestamps: true });

const Pathology = mongoose.model("Pathology", PathologySchema, "pathologies");
export default Pathology;