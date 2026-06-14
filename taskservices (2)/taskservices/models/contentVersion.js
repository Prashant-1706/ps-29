import mongoose from 'mongoose';

const contentVersionSchema = new mongoose.Schema({
    contentId: { type: String, required: true },
    versionNumber: { type: Number, required: true },
    body: { type: String, required: true },
    savedAt: { type: Date, default: Date.now }
});

export default mongoose.model('ContentVersion', contentVersionSchema);
