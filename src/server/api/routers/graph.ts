import { start } from "repl";
import { number, z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const graphRouter = createTRPCRouter({
  getAllNodes: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.node.findMany();
  }),

  getAllLinks: publicProcedure.query(async ({ ctx }) => {
    const linksData = await ctx.prisma.link.findMany();

    const fixed = linksData.map((l) => {
      return {
        value: l.value,
        source: l.sourceId,
        target: l.targetId,
      };
    });

    return fixed;
  }),

  // Based on dijkstras algorithm
  // The current graph has no way of calculating physical distance otherwise would use A* for performance improvements
  // Assuming every node has at least 1 link to the graph
  getPath: publicProcedure
    .input(z.object({ startNodeId: z.string(), endNodeId: z.string() }))
    .query(async ({ ctx, input }) => {
      const nodes = await ctx.prisma.node.findMany();
      const links = await ctx.prisma.link.findMany();

      // Filter out closed links
      const openLinks = links.filter((l) => !l.isClosed);

      const startNode = await ctx.prisma.node.findUnique({
        where: { id: input.startNodeId },
      });
      const endNode = await ctx.prisma.node.findUnique({
        where: { id: input.endNodeId },
      });

      if (!startNode || !endNode)
        throw new Error("Couldn't find start or end node.");

      const visitedNodes: string[] = [];

      let unVisitedNodes = nodes.map((n) => n.id);

      // All other nodes are infinity distance bc we haven't seen them yet
      const distanceTable = new Map(nodes.map((n) => [n.id, Number.MAX_VALUE]));

      // Set the starting node to 0 distance
      distanceTable.set(startNode.id, 0);

      // Keep track of paths
      const prevNodeTable = new Map(nodes.map((n) => [n.id, ""]));

      while (unVisitedNodes.length > 0) {
        // convert map to an object
        const distanceTableObj = Object.entries(
          Object.fromEntries(distanceTable)
        );

        // Pick a node that hasn't already been visited, with lowest distance
        const [currentNode] = distanceTableObj
          .filter((o) => !visitedNodes.includes(o[0]))
          .sort(([, v1], [, v2]) => v1 - v2);

        if (!currentNode)
          throw new Error("Couldn't find next node (currentNode)");

        // Find all links
        let linksToCheck = openLinks.filter(
          (l) => l.sourceId === currentNode[0] || l.targetId == currentNode[0]
        );

        // Filter out links of nodes that have already been visited
        linksToCheck = linksToCheck.filter(
          (l) =>
            !(
              visitedNodes.includes(l.targetId) ||
              visitedNodes.includes(l.sourceId)
            )
        );

        // calculate and update found distances
        for (const l of linksToCheck) {
          // We dont know if the sourceId or targetId is the currentNode
          const nextNode = (l.sourceId + l.targetId).replace(
            currentNode[0],
            ""
          );

          // Only add if the combined distance is less than current value
          const distWithModifiers =
            distanceTable.get(currentNode[0])! + l.value + l.traffic;

          if (distWithModifiers < distanceTable.get(nextNode)!) {
            distanceTable.set(nextNode, distWithModifiers);
            prevNodeTable.set(nextNode, currentNode[0]);
          }
        }

        // Update our lists
        visitedNodes.push(currentNode[0]);
        unVisitedNodes = unVisitedNodes.filter((n) => n !== currentNode[0]);
      }

      // Build path based on end node
      let currentNode = endNode.id;
      const orderedPath: string[] = [];

      while (startNode.id !== currentNode) {
        orderedPath.push(currentNode);

        currentNode = prevNodeTable.get(currentNode)!;
      }

      orderedPath.push(startNode.id);
      orderedPath.reverse();

      return { path: orderedPath, cost: distanceTable.get(endNode.id) };
    }),
});
