import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import Menu from "./Menu";
import Return from "./Return";
import { $router } from "./lib/router";
import { $language } from "./lib/states";
import { holyChapters, type HolyChapter, type HolySection } from "./generated/holyTexts";
import { HolyTextPage } from "./components/HolyTextPage";
import { openPage } from "@nanostores/router";

function App() {
    const page = useStore($router);
    const language = useStore($language);

    const routeTitle = (route: string) => {
        if (route === "algebra") {
            return language === "en" ? "Algebra" : "代数";
        }
        if (route === "analysis") {
            return language === "en" ? "Analysis" : "分析";
        }
        if (route === "characters") {
            return language === "en" ? "Characters" : "性格";
        }
        return route;
    };

    const homeTitle =
        language === "en" ? "Bear Resort: Religion" : "小熊樂園：宗教";
    const homeSubtitle =
        language === "en"
            ? "A religion where you find order and tranquility."
            : "在这里，你寻找秩序与宁静。";

    useEffect(() => {
        if (!page) {
            document.title = homeTitle;
            return;
        }

        if (
            page.route === "algebra" ||
            page.route === "analysis" ||
            page.route === "characters"
        ) {
            document.title = routeTitle(page.route);
        } else if (page.route === "holyText") {
            // Title is handled in HolyTextPage for specific section
            if (!document.title) {
                document.title = homeTitle;
            }
        } else {
            document.title = homeTitle;
        }
    }, [page, language, homeTitle]);

    if (page) {
        if (
            page.route === "algebra" ||
            page.route === "analysis" ||
            page.route === "characters"
        ) {
            return (
                <>
                    <div className="sticky top-0 z-10 flex items-center justify-between bg-background/95 px-4 py-4 backdrop-blur sm:border-b">
                        <Return />
                        <Menu />
                    </div>
                    <div
                        key={page.route}
                        className="flex flex-col justify-center items-center min-h-screen pt-24 fade-in"
                    >
                        {/* {page.route === "algebra" && <Algebra />}
                        {page.route === "analysis" && <Analysis />}
                        {page.route === "characters" && <Chars />} */}
                    </div>
                </>
            );
        }

        if (page.route === "holyText") {
            return (
                <>
                    <div className="sticky top-0 z-10 flex items-center justify-between bg-background/95 px-4 py-4 backdrop-blur sm:border-b">
                        <Return />
                        <Menu />
                    </div>
                    <HolyTextPage language={language} />
                </>
            );
        }
    }

    return (
        <>
            <div className="sticky top-0 z-10 flex items-center justify-between bg-background/95 px-4 py-4 backdrop-blur sm:border-b">
                <Return />
                <Menu />
            </div>
            <div className="flex flex-col justify-center items-center min-h-screen pt-24 fade-in px-4">
                <div className="flex flex-col items-center mb-8">
                    <h1 className="text-3xl font-black text-center">
                        {homeTitle}
                    </h1>
                    <br />
                    <h2 className="text-xl text-center">
                        {homeSubtitle}
                    </h2>
                </div>
                <div className="max-w-4xl w-full">
                    <h3 className="text-2xl font-bold mb-4">
                        {language === "en"
                            ? "Holy Texts"
                            : "圣典目录"}
                    </h3>
                    <div className="space-y-6">
                        {holyChapters.map((chapter: HolyChapter) => (
                            <ChapterCard
                                key={chapter.chapter}
                                chapter={chapter}
                                language={language}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

type ChapterCardProps = {
    chapter: HolyChapter;
    language: "en" | "zh";
};

function ChapterCard({ chapter, language }: ChapterCardProps) {
    const [intro, setIntro] = useState<string | null>(null);

    useEffect(() => {
        const desiredSectionLanguage = language === "zh" ? "Chinese" : "English";

        let section0 =
            chapter.sections.find(
                (s: HolySection) =>
                    s.section === 0 && s.language === desiredSectionLanguage,
            ) ??
            chapter.sections.find(
                (s: HolySection) =>
                    s.section === 0 && s.language === "English",
            );

        if (!section0) {
            setIntro(null);
            return;
        }

        let cancelled = false;

        const load = async () => {
            try {
                const url = `${import.meta.env.BASE_URL}${section0.path}`;
                const res = await fetch(url);
                if (!res.ok) {
                    throw new Error(`${res.status} ${res.statusText}`);
                }
                const rawText = await res.text();
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
                if (!cancelled) {
                    setIntro(body);
                }
            } catch {
                if (!cancelled) {
                    setIntro(null);
                }
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [chapter.sections, language]);

    const englishSection0 = chapter.sections.find(
        (s: HolySection) => s.section === 0 && s.language === "English",
    );
    const chineseSection0 = chapter.sections.find(
        (s: HolySection) => s.section === 0 && s.language === "Chinese",
    );

    const displayTitle =
        language === "en"
            ? englishSection0?.title ?? chapter.title
            : chineseSection0?.title ?? chapter.title;

    return (
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4">
            <div className="mb-2">
                <h4 className="text-xl font-semibold">
                    {language === "en"
                        ? `Chapter ${chapter.chapter}: ${displayTitle}`
                        : `第 ${chapter.chapter} 章：${displayTitle}`}
                </h4>
                <p className="text-sm text-gray-500">
                    {intro ?? chapter.category}
                </p>
            </div>
            <ul className="list-disc ml-6 space-y-1">
                {chapter.sections
                    .filter((s: HolySection) => s.section !== 0)
                    .map((section: HolySection) => (
                        <li key={section.id}>
                            <button
                                type="button"
                                className="link"
                                onClick={() =>
                                    openPage($router, "holyText", {
                                        id: section.id,
                                    })
                                }
                            >
                                {language === "en"
                                    ? `Section ${section.section}: ${section.title}`
                                    : `第 ${section.section} 节：${section.title}`}
                            </button>
                        </li>
                    ))}
            </ul>
        </div>
    );
}

export default App;
