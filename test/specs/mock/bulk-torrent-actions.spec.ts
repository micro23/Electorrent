import chai from "chai"
import { Key } from "webdriverio"
import { $, $$, browser } from "@wdio/globals"
import { Torrent } from "../../e2e/e2e_torrent"
import { eventually } from "../../e2e/eventually"
import { configureSpec, getTestFixture } from "../../framework/fixture"

const assert: Chai.AssertStatic = chai.assert

const torrents = [
  { hash: "11".padStart(40, "0"), name: "Selected torrent one", state: "downloading" },
  { hash: "22".padStart(40, "0"), name: "Selected torrent two", state: "downloading" },
  { hash: "33".padStart(40, "0"), name: "Unselected torrent", state: "downloading" },
]

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

  it("keeps rows accessible for range selection with bottom details open", async function () {
    const first = $(`#torrentTable tbody tr[data-id='${torrents[0].hash}'] td[data-col='decodedName']`)
    const second = $(`#torrentTable tbody tr[data-id='${torrents[1].hash}'] td[data-col='decodedName']`)
    await first.waitForClickable()
    await first.click()
    await browser.action("key").down(Key.Shift).perform(true)
    try {
      await second.waitForClickable()
      await second.click()
    } finally {
      await browser.action("key").up(Key.Shift).perform()
    }
    await eventually(getSelectedIds).satisfies("select both rows", (ids) => ids.length === 2
      && ids.includes(torrents[0].hash) && ids.includes(torrents[1].hash))
  })

  it("applies a stop and resume action to every selected torrent", async function () {
    const firstName = $(`#torrentTable tbody tr[data-id='${torrents[0].hash}'] td[data-col='decodedName']`)
    await firstName.click()
    const secondSelected = await $(`#torrentTable tbody tr[data-id='${torrents[1].hash}']`)
    const secondCheckbox = secondSelected.$(".terminal-row-check")
    // First row is selected by its name; add the second through its checkbox.
    await secondCheckbox.waitForClickable()
    await secondCheckbox.click()

    await eventually(getSelectedIds).satisfies(
      "include both selected torrents",
      (ids) => ids.length === 2
        && ids.includes(torrents[0].hash)
        && ids.includes(torrents[1].hash),
    )

    const stopButton = $("#torrent-action-header a[data-role='stop']")
    await stopButton.waitForClickable()
    await stopButton.click()

    await expectTorrentState(torrents[0].hash, "Stopped")
    await expectTorrentState(torrents[1].hash, "Stopped")
    assert.include(await getTorrentState(torrents[2].hash), "Downloading")

    const resumeButton = $("#torrent-action-header a[data-role='resume']")
    await resumeButton.waitForClickable()
    await resumeButton.click()

    await expectTorrentState(torrents[0].hash, "Downloading")
    await expectTorrentState(torrents[1].hash, "Downloading")
    assert.include(await getTorrentState(torrents[2].hash), "Downloading")
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
