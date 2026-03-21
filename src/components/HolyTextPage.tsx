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
import { holyChapters, type HolySection } from "../generated/holyTexts";

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
        markdownProcessor
            .process(content)
            .then((v) => setHtmlContent(String(v)))
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

    return (
        <>
            <button
                type="button"
                className="fixed top-[4.5rem] left-4 z-10 text-sm link px-1 rounded-sm bg-secondary/90"
                onClick={() => openPage($router, "home")}
            >
                {language === "en" ? "Back to Home" : "回到主页"}
            </button>
            <div className="flex flex-col items-center min-h-screen px-4 pt-24 pb-16 fade-in">
            <div ref={proseRef} className="max-w-3xl w-full prose dark:prose-invert">
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
                        className="prose-content max-w-3xl w-full prose dark:prose-invert [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-bold [&_p]:leading-relaxed [&_p]:my-4 [&_ul]:list-disc [&_ul]:list-outside [&_ul]:ml-6 [&_ul]:my-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:list-outside [&_ol]:ml-6 [&_ol]:my-4 [&_ol]:space-y-1 [&_li]:leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                )}
            </div>
        </div>
        </>
    );
}

