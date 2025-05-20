import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { CloudflareDeployer } from "@mastra/deployer-cloudflare";
import { weatherAgent } from './agents';
import { codeReviewAgent } from './agents/codeReviewAgent';

export const mastra = new Mastra({
  agents: {
    weatherAgent,
    codeReviewAgent
  },
  deployer: new CloudflareDeployer({
    scope: "f5154d0f7049f6b067e2172257b535d0",
    projectName: "my-mastra-app",
    // 增加workerNamespace的话会被cloudflare认为是企业用户，要付费的功能
    auth: {
      apiToken: process.env.CLOUDFLARE_API_TOKEN
    },
  }),
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
