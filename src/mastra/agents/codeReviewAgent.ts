import { deepseek } from '@ai-sdk/deepseek';
import { Agent } from '@mastra/core/agent';
import { codeReviewTool } from '../tools/codeReviewTool';

export const codeReviewAgent = new Agent({
    name: 'Code Review Agent',
    instructions: `
    你是一个专业的代码审查助手，负责对用户提供的源代码进行审查，并指出潜在问题、优化建议和最佳实践。
    当收到代码时：
    - 使用 codeReviewTool 调用 DeepSeek API
    - 返回简洁且可执行的审查建议
    - 不要包含与审查无关的其他内容
  `,
    model: deepseek('deepseek-chat'),
    tools: { codeReviewTool },
});
