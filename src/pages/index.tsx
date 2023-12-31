import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";
import loadable from "@loadable/component";
import { useState } from "react";
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const ForceGraph = loadable(() => import("./forceGraph"));

const START_NODE = "A"
const END_NODE = "G";

export default function Home() {
  const { data: nodesData } = api.graph.getAllNodes.useQuery();
  const { data: linksData } = api.graph.getAllLinks.useQuery();
  const { data: pathData } = api.graph.getPath.useQuery({
    startNodeId: START_NODE,
    endNodeId: END_NODE,
  });

  return (
    <>
      <Head>
        <title>Router</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Router
          </h1>
          <div className="text-2xl text-white">
            <p>{START_NODE} to {END_NODE}</p>
            <p>Cost: {pathData?.cost}</p>
            <p>Path: {pathData?.path}</p>
          </div>
          <div className="flex-col bg-white">
            <ForceGraph
              height={900}
              width={1200}
              graphData={{
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                nodes: nodesData,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                links: linksData,

                // links: [{ source: "A", target: "B", value: 2 }],
              }}
              nodeAutoColorBy="group"
              nodeCanvasObjectMode={() => "after"}
              nodeCanvasObject={(node, ctx, globalScale) => {
                const onPath = pathData?.path.includes(node.id);
                const label = node.id;
                const fontSize = 20 / globalScale;
                ctx.font = `${fontSize}px Sans-Serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = onPath ? "Red" : "black"; //node.color;
                ctx.fillText(label, node.x, node.y);
              }}
              linkCanvasObject={(link, ctx, globalScale) => {
                const label = link.value.toString();
                const fontSize = 20 / globalScale;
                ctx.font = `${fontSize}px Sans-Serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "black";

                const cx = (link.source.x + link.target.x) / 2;
                const cy = (link.source.y + link.target.y) / 2;

                ctx.fillText(label, cx + 1, cy + 1);

                ctx.beginPath();
                ctx.moveTo(link.source.x, link.source.y);
                ctx.lineTo(link.target.x, link.target.y);
                ctx.lineWidth = 0.2;
                ctx.stroke();
              }}
            />
          </div>
        </div>
      </main>
    </>
  );
}
