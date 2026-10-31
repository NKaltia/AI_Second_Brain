import type { Response } from 'express';
import type { UserRequest } from '../interfaces/express.interface.js';
import { askBodySchema } from '../validation/schemas.js';
import { parseBody } from '../validation/parse.js';
import { AskService } from '../services/ask.service.js';

const askService = new AskService();

export const askQuestion = async (req: UserRequest, res: Response) => {
    const { question, history } = parseBody(askBodySchema, req.body);

    const result = await askService.ask({
        userId: req.user!.userId,
        question,
        history,
        log: req.log,
        requestId: typeof req.id === 'string' ? req.id : undefined,
    });

    res.json({
        answer: result.answer,
        sources: result.sources,
        newNoteSaved: result.newNoteSaved,
        notesSearchSkipped: result.notesSearchSkipped,
        notice: result.notice,
    });
};
