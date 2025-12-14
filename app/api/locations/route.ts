import { NextResponse } from "next/server";

import { COUNTRIES } from "./countries";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("query") ?? "").toLowerCase().trim();

  if (!query) {
    return NextResponse.json({ options: COUNTRIES.slice(0, 10) });
  }

  const matches = COUNTRIES.filter((country) =>
    country.toLowerCase().includes(query)
  ).slice(0, 15);

  return NextResponse.json({ options: matches });
}
