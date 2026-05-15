import { NextResponse } from "next/server";
import { randomNameOptions } from "@/lib/ghanor/names";
import type { RaceId } from "@/lib/ghanor/types";

const races: RaceId[] = ["humano", "anao", "elfo", "gigante", "hobgoblin", "meio_elfo", "aberrante"];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const race = url.searchParams.get("race") as RaceId | null;
  const selectedRace = race && races.includes(race) ? race : "humano";
  return NextResponse.json({ names: randomNameOptions(selectedRace, 6) });
}
