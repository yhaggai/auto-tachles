// Fictional demo fixtures, authored manually; no AutoTel data or network calls.
const vehicles = [
  {
    id: 900001,
    latitude: 32.0853,
    longitude: 34.7818,
    discount: 50,
    fuel: "high",
  },
  {
    id: 900002,
    latitude: 32.079,
    longitude: 34.775,
    discount: 30,
    fuel: "med",
  },
  {
    id: 900003,
    latitude: 32.091,
    longitude: 34.777,
    discount: 20,
    fuel: "low",
  },
  {
    id: 900004,
    latitude: 32.073,
    longitude: 34.781,
    discount: 50,
    fuel: "high",
  },
  {
    id: 900005,
    latitude: 32.099,
    longitude: 34.789,
    discount: 30,
    fuel: "med",
  },
  {
    id: 900006,
    latitude: 32.064,
    longitude: 34.773,
    discount: 20,
    fuel: "low",
  },
  {
    id: 900007,
    latitude: 32.087,
    longitude: 34.795,
    discount: 50,
    fuel: "high",
  },
  {
    id: 900008,
    latitude: 32.103,
    longitude: 34.781,
    discount: 30,
    fuel: "med",
  },
  {
    id: 900009,
    latitude: 32.069,
    longitude: 34.786,
    discount: 20,
    fuel: "low",
  },
];

export async function GET() {
  return Response.json(
    {
      vehicles,
      total: vehicles.length,
      demo: true,
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
