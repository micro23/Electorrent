import { IScope } from "angular";
import { DECK_THEME_ORDER, DECK_SPORTS_CLUBS, DECK_SPORTS_DESIGNS } from "@shared/deck-themes";
import type { ColorTheme, DeckThemeId, ThemePreference } from "@shared/ipc-contract";

interface AppThemeScope extends IScope {
    theme: ColorTheme;
}

export class AppThemeController {
    static $inject = ["$scope", "settingsService"];

    constructor($scope: AppThemeScope, settingsService: any) {
        const electorrent = window.electorrent;
        let systemTheme: ColorTheme = electorrent.app.initialTheme;
        let themePreference: ThemePreference = settingsService.getAllSettings().ui.theme;
        const themeOrder = DECK_THEME_ORDER;

        const applyTheme = () => {
            const deckTheme = themePreference === "system" ? systemTheme : themePreference;
            document.documentElement.dataset.theme = deckTheme;
            const club = DECK_SPORTS_CLUBS[deckTheme as keyof typeof DECK_SPORTS_CLUBS];
            const design = DECK_SPORTS_DESIGNS[deckTheme as keyof typeof DECK_SPORTS_DESIGNS];
            Object.assign($scope.$root, {
                deckTheme,
                deckClub: club ? { ...club, id: deckTheme, lettering: design?.lettering || "serif", motif: design?.motif || "" } : null,
            });
            $scope.theme = deckTheme === "light" || deckTheme === "dark"
                ? deckTheme
                : deckTheme === "forest" || deckTheme === "valentine" || deckTheme === "st-patricks"
                    ? "light"
                    : "dark";
        };

        const cycleTheme = (event: KeyboardEvent) => {
            if (!["t", "d"].includes(event.key.toLowerCase()) || event.metaKey || event.ctrlKey || event.altKey || event.repeat || event.isComposing) return;
            const target = event.target instanceof Element ? event.target : null;
            const isTyping = (element: Element | null) => element?.getAttribute("contenteditable") === "true" || !!element?.closest(
                'textarea,[role="textbox"],input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]):not([type="file"]):not([type="hidden"])',
            );
            if (isTyping(target) || isTyping(document.activeElement)) return;

            event.preventDefault();
            const current = themePreference === "system" ? document.documentElement.dataset.theme : themePreference;
            const currentIndex = themeOrder.indexOf(current as DeckThemeId);
            const direction = event.shiftKey ? -1 : 1;
            const nextIndex = (currentIndex + direction + themeOrder.length) % themeOrder.length;
            const previousPreference = themePreference;
            themePreference = event.key.toLowerCase() === "d" ? "darkhand" : themeOrder[nextIndex];
            applyTheme();
            $scope.$applyAsync();
            void settingsService.saveAllSettings({ ui: { ...settingsService.getAllSettings().ui, theme: themePreference } }).catch((error: unknown) => {
                themePreference = previousPreference;
                applyTheme();
                $scope.$applyAsync();
                console.error("Could not save cycled theme", error);
            });
        };

        const unsubscribeCycleTheme = $scope.$root.$on("theme:cycle", () => cycleTheme(new KeyboardEvent("keydown", { key: "t" })));

        applyTheme();
        window.addEventListener("keydown", cycleTheme, true);

        const unsubscribeSystemTheme = electorrent.settings.onSystemThemeChanged((theme) => {
            systemTheme = theme;
            applyTheme();
            $scope.$applyAsync();
        });

        settingsService.whenReady().then(() => {
            themePreference = settingsService.getAllSettings().ui.theme;
            applyTheme();
        }).catch(() => {
            // Settings load errors are reported by the application bootstrap.
        }).finally(() => {
            $scope.$applyAsync();
        });

        $scope.$on("new:settings", (_event: unknown, nextSettings: any) => {
            themePreference = nextSettings.ui.theme || themePreference;
            applyTheme();
        });

        $scope.$on("$destroy", () => {
            unsubscribeCycleTheme();
            window.removeEventListener("keydown", cycleTheme, true);
            unsubscribeSystemTheme();
        });
    }
}
