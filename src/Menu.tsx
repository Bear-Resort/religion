import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { $language, $theme, toggleTheme } from "./lib/states";
import { useStore } from "@nanostores/react";
import { openPage } from "@nanostores/router";
import { $router } from "./lib/router";

function Menu() {
    const [loggedInUser, setLoggedInUser] = useState(
        localStorage.getItem("loggedInUser"),
    );

    useEffect(() => {
        function syncUser() {
            setLoggedInUser(localStorage.getItem("loggedInUser"));
        }
        window.addEventListener("storage", syncUser);
        return () => window.removeEventListener("storage", syncUser);
    }, []);

    const promptToUserCenter = () => {
        window.open(
            "https://bear-resort.github.io/assets/html/login.html",
            "_blank",
        );
    };

    const theme = useStore($theme);
    const language = useStore($language);

    const t = {
        home: language === "en" ? "Home" : "首页",
        profile: language === "en" ? "Profile" : "个人中心",
        login: language === "en" ? "Log in" : "登录",
        setting: language === "en" ? "Setting" : "设置",
        themeLabel: language === "en" ? "Theme" : "主题",
        themeValue:
            language === "en"
                ? theme === "night"
                    ? "Night"
                    : "Day"
                : theme === "night"
                  ? "夜间"
                  : "日间",
        languageToggle:
            language === "en" ? "Language: English" : "语言: 中文",
    };

    return (
        <div className="absolute top-4 right-4 border-solid">
            <DropdownMenu>
                <DropdownMenuTrigger>
                    {language === "en" ? "Menu" : "菜单"}
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem
                        onClick={() => {
                            openPage($router, "home");
                        }}
                    >
                        {t.home}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>{t.profile}</DropdownMenuLabel>
                    <DropdownMenuItem onClick={promptToUserCenter}>
                        {loggedInUser ? loggedInUser : t.login}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>{t.setting}</DropdownMenuLabel>
                    <DropdownMenuItem
                        onClick={(event) => {
                            event.preventDefault();
                            toggleTheme();
                        }}
                    >
                        {t.themeLabel}: {t.themeValue}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={(event) => {
                            event.preventDefault();
                            $language.set(
                                language === "en" ? "zh" : "en",
                            );
                        }}
                    >
                        {t.languageToggle}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export default Menu;
