import { IDocumentService, IScope, IWindowService } from "angular";
import type { ElectorrentRootScope } from "@renderer/app/types/root-scope";

type TorrentDetailsTab = "info" | "files" | "peers" | "trackers";

export interface TorrentDetailsPanelScope extends IScope {
  isOpen: boolean;
  torrent: any;
  refresh: number;
  activeTab: TorrentDetailsTab;
}

export class TorrentDetailsPanelController {
  static $inject = ["$scope", "$rootScope", "$window", "$document"];

  private readonly defaultPanelHeight = 320;
  private readonly minPanelHeight = 220;
  private panelHeight = this.defaultPanelHeight;
  private panelWidth = 400;
  private isSidePanel() {
    return this.rootScope.deckTheme === "darkhand" && this.rootScope.deckLayout?.details === "right" && this.$window.innerWidth > 1100;
  }
  private stopResizeListeners?: () => void;

  constructor(
    public scope: TorrentDetailsPanelScope,
    private rootScope: ElectorrentRootScope,
    private $window: IWindowService,
    private $document: IDocumentService,
  ) {
    try {
      const saved = JSON.parse(this.$window.localStorage.getItem("electorrent-deck-details-size") || "{}");
      this.panelHeight = Math.max(this.minPanelHeight, Math.min(600, Number(saved.height) || this.defaultPanelHeight));
      this.panelWidth = Math.max(320, Math.min(720, Number(saved.width) || 400));
    } catch { /* Use the default panel size. */ }
    this.scope.isOpen = false;
    this.scope.torrent = null;
    this.scope.refresh = 0;
    this.scope.activeTab = this.defaultTab();

    const openListener = this.rootScope.$on("torrentDetails:open", (_event, torrent) => {
      this.open(torrent);
    });
    const syncListener = this.rootScope.$on("torrentDetails:sync", (_event, torrent, allowOpen) => {
      if (!this.scope.isOpen) {
        if (allowOpen && this.rootScope.deckTheme === "darkhand" && torrent) this.open(torrent);
        else return;
      }

      if (!torrent) {
        this.clearSelection();
        return;
      }

      this.scope.torrent = torrent;
      this.scope.refresh += 1;
    });
    const resetListener = this.rootScope.$on("wipe:torrents", () => {
      this.close();
    });
    const escapeListener = this.rootScope.$on("shortcut:escape", () => {
      if (this.scope.isOpen) this.close();
    });

    this.scope.$on("$destroy", () => {
      openListener();
      syncListener();
      resetListener();
      escapeListener();
      this.stopResizeListeners?.();
    });
  }

  open(torrent: any) {
    if (!torrent) {
      return;
    }

    this.scope.isOpen = true;
    this.scope.activeTab = this.defaultTab();
    this.scope.torrent = torrent;
    document.querySelector<HTMLElement>("#page-torrents")?.style.setProperty("--deck-details-width", `${this.panelWidth}px`);
    this.scope.refresh += 1;
  }

  close() {
    this.stopResizeListeners?.();
    this.scope.isOpen = false;
    this.scope.activeTab = "info";
    this.clearSelection();
  }

  showTab(tab: TorrentDetailsTab) {
    this.scope.activeTab = tab;
  }

  isActiveTab(tab: TorrentDetailsTab) {
    return this.scope.activeTab === tab;
  }

  panelStyle() {
    return this.isSidePanel() ? { width: `${this.panelWidth}px`, height: "auto" } : { height: `${this.panelHeight}px`, width: "100%" };
  }

  canShowPeers() {
    return !!this.rootScope.$btclient?.features.torrentPeers;
  }

  canShowDetails() {
    return !!this.rootScope.$btclient?.features.torrentDetails;
  }

  canShowTrackers() {
    return !!this.rootScope.$btclient?.features.torrentTrackers;
  }

  canManageTrackers() {
    return !!this.rootScope.$btclient?.features.torrentTrackerManagement;
  }

  openAddTracker() {
    this.scope.$broadcast("torrentDetailsTrackers:add");
  }

  startResizing(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const side = this.isSidePanel();
    const startY = side ? event.clientX : event.clientY;
    const startHeight = side ? this.panelWidth : this.panelHeight;
    const documentRef = this.$document[0];

    this.stopResizeListeners?.();

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = startY - (side ? moveEvent.clientX : moveEvent.clientY);
      const maxHeight = side ? Math.min(720, this.$window.innerWidth * .45) : Math.max(this.minPanelHeight, (this.$window.innerHeight || startHeight) - 140);
      const nextHeight = Math.max(side ? 320 : this.minPanelHeight, Math.min(maxHeight, startHeight + delta));

      this.scope.$evalAsync(() => {
        if (side) {
          this.panelWidth = nextHeight;
          document.querySelector<HTMLElement>("#page-torrents")?.style.setProperty("--deck-details-width", `${nextHeight}px`);
        } else this.panelHeight = nextHeight;
      });
    };

    const onMouseUp = () => {
      try { this.$window.localStorage.setItem("electorrent-deck-details-size", JSON.stringify({ height: this.panelHeight, width: this.panelWidth })); } catch { /* Resizing still works without storage. */ }
      documentRef.removeEventListener("mousemove", onMouseMove);
      documentRef.removeEventListener("mouseup", onMouseUp);
      this.stopResizeListeners = undefined;
    };

    documentRef.addEventListener("mousemove", onMouseMove);
    documentRef.addEventListener("mouseup", onMouseUp);
    this.stopResizeListeners = onMouseUp;
  }

  private clearSelection() {
    this.scope.torrent = null;
    this.scope.refresh += 1;
  }

  private defaultTab(): TorrentDetailsTab {
    return this.rootScope.$btclient?.features.torrentDetails ? "info" : "trackers";
  }
}
