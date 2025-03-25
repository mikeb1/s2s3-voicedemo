import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import nba from "nba";

export const teamsTool = createTool({
  id: "get-teams",
  description: "Get current NBA teams",
  inputSchema: z.object({}),
  outputSchema: z.object({
    teams: z.array(
      z.object({
        teamId: z.number(),
        abbreviation: z.string(),
        teamName: z.string(),
        simpleName: z.string(),
        location: z.string(),
        players: z.array(z.object({
          playerId: z.number(),
          firstName: z.string(),
          lastName: z.string(),
          position: z.string(),
        })),
      })
    ),
  }),
  execute: async ({ context }) => {
    const playersByTeam = nba.players.reduce((acc, player) => {
      const teamId = player.teamId;
      if (!acc[teamId]) {
        acc[teamId] = [];
      }

      acc[teamId].push({
        playerId: player.playerId,
        firstName: player.firstName,
        lastName: player.lastName,
        position: player.position,
      });
      return acc;
    }, {});

    const teams = nba.teams.map((team) => ({
      ...team,  
      players: playersByTeam[team.teamId] || [],
    }));

    return { teams };
  },
});

export const playersTool = createTool({
  id: "get-players",
  description: "Get current NBA players for a team",
  inputSchema: z.object({
    team: z.string().describe("Team name"),
  }),
  outputSchema: z.object({
    players: z.array(z.object({
      playerId: z.number(),
      firstName: z.string(),
      lastName: z.string(),
      position: z.string(),
    })),
  }),
  execute: async ({ context }) => {
    return nba.players;
  },
});
