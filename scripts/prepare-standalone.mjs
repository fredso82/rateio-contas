import { access, cp, mkdir } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const standaloneDir = path.join(projectRoot, ".next", "standalone");
const standaloneServer = path.join(standaloneDir, "server.js");
const publicSource = path.join(projectRoot, "public");
const publicTarget = path.join(standaloneDir, "public");
const staticSource = path.join(projectRoot, ".next", "static");
const staticTarget = path.join(standaloneDir, ".next", "static");

async function ensureBuildExists() {
  try {
    await access(standaloneServer);
  } catch {
    throw new Error(
      "Build standalone nao encontrado. Rode `npm run build` antes de preparar o artefato.",
    );
  }
}

await ensureBuildExists();
await mkdir(path.dirname(staticTarget), { recursive: true });
await cp(publicSource, publicTarget, { recursive: true, force: true });
await cp(staticSource, staticTarget, { recursive: true, force: true });
