import { useEffect, useRef, useState } from "react";
import { useStore } from "@nanostores/react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeMathjax from "rehype-mathjax/browser";
import rehypeStringify from "rehype-stringify";
import { $router } from "../lib/router";
import { openPage } from "@nanostores/router";
import { ArrowLeft, ArrowLeftToLine, ArrowRight, Home } from "lucide-react";
import { holyChapters, type HolyChapter, type HolySection } from "../generated/holyTexts";

type Props = {
    language: "en" | "zh";
};

function findSectionById(id: string | undefined): HolySection | undefined {
    if (!id) return undefined;
    for (const chapter of holyChapters) {
        const found = chapter.sections.find((s) => s.id === id);
        if (found) return found;
    }
    return undefined;
}

/** Ordered content sections (section &gt; 0) for one chapter, language-aware. */
function getNavSectionsForChapter(
    chapter: HolyChapter,
    language: "en" | "zh",
): HolySection[] {
    const desiredLang = language === "zh" ? "Chinese" : "English";
    const nums = [
        ...new Set(
            chapter.sections
                .filter((s) => s.section !== 0)
                .map((s) => s.section),
        ),
    ].sort((a, b) => a - b);
    return nums.map((num) => {
        const variants = chapter.sections.filter((s) => s.section === num);
        return (
            variants.find((s) => s.language === desiredLang) ?? variants[0]
        );
    });
}

function getNavContext(section: HolySection, language: "en" | "zh") {
    const chapter = holyChapters.find((c) => c.chapter === section.chapter);
    if (!chapter) {
        return {
            list: [] as HolySection[],
            index: -1,
            prev: undefined as HolySection | undefined,
            next: undefined as HolySection | undefined,
            first: undefined as HolySection | undefined,
        };
    }
    const list = getNavSectionsForChapter(chapter, language);
    const index = list.findIndex(
        (s) => s.chapter === section.chapter && s.section === section.section,
    );
    return {
        list,
        index,
        prev: index > 0 ? list[index - 1] : undefined,
        next: index >= 0 && index < list.length - 1 ? list[index + 1] : undefined,
        first: list[0],
    };
}

const markdownProcessor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeMathjax)
    .use(rehypeStringify);

