import mongoose from 'mongoose';

const contentEmbeddingSchema = new mongoose.Schema({
    contentId: { type: String, required: true },
    embedding: { type: [Number], required: true },
    textChunk: { type: String, required: true }
});

export default mongoose.model('ContentEmbedding', contentEmbeddingSchema);
