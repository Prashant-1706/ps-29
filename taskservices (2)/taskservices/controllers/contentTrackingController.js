import express from 'express';
import ContentVersion from '../models/contentVersion.js';
import EditLog from '../models/editLog.js';
import ContentEmbedding from '../models/contentEmbedding.js';
import { pipeline } from '@xenova/transformers';

const router = express.Router();

let extractor;
async function getExtractor() {
    if (!extractor) {
        extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return extractor;
}

function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0.0;
    let normA = 0.0;
    let normB = 0.0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

router.post('/save_version', async (req, res) => {
    try {
        const { contentId, versionNumber, body, editorId, action } = req.body;
        
        const newVersion = new ContentVersion({ contentId, versionNumber, body });
        await newVersion.save();

        const log = new EditLog({ contentId, editorId, action });
        await log.save();

        const extract = await getExtractor();
        const output = await extract(body, { pooling: 'mean', normalize: true });
        const embeddingArray = Array.from(output.data);

        await ContentEmbedding.findOneAndUpdate(
            { contentId }, 
            { contentId, embedding: embeddingArray, textChunk: body }, 
            { upsert: true, new: true }
        );

        res.status(200).json({ code: 200, message: "Version saved and embedded successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, message: "Error saving version" });
    }
});

router.post('/semantic_search', async (req, res) => {
    try {
        const { query, threshold = 0.3 } = req.body;
        
        const extract = await getExtractor();
        const output = await extract(query, { pooling: 'mean', normalize: true });
        const queryVector = Array.from(output.data);

        const allEmbeddings = await ContentEmbedding.find({});
        
        const results = allEmbeddings.map(doc => {
            const score = cosineSimilarity(queryVector, doc.embedding);
            return { contentId: doc.contentId, textChunk: doc.textChunk, score };
        }).filter(doc => doc.score >= threshold)
          .sort((a, b) => b.score - a.score);

        res.status(200).json({ code: 200, data: results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, message: "Error performing search" });
    }
});

router.get('/versions/:contentId', async (req, res) => {
    try {
        const { contentId } = req.params;
        const versions = await ContentVersion.find({ contentId }).sort({ versionNumber: -1 });
        res.status(200).json({ code: 200, data: versions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, message: "Error retrieving versions" });
    }
});

router.delete('/delete/:contentId', async (req, res) => {
    try {
        const { contentId } = req.params;
        await ContentVersion.deleteMany({ contentId });
        await EditLog.deleteMany({ contentId });
        await ContentEmbedding.deleteOne({ contentId });
        res.status(200).json({ code: 200, message: "Versions and embeddings deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, message: "Error deleting versions and embeddings" });
    }
});

export default router;
