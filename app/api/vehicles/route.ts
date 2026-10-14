export async function GET() {
  try {
    const res = await fetch(
      "https://autotelpublicapiprod.gototech.co/api/FreeVehicles/vFlatDynp?Zoom=11&longitude=34.7818&latitude=32.08535&requestType=5",
      {
        signal: AbortSignal.timeout(20000),
        headers: { Accept: "application/json" },
        cache: "no-store",
      },
    );
    if (!res.ok) throw new Error("Upstream unavailable");
    const data: any = await res.json();
    if (!Array.isArray(data.a2B)) throw new Error("Unexpected response");
    const vehicles = data.a2B
      .filter(
        (v: any) =>
          v.vTypeGroup === "car" &&
          Number(v.dynp_dis) > 0 &&
          Number.isFinite(v.latitude) &&
          Number.isFinite(v.longitude),
      )
      .map((v: any) => ({
        id: v.id,
        latitude: v.latitude,
        longitude: v.longitude,
        discount: Number(v.dynp_dis),
        fuel: v.fuelLevel,
      }));
    return Response.json(
      { vehicles, total: data.a2B.length, updatedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      {
        error:
          "AutoTel is temporarily unavailable. Please try refreshing in a moment.",
      },
      { status: 502 },
    );
  }
}
