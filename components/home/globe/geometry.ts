import { BufferGeometry, Float32BufferAttribute } from "three";
import { latLonToUnit } from "../journeyData";
import { coastline } from "../journeyCoastline";

// Unit sphere. Both the Journey globe and the hero atmosphere globe build their
// line geometry from these, so the heavy coastline topojson is decoded once and
// never duplicated.
export const R = 1;

// Lat/lon graticule as a single LineSegments buffer: parallels every 15°,
// meridians every 15°, each chord split into ~6° steps so the lines hug the sphere.
export function graticuleGeometry(): BufferGeometry {
  const p: number[] = [];
  const push = (lat: number, lon: number) => {
    const u = latLonToUnit(lat, lon);
    p.push(u[0] * R, u[1] * R, u[2] * R);
  };
  for (let lat = -75; lat <= 75; lat += 15)
    for (let lon = -180; lon < 180; lon += 6) {
      push(lat, lon);
      push(lat, lon + 6);
    }
  for (let lon = -180; lon < 180; lon += 15)
    for (let lat = -84; lat < 84; lat += 6) {
      push(lat, lon);
      push(lat + 6, lon);
    }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(p, 3));
  return g;
}

// Continent outlines as LineSegments, lifted a hair off the sphere so they sit
// above the graticule. radius lets callers nudge the lift if needed.
export function coastlineGeometry(radius = R * 1.001): BufferGeometry {
  const p: number[] = [];
  for (const line of coastline)
    for (let k = 0; k < line.length - 1; k++) {
      const a = latLonToUnit(line[k][1], line[k][0]);
      const b = latLonToUnit(line[k + 1][1], line[k + 1][0]);
      p.push(
        a[0] * radius, a[1] * radius, a[2] * radius,
        b[0] * radius, b[1] * radius, b[2] * radius,
      );
    }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(p, 3));
  return g;
}
