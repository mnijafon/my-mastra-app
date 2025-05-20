// src/worker.ts
import { codeReviewTool } from './mastra/tools/codeReviewTool';

interface Env {
    DEEPSEEK_API_KEY: string;
}

// CORS 头部，允许 Pages 域名访问
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': 'https://ryuukeihou.chat',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
};

// 处理 OPTIONS 请求（CORS 预检）
const handleOptionsRequest = () =>
    new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
    });

// 检查请求来源
const checkOrigin = (request: Request): Response | null => {
    const origin = request.headers.get('Origin');
    if (origin !== 'https://ryuukeihou.chat') {
        return new Response(JSON.stringify({ error: '未经授权的来源' }), {
            status: 403,
            headers: CORS_HEADERS,
        });
    }
    return null;
};

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);

        // 处理 CORS 预检请求
        if (request.method === 'OPTIONS') {
            return handleOptionsRequest();
        }

        // 验证来源
        const originCheck = checkOrigin(request);
        if (originCheck) {
            return originCheck;
        }

        try {
            const pathname = url.pathname;

            // 根路径测试
            if (pathname === '/' || pathname === '/index.html') {
                return new Response('Hello from Mastra Worker!', {
                    status: 200,
                    headers: CORS_HEADERS,
                });
            }

            // 处理 /code-review 端点
            if (pathname === '/code-review') {
                if (request.method !== 'POST') {
                    return new Response(JSON.stringify({ error: '仅支持 POST 请求' }), {
                        status: 405,
                        headers: CORS_HEADERS,
                    });
                }

                // @ts-ignore
                const body = await request.json<{ code: string }>();
                const { code } = body;

                if (!code) {
                    return new Response(JSON.stringify({ error: '缺少 code 参数' }), {
                        status: 400,
                        headers: CORS_HEADERS,
                    });
                }

                // 调用 codeReviewTool 处理请求
                // @ts-ignore
                const result = await codeReviewTool.execute({ context: { code }, env });
                return new Response(JSON.stringify({ content: result.review }), {
                    status: 200,
                    headers: CORS_HEADERS,
                });
            }

            // 未找到路由
            return new Response(JSON.stringify({ error: '404 Not Found' }), {
                status: 404,
                headers: CORS_HEADERS,
            });
        } catch (err: any) {
            console.error('Error:', err);
            return new Response(JSON.stringify({ error: `Error: ${err.message}` }), {
                status: 500,
                headers: CORS_HEADERS,
            });
        }
    },
};