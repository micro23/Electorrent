import { DECK_THEME_CATEGORIES } from "@shared/deck-themes";

export class SettingsGeneralController {
    settings: any;
    themes: any[];
    platform: any;
    general: any;

    themeCategories = DECK_THEME_CATEGORIES;

    categoryThemes(category: typeof DECK_THEME_CATEGORIES[number]) {
        return this.deckThemes().filter((theme) => category.themes.includes(theme.basename));
    }

    deckThemes() {
        return (this.themes || []).filter((theme) => theme.basename !== "system");
    }

    themePreview(theme: any) {
        const basename = theme.basename === "system" ? "dark" : theme.basename;
        return `${basename}-optimized.webp`;
    }

    chooseTheme(theme: any) {
        this.settings.ui.theme = theme.basename;
    }
}
