const SHEET_API = process.env.SHEET_API_URL;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = searchParams.toString();
    const url = `${SHEET_API}?${params}`;

    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "Accept": "application/json",
      },
    });

    // Log what we actually got back
    const text = await res.text();
    console.log("RAW RESPONSE:", text.substring(0, 200));

    const data = JSON.parse(text);
    return Response.json(data);
  } catch (err) {
    console.error("GET error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Sending to sheets:", body);

    const res = await fetch(SHEET_API, {
      method: "POST",
      redirect: "follow",
      headers: {
        "Accept": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    console.log("RAW RESPONSE:", text.substring(0, 200));

    const data = JSON.parse(text);
    return Response.json(data);
  } catch (err) {
    console.error("POST error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
