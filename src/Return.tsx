import { useEffect, useRef, useState } from "react";
import { Button } from "./components/ui/button";
import { $language } from "./lib/states";
import { useStore } from "@nanostores/react";

function Return() {
    const language = useStore($language);
    
    const [isNarrow, setIsNarrow] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        const handleResize = () => {
            setIsNarrow(window.innerWidth < 640);
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        if (!confirmOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (buttonRef.current?.contains(event.target as Node)) return;
            setConfirmOpen(false);
        };

        const timeoutId = window.setTimeout(() => {
            setConfirmOpen(false);
        }, 5000);

        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);
            window.clearTimeout(timeoutId);
        };
    }, [confirmOpen]);

    const backToResort = () => {
        window.location.href = "https://bear-resort.github.io/";
    };

    return (
        <Button
            ref={buttonRef}
            onClick={() => {
                if (isNarrow && !confirmOpen) {
                    setConfirmOpen(true);
                    return;
                }
                backToResort();
            }}
            className="relative mt-4 ml-4 flex items-center gap-2 rounded-lg px-4 py-2 shadow-md transition-colors duration-200 hover:bg-gray-800 sm:absolute sm:top-4 sm:left-4 sm:mt-0 sm:ml-0"
        >
            <img
                src="https://bear-resort.github.io/logos/default-bear.gif"
                alt="Bear Resort"
                className="w-6 h-6 object-contain"
            />
            {(!isNarrow || confirmOpen) && language === "en" ? "Back to Bear Resort" : "返回小熊樂園"}
        </Button>
    );
}

export default Return;
