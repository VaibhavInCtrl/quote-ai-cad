import { createRequire } from "module";

import { computeGeometryMetrics } from "./geometry.js";

const require = createRequire(import.meta.url);
const stlParser = require("stl-parser");

function normalizeTriangle(polygon) {
  if (!polygon?.vertices || polygon.vertices.length < 3) {
    return null;
  }

  return polygon.vertices.slice(0, 3).map((vertex) => [
    Number(vertex.x),
    Number(vertex.y),
    Number(vertex.z),
  ]);
}

export async function analyzeStlBuffer(buffer) {
  const mesh = await new Promise((resolve, reject) => {
    const parser = stlParser(buffer);

    parser.once("data", resolve);
    parser.once("error", reject);
  });

  const faceList = mesh?.faces ?? mesh?.polygons ?? [];
  const triangles = faceList
    .map(normalizeTriangle)
    .filter(Boolean);

  if (!triangles.length) {
    throw new Error("Unable to extract triangles from STL file.");
  }

  const metrics = computeGeometryMetrics(triangles);

  return {
    ...metrics,
    file_type: "stl",
    triangle_count: triangles.length,
    units_assumption:
      "STL files are unitless; QuoteAI assumes source dimensions are millimeters.",
  };
}
