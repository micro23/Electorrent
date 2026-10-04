import { DECK_THEME_ORDER, DECK_THEME_TITLES } from '@shared/deck-themes'
import fs from 'fs'
import path from 'path'
import { nativeTheme } from 'electron'

import type { ColorTheme, DeckThemeId, ThemeInfo, ThemePreference } from '@shared/ipc-contract'

function resolveThemesDir() {
    const candidates = [
        path.join(__dirname, './css/themes'),
        path.join(__dirname, '../css/themes'),
    ]

    const directory = candidates.find((candidate: string) => fs.existsSync(candidate))
    if (!directory) {
        throw new Error(`Theme directory not found. Tried: ${candidates.join(', ')}`)
    }

    return directory
}

const DIR = resolveThemesDir()
const THEME_NAMES = DECK_THEME_ORDER
const THEME_TITLES = DECK_THEME_TITLES

export function getSystemTheme(): ColorTheme {
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
}

export function resolveTheme(theme?: ThemePreference): ColorTheme {
    if (theme === 'system' || !theme) return getSystemTheme()
    return theme === 'light' || theme === 'dark' ? theme : theme === 'forest' || theme === 'valentine' || theme === 'st-patricks' ? 'light' : 'dark'
}

export default function themes(): ThemeInfo[] {
    const installedThemes = THEME_NAMES
        .filter(function(theme: DeckThemeId) {
            return theme === 'light' || theme === 'dark'
        })
        .map(function(theme: DeckThemeId) {
            return {
                css: path.join(DIR, `${theme}.css`),
                basename: theme as ColorTheme,
                theme: THEME_TITLES[theme],
            }
        })

    const themedChoices = THEME_NAMES.filter(theme => theme !== 'light' && theme !== 'dark').map(theme => ({
        css: path.join(DIR, `${resolveTheme(theme)}.css`),
        basename: theme,
        theme: THEME_TITLES[theme],
    }))

    return [
        {
            css: path.join(DIR, `${getSystemTheme()}.css`),
            basename: 'system',
            theme: 'System',
        },
        ...THEME_NAMES.map(theme => [...installedThemes, ...themedChoices].find(choice => choice.basename === theme)!).filter(Boolean),
    ]
}
