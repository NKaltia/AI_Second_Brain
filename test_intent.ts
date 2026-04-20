import 'dotenv/config';
import { AIService } from './src/services/ai.service.js';

async function test() {
    const ai = new AIService();
    try {
        console.log("Testing intent analysis...");
        const res = await ai.analyzeIntentAndExpand("Какие у нас есть заметки?");
        console.log("Result:", res);

        console.log("Testing embedding...");
        const emb = await ai.generateEmbedding(res.expandedQuery || "default");
        console.log("Embedding generated. Length:", emb.length);

    } catch (e: any) {
        console.error("Test failed:", e);
    }
}

test().catch(console.error);
