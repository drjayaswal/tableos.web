import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (type === "full") {
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    if (!lat || !lon) return NextResponse.json({ area: "Unknown" }, { status: 400 });

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
      { headers: { "User-Agent": "HaveExpert/1.0" } },
    );
    if (!res.ok) return NextResponse.json({ area: "Unknown" });
    const data = await res.json();
    const addr = data.address ?? {};
    const parts = [
      addr.house_number || addr.amenity,
      addr.road,
      addr.suburb || addr.neighbourhood,
      addr.city || addr.town,
      addr.postcode,
    ].filter(Boolean);
    return NextResponse.json({ area: parts.join(", ") || data.display_name || "Unknown" });
  }

  if (type === "coords") {
    const address = searchParams.get("address");
    if (!address) return NextResponse.json({ error: "Missing address" }, { status: 400 });

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${address}&limit=1`,
      { headers: { "User-Agent": "HaveExpert/1.0" } },
    );
    if (!res.ok) return NextResponse.json(null);
    const data = await res.json();
    if (!data.length) return NextResponse.json(null);
    return NextResponse.json({ lat: data[0].lat, lon: data[0].lon });
  }

  if (type === "suggestions") {
    const address = searchParams.get("address");
    if (!address) return NextResponse.json({ results: [] });

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${address}&limit=3`,
      { headers: { "User-Agent": "HaveExpert/1.0" } },
    );
    if (!res.ok) return NextResponse.json({ results: [] });
    const data = await res.json();
    return NextResponse.json({ results: data });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}