export class ProgressController {
    torrent: any;

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
        if (this.torrent.isStatusDownloading() || this.torrent.isStatusCompleted() || this.torrent.isStatusSeeding()) {
            label += ` ${this.torrent.getPercentStr()}`;
        }

        return label;
    }
}
