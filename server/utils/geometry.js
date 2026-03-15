function subtract(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function magnitude(vector) {
  return Math.sqrt(
    vector[0] * vector[0] + vector[1] * vector[1] + vector[2] * vector[2],
  );
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function round(value, digits = 2) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Number(value.toFixed(digits));
}

export function computeGeometryMetrics(triangles, providedBoundingBox) {
  if (!Array.isArray(triangles) || triangles.length === 0) {
    throw new Error("No triangle geometry found in STL.");
  }

  const min = providedBoundingBox?.min
    ? [...providedBoundingBox.min]
    : [Infinity, Infinity, Infinity];
  const max = providedBoundingBox?.max
    ? [...providedBoundingBox.max]
    : [-Infinity, -Infinity, -Infinity];

  let surfaceArea = 0;
  let signedVolume = 0;

  for (const [a, b, c] of triangles) {
    for (const vertex of [a, b, c]) {
      min[0] = Math.min(min[0], vertex[0]);
      min[1] = Math.min(min[1], vertex[1]);
      min[2] = Math.min(min[2], vertex[2]);
      max[0] = Math.max(max[0], vertex[0]);
      max[1] = Math.max(max[1], vertex[1]);
      max[2] = Math.max(max[2], vertex[2]);
    }

    const ab = subtract(b, a);
    const ac = subtract(c, a);
    const crossProduct = cross(ab, ac);

    surfaceArea += magnitude(crossProduct) * 0.5;
    signedVolume += dot(a, cross(b, c)) / 6;
  }

  const dimensions = {
    x: round(max[0] - min[0]),
    y: round(max[1] - min[1]),
    z: round(max[2] - min[2]),
  };

  return {
    bounding_box: {
      min: min.map((value) => round(value)),
      max: max.map((value) => round(value)),
    },
    dimensions_mm: dimensions,
    volume_mm3: round(Math.abs(signedVolume)),
    surface_area_mm2: round(surfaceArea),
  };
}
