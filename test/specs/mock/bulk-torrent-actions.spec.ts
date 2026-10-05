import chai from "chai"
import { $, $$, browser } from "@wdio/globals"
import { Torrent } from "../../e2e/e2e_torrent"
import { eventually } from "../../e2e/eventually"
import { configureSpec, getTestFixture } from "../../framework/fixture"
import { DECK_THEME_ORDER, DECK_SPORTS_CLUBS, DECK_CORE_THEMES } from "../../../src/shared/deck-themes"

const assert: Chai.AssertStatic = chai.assert

const torrents = [
  { hash: "11".padStart(40, "0"), name: "Selected torrent one", state: "downloading", progress: 0.42 },
  { hash: "22".padStart(40, "0"), name: "Selected torrent two", state: "downloading" },
  { hash: "33".padStart(40, "0"), name: "Unselected torrent", state: "downloading" },
]

async function cycleTheme() {
  await browser.execute(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "t", bubbles: true }))
  })
}

describe("mock bulk torrent actions", function () {
  configureSpec({ clearTorrents: false })

  before(async function () {
    await invokeMockAction("clearMockedTorrents")
    for (const torrent of torrents) {
      await invokeMockAction("addMockedTorrent", torrent)
    }
    await eventually(async () => (await $$("#torrentTable tbody tr[data-id]")).length)
      .equals(torrents.length)
  })

  it("fits a column to its content when its divider is double clicked", async function () {
    const headers = await $$("#torrentTable thead th")
    let nameHeader: WebdriverIO.Element | undefined
    for (const header of headers) {
      if (["name", "torrent"].includes((await header.getText()).trim().toLowerCase())) nameHeader = header
    }
    assert.isOk(nameHeader, "the name column exists")
    const divider = nameHeader!.$(".rz-handle")
    await divider.waitForClickable()
    await divider.dragAndDrop({ x: 200, y: 0 })
    const originalWidth = (await nameHeader!.getSize()).width
    await divider.doubleClick()
    await eventually(async () => (await nameHeader!.getSize()).width)
      .satisfies("fit the short torrent names", width => width < originalWidth - 10 && width > 100)
    const fittedWidth = (await nameHeader!.getSize()).width
    await divider.doubleClick()
    assert.closeTo((await nameHeader!.getSize()).width, fittedWidth, 2, "repeated fitting is stable")
  })

  it("applies a pause and resume action to every selected torrent", async function () {
    await this.app.openSettings()
    await this.app.settingsGotoTab("general")
    const terminalTheme = $("button[aria-label='Choose Terminal theme']")
    await terminalTheme.scrollIntoView({ block: "center", inline: "nearest" })
    await terminalTheme.waitForClickable()
    await terminalTheme.click()
    await this.app.settingsSave()
    await this.app.torrentsPageIsVisible()
    const selectionMenu = $("[data-role='torrent-selection-menu']")
    assert.isFalse(await selectionMenu.isExisting())
    const firstSelected = await $(`#torrentTable tbody tr[data-id='${torrents[0].hash}']`)
    const secondSelected = await $(`#torrentTable tbody tr[data-id='${torrents[1].hash}']`)
    const firstCheckbox = firstSelected.$(".terminal-row-check")
    const secondCheckbox = secondSelected.$(".terminal-row-check")
    await firstCheckbox.waitForClickable()
    await firstCheckbox.click()
    await secondCheckbox.waitForClickable()
    await secondCheckbox.click()

    await eventually(getSelectedIds).satisfies(
      "include both selected torrents",
      (ids) => ids.length === 2
        && ids.includes(torrents[0].hash)
        && ids.includes(torrents[1].hash),
    )

    await selectionMenu.waitForDisplayed()
    assert.include(await selectionMenu.getText(), "2 selected")
    const stopButton = $(".torrent-selection-menu a[data-role='stop']")
    await stopButton.waitForClickable()
    await stopButton.click()

    await expectTorrentState(torrents[0].hash, "Paused")
    await expectTorrentState(torrents[1].hash, "Paused")
    assert.include(await getTorrentState(torrents[2].hash), "Downloading")

    const resumeButton = $(".torrent-selection-menu a[data-role='resume']")
    await resumeButton.waitForClickable()
    await resumeButton.click()

    await expectTorrentState(torrents[0].hash, "Downloading")
    await expectTorrentState(torrents[1].hash, "Downloading")
    assert.include(await getTorrentState(torrents[2].hash), "Downloading")
    await firstCheckbox.click()
    await secondCheckbox.click()
    await selectionMenu.waitForExist({ reverse: true })
  })

  it("shows the bottom selection menu with clear transport labels in every theme", async function () {
    this.timeout(180000)
    const terminalCheckbox = $(`#torrentTable tbody tr[data-id='${torrents[0].hash}'] .terminal-row-check`)
    await terminalCheckbox.scrollIntoView({ block: "center", inline: "nearest" })
    await terminalCheckbox.waitForClickable()
    await terminalCheckbox.click()
    const startIndex = DECK_THEME_ORDER.indexOf("terminal")
    for (let offset = 0; offset < DECK_THEME_ORDER.length; offset++) {
      const theme = DECK_THEME_ORDER[(startIndex + offset) % DECK_THEME_ORDER.length]
      if (offset > 0) {
        await cycleTheme()
      }
      await eventually(async () => $("html").getAttribute("data-theme")).equals(theme)
      await browser.pause(150)
      const core = DECK_CORE_THEMES[theme as keyof typeof DECK_CORE_THEMES]
      if (core) {
        await eventually(async () => $(".core-masthead h1").getText()).equals(core)
        assert.equal(await $$(".deck-stat-icon .core-stat-icon").length, 4)
        const meter = $(`#torrentTable tr[data-id='${torrents[0].hash}'] .core-progress`)
        await meter.waitForDisplayed()
        assert.equal(await meter.$("clipPath rect").getAttribute("width"), "42%")
      }
      const club = DECK_SPORTS_CLUBS[theme as keyof typeof DECK_SPORTS_CLUBS]
      if (club) {
        const heritage = $(".sports-facts-masthead")
        await heritage.waitForDisplayed()
        await eventually(async () => (await heritage.getText()).includes(club.venue)).equals(true)
        const copy = await heritage.getText()
        assert.include(copy, club.venue)
        assert.include(copy, String(club.established))
        assert.include(copy, String(club.opened))
        assert.equal(await $$(".deck-stat-icon .sports-stat-icon").length, 4)
      }
      if (theme === "independence") {
        await $(".usa-masthead").waitForDisplayed()
        assert.equal(await $$(".usa-flag-mark path").length, 50)
        await $(".usa-footer-eagle").waitForDisplayed()
      }
      if (theme === "matrix") {
        await eventually(async () => $$(".matrix-rain > span").length).equals(22)
        assert.equal(await $$(".matrix-rain > span").length, 22)
        assert.notInclude(await $(".matrix-masthead").getText(), "SOURCE")
        const progress = $(`#torrentTable tr[data-id='${torrents[0].hash}'] .matrix-code-progress`)
        await progress.waitForDisplayed()
        assert.equal(await progress.$("clipPath rect").getAttribute("width"), "42%")
      }
      const menu = $(".torrent-selection-menu")
      await menu.waitForDisplayed()
      assert.include(await menu.getText(), "1 selected")
      await menu.$("[data-role='selection-remove']").waitForClickable()
      await eventually(async () => {
        const menuPosition = await menu.getLocation()
        const menuSize = await menu.getSize()
        const footerPosition = await $("#page-torrents .status-bar").getLocation()
        return menuPosition.y + menuSize.height <= footerPosition.y + 1
      }).equals(true)
      const more = menu.$(".ui.labeled.icon.dropdown.button")
      await more.waitForClickable()
      if (theme !== "terminal") {
        const moreIcon = more.$(".icon")
        const iconPosition = await moreIcon.getLocation()
        const iconSize = await moreIcon.getSize()
        const textPosition = await more.$(".text").getLocation()
        assert.isAtMost(iconPosition.x + iconSize.width, textPosition.x + 1,
          `${theme}: dropdown icon does not overlap its label`)
      }
      await more.click()
      const dropdown = more.$(".menu")
      await dropdown.waitForDisplayed()
      const dropdownPosition = await dropdown.getLocation()
      const dropdownSize = await dropdown.getSize()
      const buttonPosition = await more.getLocation()
      assert.isAtMost(dropdownPosition.y + dropdownSize.height, buttonPosition.y + 1,
        `${theme}: extra actions open above the bottom menu`)
      await more.click()
      await dropdown.waitForDisplayed({ reverse: true })
      for (const selector of theme === "terminal"
        ? [".torrent-selection-menu"] : [".torrent-selection-menu", "#torrent-action-header"]) {
        for (const role of ["resume", "stop"]) {
          const button = $(`${selector} a[data-role='${role}']`)
          await button.waitForDisplayed()
          const label = button.$(".torrent-action-label")
          const icon = button.$(".icon")
          assert.isTrue(await label.isDisplayed(), `${theme}: ${role} label is visible`)
          if (theme === "terminal") {
            assert.isFalse(await icon.isDisplayed(), "Terminal uses text actions")
          } else {
            assert.isTrue(await icon.isDisplayed(), `${theme}: ${role} icon is visible`)
            const iconPosition = await icon.getLocation()
            const iconSize = await icon.getSize()
            const labelPosition = await label.getLocation()
            assert.isAtMost(iconPosition.x + iconSize.width, labelPosition.x + 1,
              `${theme}: ${role} icon does not overlap its label`)
          }
        }
      }
    }
    await cycleTheme()
    await eventually(async () => $("html").getAttribute("data-theme")).equals("terminal")
  })

  it("shows Matrix code progress in the details panel with independent SVG fills", async function () {
    await cycleTheme()
    await eventually(async () => $("html").getAttribute("data-theme")).equals("matrix")
    await $(`#torrentTable tr[data-id='${torrents[0].hash}'] .torrent-name-content`).doubleClick()
    const drawer = $(".torrent-details-panel .matrix-code-progress")
    await drawer.waitForDisplayed()
    const row = $(`#torrentTable tr[data-id='${torrents[0].hash}'] .matrix-code-progress`)
    assert.equal(await drawer.$("clipPath rect").getAttribute("width"), "42%")
    assert.notEqual(await drawer.$("pattern").getAttribute("id"), await row.$("pattern").getAttribute("id"))
    await $("[data-role='torrent-details-close']").click()
    await browser.keys("d")
    await browser.keys("t")
    await eventually(async () => $("html").getAttribute("data-theme")).equals("terminal")
  })

  it("removes the selected torrent from the Terminal menu after confirmation", async function () {
    const remove = $("[data-role='selection-remove']")
    await remove.waitForClickable()
    await remove.click()
    const modal = $("#deleteTorrentModal")
    await modal.waitForDisplayed()
    assert.include(await modal.getText(), "Selected torrent one")
    await modal.$("[data-role='remove-torrent-only']").waitForClickable()
    await modal.$(".deny.button").click()
    await modal.waitForDisplayed({ reverse: true })
    assert.isTrue(await $(`#torrentTable tbody tr[data-id='${torrents[0].hash}']`).isExisting())
    await remove.click()
    await modal.waitForDisplayed()
    await modal.$("[data-role='remove-torrent-only']").click()
    await eventually(async () => (await $$("#torrentTable tbody tr[data-id]")).length).equals(2)
    assert.isFalse(await $(`#torrentTable tbody tr[data-id='${torrents[0].hash}']`).isExisting())
    assert.isTrue(await $(`#torrentTable tbody tr[data-id='${torrents[2].hash}']`).isExisting())
    await $(".torrent-selection-menu").waitForExist({ reverse: true })
  })
})

async function invokeMockAction(action: string, ...args: any[]) {
  await browser.execute(async (request) => {
    await (window as any).electorrent.bittorrent.invokeAction(request)
  }, { action, args })
}

async function getSelectedIds() {
  const rows = await $$("#torrentTable tbody tr.active[data-id]")
  const ids: string[] = []
  for (const row of rows) {
    ids.push(await row.getAttribute("data-id"))
  }
  return ids
}

async function getTorrentState(id: string) {
  return $(`#torrentTable tbody tr[data-id='${id}'] td[data-col='statusMessage']`).getText()
}

async function expectTorrentState(id: string, expected: string) {
  await new Torrent({ id, app: getTestFixture().app }).waitForState(expected)
}
