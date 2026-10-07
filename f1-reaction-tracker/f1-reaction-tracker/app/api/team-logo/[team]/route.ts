import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { TEAMS } from "@/lib/teams";

/** Drop logo images into this folder (project root). Read on every request, so new files appear without a rebuild. */
const LOGO_DIR = path.join(process.cwd(), "team-logos");

const TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ team: string }> }) {
  const { team: teamId } = await params;
  const team = TEAMS.find((t) => t.id === teamId);
  if (!team) return new Response("Unknown team", { status: 404 });

  let files: string[];
  try {
    files = await readdir(LOGO_DIR);
  } catch {
    return new Response("Logo folder not found", { status: 404 });
  }

  const match = files.find((file) => {
    const ext = path.extname(file).toLowerCase();
    return ext in TYPES && team.logoNames.includes(normalize(path.basename(file, ext)));
  });
  if (!match) return new Response("No logo for this team yet", { status: 404 });

  const body = await readFile(path.join(LOGO_DIR, match));
  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": TYPES[path.extname(match).toLowerCase()],
      // Always re-check the folder so a replaced logo shows on the next page load.
      "Cache-Control": "no-store",
    },
  });
}
