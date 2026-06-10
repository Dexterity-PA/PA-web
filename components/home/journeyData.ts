// The journey: four homes, in order. Years only, no dates.
export type Stop = {
  id: string;
  place: string;
  region: string;
  year: number;
  lat: number;
  lon: number;
};

export const stops: Stop[] = [
  { id: "nuzvid", place: "Nuzvid", region: "India", year: 2009, lat: 16.79, lon: 80.85 },
  { id: "simi", place: "Simi Valley", region: "California", year: 2011, lat: 34.27, lon: -118.78 },
  { id: "philly", place: "Philadelphia", region: "Pennsylvania", year: 2013, lat: 39.95, lon: -75.17 },
  { id: "chandler", place: "Chandler", region: "Arizona", year: 2015, lat: 33.31, lon: -111.84 },
];

// lng/lat (degrees) → unit sphere point. y up, matches three.js convention.
export function latLonToUnit(lat: number, lon: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return [
    -Math.sin(phi) * Math.cos(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta),
  ];
}
