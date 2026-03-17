import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
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

export function HolyTextPage({ language }: Props) {
    const page = useStore($router);
    const [content, setContent] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

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
        if (section) {
            document.title = section.title;
        }
    }, [section]);

    if (!section) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p>{language === "en" ? "Text not found." : "未找到经文。"}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center min-h-screen px-4 pt-24 pb-16 fade-in">
            <div className="max-w-3xl w-full">
                <button
                    type="button"
                    className="mb-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={() => openPage($router, "home")}
                >
                    {language === "en" ? "Back to Home" : "回到主页"}
                </button>
            </div>
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
                {content && (
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                            h2: ({ node, ...props }) => (
                                <h2
                                    className="mt-6 mb-3 text-2xl font-bold"
                                    {...props}
                                />
                            ),
                            p: ({ node, ...props }) => (
                                <p className="leading-relaxed" {...props} />
                            ),
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                )}
            </div>
        </div>
    );
}

