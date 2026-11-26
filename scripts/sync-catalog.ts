import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

type CatalogoEntry = {
  id_origen: string | null;
  slug_normalizado: string;
  titulo: string;
  equipo_o_seleccion: string | null;
  temporada_o_anio: string | null;
  dorsal: string | null;
  categoria: string | null;
  deporte: string | null;
  version: string | null;
  modalidad: string | null;
  precio_uyu: number | null;
  tipo?: "producto" | "anuncio";
  activo?: boolean;
  portada?: string | null;
  imagenes_ordenadas: string[];
  fuente: string;
};

const ROOT = process.cwd();
const NUEVAS_DIR = path.join(ROOT, "public", "nuevas");
const CATALOGO_DIR = path.join(ROOT, "public", "catalogo");
const CATALOGO_JSON = path.join(ROOT, "docs", "catalogo.json");

const FFMPEG_BIN =
  process.env.FFMPEG_PATH ||
  "C:\\Users\\prest\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1.1-essentials_build\\bin\\ffmpeg.exe";

const isDryRun = process.argv.includes("--dry-run");

function normalizeBaseName(filename: string): string {
  return filename
    .replace(/\.jpg - Editado( \(\d+\))?\.png$/i, "")
    .replace(/\.(webp|jpg|jpeg|png)$/i, "");
}

function main() {
  if (!fs.existsSync(NUEVAS_DIR)) {
    throw new Error(`No existe el directorio: ${NUEVAS_DIR}`);
  }
  if (!fs.existsSync(CATALOGO_JSON)) {
    throw new Error(`No existe el archivo: ${CATALOGO_JSON}`);
  }

  const nuevasFiles = fs.readdirSync(NUEVAS_DIR);
  const pngFiles = nuevasFiles.filter((f) => f.toLowerCase().endsWith(".png"));

  console.log(
    `[sync-catalog] Modo: ${isDryRun ? "DRY-RUN" : "EJECUCIÓN"} | PNGs pendientes: ${pngFiles.length}`
  );

  let converted = 0;
  for (const file of pngFiles) {
    const base = normalizeBaseName(file);
    const targetName = `${base}.webp`;
    const srcPath = path.join(NUEVAS_DIR, file);
    const dstPath = path.join(NUEVAS_DIR, targetName);
    const tmpPath = path.join(NUEVAS_DIR, `${base}.tmp.webp`);

    if (isDryRun) {
      console.log(`  [dry-run] ${file} -> ${targetName}`);
      converted += 1;
      continue;
    }

    if (!fs.existsSync(dstPath)) {
      execFileSync(FFMPEG_BIN, [
        "-y",
        "-loglevel",
        "error",
        "-i",
        srcPath,
        "-c:v",
        "libwebp",
        "-quality",
        "82",
        tmpPath,
      ]);

      if (!fs.existsSync(tmpPath) || fs.statSync(tmpPath).size === 0) {
        throw new Error(`Fallo al convertir ${file} a WebP`);
      }
      fs.renameSync(tmpPath, dstPath);
    }

    fs.unlinkSync(srcPath);
    converted += 1;
  }

  const webpSet = new Set(
    fs
      .readdirSync(NUEVAS_DIR)
      .filter((f) => f.toLowerCase().endsWith(".webp"))
  );

  const raw = JSON.parse(fs.readFileSync(CATALOGO_JSON, "utf8")) as {
    productos: CatalogoEntry[];
  };

  let webpCount = 0;
  let jpgCount = 0;
  let missingCount = 0;

  const updated = raw.productos.map((item) => {
    const isAd = item.slug_normalizado.startsWith("sin-descripcion");
    const resolved = item.imagenes_ordenadas.map((entry) => {
      const bare = entry.replace(/^\/(nuevas|catalogo)\//, "");
      const base = normalizeBaseName(bare);
      const webpName = `${base}.webp`;
      const jpgName = `${base}.jpg`;

      if (webpSet.has(webpName)) {
        return `/nuevas/${webpName}`;
      }
      if (fs.existsSync(path.join(CATALOGO_DIR, jpgName))) {
        return `/catalogo/${jpgName}`;
      }
      missingCount += 1;
      console.error(`[error] Imagen faltante en disco: ${entry}`);
      return entry;
    });

    const ordered = [
      ...resolved.filter((r) => r.startsWith("/nuevas/")),
      ...resolved.filter((r) => !r.startsWith("/nuevas/")),
    ];

    for (const img of ordered) {
      if (img.startsWith("/nuevas/")) webpCount += 1;
      else if (img.startsWith("/catalogo/")) jpgCount += 1;
      if (!isDryRun && !fs.existsSync(path.join(ROOT, "public", img))) {
        missingCount += 1;
        console.error(`[error] No existe en disco: public${img}`);
      }
    }

    return {
      ...item,
      tipo: isAd ? ("anuncio" as const) : ("producto" as const),
      activo: !isAd,
      portada: ordered[0] ?? null,
      imagenes_ordenadas: ordered,
    };
  });

  if (missingCount > 0) {
    throw new Error(`Abortando: se detectaron ${missingCount} rutas faltantes.`);
  }

  if (!isDryRun) {
    const tmpJson = `${CATALOGO_JSON}.tmp`;
    fs.writeFileSync(tmpJson, JSON.stringify({ productos: updated }, null, 2) + "\n");
    fs.renameSync(tmpJson, CATALOGO_JSON);
  }

  console.log(
    `[sync-catalog] Listo. Convertidos: ${converted} | Entradas: ${updated.length} | WebP: ${webpCount} | JPG: ${jpgCount} | Faltantes: ${missingCount}`
  );
}

main();
