import { atom } from "nanostores";
import Cookies from "js-cookie";

const initialTheme = Cookies.get("theme") || "day";

export const $theme = atom(initialTheme);

$theme.subscribe((value) => {
    Cookies.set("theme", value, {
        expires: 365,
        path: "/",
    });

    if (value === "night") {
        document.documentElement.classList.add("night");
    } else {
        document.documentElement.classList.remove("night");
    }
});

let lastTheme = Cookies.get("theme");

const checkCookieChange = () => {
    const currentTheme = Cookies.get("theme");

    if (currentTheme && currentTheme !== lastTheme) {
        lastTheme = currentTheme;
        $theme.set(currentTheme);
    }
};

setInterval(checkCookieChange, 500);

if (typeof window !== "undefined") {
    window.addEventListener("focus", checkCookieChange);

    window.addEventListener("storage", (e) => {
        if (e.key === "theme-sync") {
            checkCookieChange();
        }
    });
}

export const toggleTheme = () => {
    const current = $theme.get();
    $theme.set(current === "night" ? "day" : "night");
    localStorage.setItem("refresh", Date.now().toString());
};

type Language = "en" | "zh";

const getInitialLanguage = (): Language => {
    if (typeof window === "undefined") return "en";
    const stored = window.localStorage.getItem("language") as Language | null;
    return stored === "zh" ? "zh" : "en";
};

export const $language = atom<Language>(getInitialLanguage());

$language.subscribe((value) => {
    if (typeof window !== "undefined") {
        window.localStorage.setItem("language", value);
    }
});
