export class ProgressController {
    torrent: any;
    svgId = "";

    matrixState() {
        if (this.torrent.isStatusError()) return "error";
        if (this.percentValue() >= 99.95) return "complete";
        if (this.torrent.isStatusChecking()) return "checking";
        if (this.torrent.isStatusPaused() || this.torrent.isStatusStopped()) return "paused";
        if (this.torrent.isStatusQueued()) return "queued";
        return this.torrent.isStatusDownloading() ? "downloading" : "idle";
    }

    class() {
        return this.torrent.statusColor();
    }

    status() {
        return this.torrent.statusText();
    }

    percentage() {
        return this.torrent.getPercentStr();
    }

    percentValue() {
        return Math.max(0, Math.min(100, Math.floor(this.torrent.percent || 0) / 10));
    }

    label() {
        let label = this.torrent.statusText();
        if (!this.torrent.isStatusChecking() && (this.torrent.isStatusDownloading() || this.torrent.isStatusCompleted() || this.torrent.isStatusSeeding())) {
            label += ` ${this.torrent.getPercentStr()}`;
        }

        return label;
    }
}
