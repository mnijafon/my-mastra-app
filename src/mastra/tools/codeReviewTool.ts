import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const codeReviewTool = createTool({
    id: 'code-review',
    description: '使用 DeepSeek API 对代码进行审查并给出详细建议',
    inputSchema: z.object({
        code: z.string().describe('要审查的源代码'),
    }),
    outputSchema: z.object({
        review: z.string().describe('审查建议'),
    }),
    // @ts-ignore
    execute: async ({ context, env }) => {
        const apiKey = env?.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            throw new Error('DEEPSEEK_API_KEY is not defined');
        }

        const { code } = context;
        const prompt = `请对下面的代码进行代码审查并提供详细的修改建议和原因：\n\n${code}`;

        const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: prompt }],
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`DeepSeek 请求失败 ${res.status}: ${err}`);
        }

        const data = await res.json();
        const review = data.choices?.[0]?.message?.content ?? '未收到审查结果';
        return { review };
    },
});
