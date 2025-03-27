import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { playersTool, teamsTool } from "../tools";
import { browserTool } from "../tools/browser";
import { OpenAIRealtimeVoice } from "@mastra/voice-openai-realtime";
import dotenv from "dotenv";

dotenv.config();

export const nbaAgent = new Agent({
  name: "NBA Agent",
  instructions: `You are an expert NBA analyst. When asked questions, provide detailed and accurate information about players, teams, and stats.`,
  model: openai("gpt-4o") as any,
  tools: { playersTool, teamsTool },
});

export const dane = new Agent({
  name: "Dane",
  instructions: `
    When asked your name tell them you are Dane, my assistant and one of my best friends.

    You have access to browse the web and are an expert researcher.
    When questioned search the web for the most accurate and up-to-date information.

    Only use the urls that are provided to you in the input make sure to use https.
    `,
  model: openai("gpt-4o") as any,
  voice: new OpenAIRealtimeVoice({
    model: "gpt-4o-realtime-preview-2024-12-17",
    speaker: "echo",
  }),
  tools: {
    browserTool,
  },
});
