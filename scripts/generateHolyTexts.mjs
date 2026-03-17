import { promises as fs } from "fs";
import path from "path";

const ROOT = new URL("..", import.meta.url).pathname;
const HOLY_DIR = path.join(ROOT, "_holy_text");
const OUTPUT_DIR = path.join(ROOT, "src", "generated");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "holyTexts.ts");

async function main() {
  const files = await fs.readdir(HOLY_DIR);
  const markdownFiles = files.filter((f) => f.endsWith(".md")).sort();

  const chapters = new Map();

  for (const file of markdownFiles) {
    const fullPath = path.join(HOLY_DIR, file);
    const raw = await fs.readFile(fullPath, "utf8");
    const lines = raw.split(/\r?\n/);

    // Simple header block between lines of dashes
    const headerLines = [];
    let inHeader = false;
    for (const line of lines) {
      if (line.trim().startsWith("-----------")) {
        inHeader = !inHeader;
        continue;
      }
      if (inHeader) headerLines.push(line);
    }

    const meta = {};
    for (const line of headerLines) {
      const idx = line.indexOf(":");
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim().toLowerCase();
      const value = line.slice(idx + 1).trim();
      meta[key] = value;
    }

    const chapterNum = Number(meta.chapter ?? 0);
    const sectionNum = Number(meta.section ?? 0);
    const category = meta.category ?? "";
    const language = meta.language ?? "English";
    const title = meta.title ?? path.basename(file, ".md");
    const slug = path.basename(file, ".md");
    // Files are served from Vite's publicDir, so URL is just the filename.
    // We keep only the filename here and add BASE_URL on the client.
    const relativePath = file;

    if (!chapters.has(chapterNum)) {
      chapters.set(chapterNum, {
        chapter: chapterNum,
        category,
        title,
        language,
        sections: [],
      });
    }

    const chapter = chapters.get(chapterNum);

    if (sectionNum === 0) {
      chapter.title = title;
      chapter.category = category;
      chapter.language = language;
    }

    chapter.sections.push({
      id: slug,
      chapter: chapterNum,
      section: sectionNum,
      title,
      category,
      language,
      path: relativePath,
    });
  }

  const sortedChapters = Array.from(chapters.values())
    .sort((a, b) => a.chapter - b.chapter)
    .map((ch) => ({
      ...ch,
      sections: ch.sections.sort((a, b) => a.section - b.section),
    }));

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const fileContent = `export type HolySection = {
  id: string;
  chapter: number;
  section: number;
  title: string;
  category: string;
  language: string;
  path: string;
};

export type HolyChapter = {
  chapter: number;
  category: string;
  title: string;
  language: string;
  sections: HolySection[];
};

export const holyChapters: HolyChapter[] = ${JSON.stringify(
    sortedChapters,
    null,
    2,
  )};
`;

  await fs.writeFile(OUTPUT_FILE, fileContent, "utf8");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

