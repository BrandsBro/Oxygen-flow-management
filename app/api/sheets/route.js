const SHEET_API = process.env.SHEET_API_URL;

const cache = new Map();
const CACHE_TTL = 30 * 1000;

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.time > CACHE_TTL) { cache.delete(key); return null; }
  return entry.data;
}

function setCached(key, data) {
  cache.set(key, { data, time: Date.now() });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = searchParams.toString();
    const action = searchParams.get("action");

    // Never cache these — always fresh
    const neverCache = [
      "getAttendance", "getTodayAttendance",
      "getSales", "getProducts", "getWebsites"
    ];

    // Only cache these
    const cacheable = ["getTickets", "getMembers", "getStats", "getDashboardData", "getInvoices", "getPermissions"];

    if (!neverCache.includes(action) && cacheable.includes(action)) {
      const cached = getCached(params);
      if (cached) return Response.json(cached, { headers: { "X-Cache": "HIT" } });
    }

    const res = await fetch(`${SHEET_API}?${params}`, {
      method: "GET",
      redirect: "follow",
    });

    const text = await res.text();
    const data = JSON.parse(text);

    if (cacheable.includes(action)) setCached(params, data);

    return Response.json(data);
  } catch (err) {
    console.error("GET error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const res = await fetch(SHEET_API, {
      method: "POST",
      redirect: "follow",
      body: JSON.stringify(body),
    });

    const text = await res.text();
    const data = JSON.parse(text);

    // Clear all cache on any write
    cache.clear();

    return Response.json(data);
  } catch (err) {
    console.error("POST error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
