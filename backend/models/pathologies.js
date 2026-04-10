import mongoose from "mongoose";

const PathologySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: {type: String, required: true},
    treatment: { type: String, required: true}
})
const Pathology = mongoose.model("Pathology", PathologySchema, "pathologies");

export default Pathology;