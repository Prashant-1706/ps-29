import mongoose from 'mongoose';

const editLogSchema = new mongoose.Schema({
    contentId: { type: String, required: true },
    editorId: { type: String, required: true },
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('EditLog', editLogSchema);