export function HolyTextPage({ language }: Props) {
    const page = useStore($router);
    const [content, setContent] = useState<string | null>(null);
    const [htmlContent, setHtmlContent] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const proseRef = useRef<HTMLDivElement>(null);

    const params = page?.params as { id?: string } | undefined;
    const id = params?.id;
    const section = findSectionById(id);

    useEffect(() => {
        if (!section) return;

        const load = async () => {
            try {
                const url = `${import.meta.env.BASE_URL}${section.path}`;
                const res = await fetch(url);
                if (!res.ok) {
                    throw new Error(`${res.status} ${res.statusText}`);
                }
                const rawText = await res.text();
                // Strip simple header block between ---- lines
                const lines = rawText.split(/\r?\n/);
                let inHeader = false;
                const bodyLines: string[] = [];
                for (const line of lines) {
                    if (line.trim().startsWith("-----------")) {
                        inHeader = !inHeader;
                        continue;
                    }
                    if (!inHeader) bodyLines.push(line);
                }
                const body = bodyLines.join("\n").trim();
                setContent(body);
                setError(null);
            } catch (e) {
                setError("Failed to load text.");
            }
        };

        load();
    }, [section?.path]);

    useEffect(() => {
        if (!content) {
            setHtmlContent(null);
            return;
        }

        const normalizeHtmlAssetUrls = (html: string): string => {
            const wrap = document.createElement("div");
            wrap.innerHTML = html;
            const base = import.meta.env.BASE_URL;

            wrap.querySelectorAll("img").forEach((img) => {
                const src = img.getAttribute("src");
                if (!src) return;
                if (
                    src.startsWith("http://") ||
                    src.startsWith("https://") ||
                    src.startsWith("//") ||
                    src.startsWith("data:") ||
                    src.startsWith("/")
                ) {
                    return;
                }
                img.setAttribute("src", `${base}${src}`);
            });

            wrap.querySelectorAll("img").forEach((img) => {
                const parent = img.parentElement;
                if (!parent || parent.tagName.toLowerCase() === "figure") return;

                const figure = document.createElement("figure");
                figure.className = "markdown-figure";

                const cloned = img.cloneNode(true) as HTMLImageElement;
                figure.appendChild(cloned);

                const alt = img.getAttribute("alt");
                if (alt && alt.trim()) {
                    const caption = document.createElement("figcaption");
                    caption.textContent = alt;
                    figure.appendChild(caption);
                }

                parent.replaceChild(figure, img);
            });

            return wrap.innerHTML;
        };

        markdownProcessor
            .process(content)
            .then((v) => setHtmlContent(normalizeHtmlAssetUrls(String(v))))
            .catch(() => setError("Failed to process text."));
    }, [content]);

    useEffect(() => {
        if (section) {
            document.title = section.title;
        }
    }, [section]);

    useEffect(() => {
        if (!htmlContent || !proseRef.current) return;
        const container = proseRef.current;

        const run = async () => {
            const w = window as unknown as {
                MathJax?: {
                    typesetClear: (nodes?: unknown[]) => void;
                    typesetPromise: (nodes?: unknown[]) => Promise<unknown>;
                    startup?: { promise?: Promise<unknown> };
                };
            };

            const waitForMathJax = (): Promise<typeof w.MathJax> =>
                new Promise((resolve) => {
                    if (w.MathJax?.typesetPromise) {
                        resolve(w.MathJax);
                        return;
                    }
                    const id = setInterval(() => {
                        if (w.MathJax?.typesetPromise) {
                            clearInterval(id);
                            resolve(w.MathJax!);
                        }
                    }, 50);
                    setTimeout(() => {
                        clearInterval(id);
                        resolve(w.MathJax!);
                    }, 5000);
                });

            const mj = await waitForMathJax();
            if (!mj?.typesetPromise) return;
            await mj.startup?.promise?.catch(() => {});
            mj.typesetClear?.([container]);
            await mj.typesetPromise([container]);
        };
        run();
    }, [htmlContent]);

    if (!section) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p>{language === "en" ? "Text not found." : "未找到经文。"}</p>
            </div>
        );
    }

    const nav = getNavContext(section, language);
    const canPrev = nav.prev !== undefined;
    const canNext = nav.next !== undefined;
    const canFirst = nav.index > 0 && nav.first !== undefined;

    const t = {
        prev: language === "en" ? "Previous Section" : "上一节",
        first:
            language === "en"
                ? "First Section in Chapter"
                : "本章第一节",
        next: language === "en" ? "Next Section" : "下一节",
    };

    return (
        <>
            <button
                type="button"
                className="fixed top-[4.5rem] left-4 z-10 inline-flex items-center gap-1 rounded-sm bg-secondary/90 px-1.5 py-0.5 text-sm link [&_svg]:size-4 [&_svg]:shrink-0"
                onClick={() => openPage($router, "home")}
            >
                <Home aria-hidden />
                {language === "en" ? "Back to Home" : "回到主页"}
            </button>
            <div className="flex flex-col items-center min-h-screen px-4 pt-24 pb-28 fade-in">
                <div className="max-w-3xl w-full prose dark:prose-invert">
                    <h1 className="mb-4 text-3xl font-extrabold text-center">
                        {section.title}
                    </h1>
                    <p className="text-sm text-gray-500 mb-4 text-center">
                        {section.category} ·{" "}
                        {language === "en"
                            ? `Chapter ${section.chapter}, Section ${section.section}`
                            : `第 ${section.chapter} 章，第 ${section.section} 节`}
                    </p>
                    {error && (
                        <p className="text-red-500">
                            {language === "en"
                                ? "Failed to load text."
                                : "加载经文失败。"}
                        </p>
                    )}
                    {htmlContent && (
                        <div
                            ref={proseRef}
                            className="prose-content max-w-3xl w-full prose dark:prose-invert [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-bold [&_p]:leading-relaxed [&_p]:my-4 [&_ul]:list-disc [&_ul]:list-outside [&_ul]:ml-6 [&_ul]:my-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:list-outside [&_ol]:ml-6 [&_ol]:my-4 [&_ol]:space-y-1 [&_li]:leading-relaxed [&_figure]:my-6 [&_figure]:mx-auto [&_figure]:w-[67%] [&_figure>img]:w-full [&_figure>img]:h-auto [&_figcaption]:mt-2 [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:text-muted-foreground"
                            dangerouslySetInnerHTML={{ __html: htmlContent }}
                        />
                    )}
                </div>
            </div>
            <nav
                className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-background/95 px-3 py-2 backdrop-blur"
                aria-label={
                    language === "en"
                        ? "Section navigation"
                        : "章节导航"
                }
            >
                <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <button
                            type="button"
                            disabled={!canPrev}
                            className="inline-flex min-w-0 items-center gap-1 rounded-full border border-border/80 bg-secondary/80 px-2 py-1 text-xs font-medium leading-tight text-secondary-foreground shadow-sm transition-[color,background-color,box-shadow] hover:bg-secondary hover:shadow disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-3 [&_svg]:shrink-0 [&_svg]:stroke-[2]"
                            onClick={() =>
                                nav.prev &&
                                openPage($router, "holyText", {
                                    id: nav.prev.id,
                                })
                            }
                        >
                            <ArrowLeft aria-hidden />
                            <span className="hidden sm:inline">{t.prev}</span>
                            <span className="sm:hidden">
                                {language === "en" ? "Prev" : "上节"}
                            </span>
                        </button>
                        <button
                            type="button"
                            disabled={!canFirst}
                            className="inline-flex min-w-0 items-center gap-1 rounded-full border border-border/80 bg-secondary/80 px-2 py-1 text-xs font-medium leading-tight text-secondary-foreground shadow-sm transition-[color,background-color,box-shadow] hover:bg-secondary hover:shadow disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-3 [&_svg]:shrink-0 [&_svg]:stroke-[2]"
                            onClick={() =>
                                nav.first &&
                                openPage($router, "holyText", {
                                    id: nav.first.id,
                                })
                            }
                        >
                            <ArrowLeftToLine aria-hidden />
                            <span className="hidden sm:inline">{t.first}</span>
                            <span className="sm:hidden">
                                {language === "en" ? "First" : "首节"}
                            </span>
                        </button>
                    </div>
                    <div className="flex items-center">
                        <button
                            type="button"
                            disabled={!canNext}
                            className="inline-flex min-w-0 items-center gap-1 rounded-full border border-border/80 bg-secondary/80 px-2 py-1 text-xs font-medium leading-tight text-secondary-foreground shadow-sm transition-[color,background-color,box-shadow] hover:bg-secondary hover:shadow disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-3 [&_svg]:shrink-0 [&_svg]:stroke-[2]"
                            onClick={() =>
                                nav.next &&
                                openPage($router, "holyText", {
                                    id: nav.next.id,
                                })
                            }
                        >
                            <span className="hidden sm:inline">{t.next}</span>
                            <span className="sm:hidden">
                                {language === "en" ? "Next" : "下节"}
                            </span>
                            <ArrowRight aria-hidden />
                        </button>
                    </div>
                </div>
            </nav>
        </>
    );
}

