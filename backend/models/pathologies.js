import mongoose from "mongoose";

const PathologySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: {type: String, required: true},
    treatment: { type: String, required: true},
    alert: { type: Boolean, default: false }
})
const Pathology = mongoose.model("Pathology", PathologySchema, "pathologies");

export default Pathology;