# Opening torrent files with Torrent-Deck

Install the new release and launch Torrent-Deck once. Renaming the source alone cannot change an operating system's existing default-app choice. Development Electron sessions intentionally do not register file handlers.

## macOS

Drag **Torrent-Deck.app** from its DMG into `/Applications`, replacing the existing Torrent-Deck copy on future updates, then open it. It has its own bundle ID `com.github.micro23.torrentdeck` and registers the BitTorrent type and the extension's preferred UTI. The original Electorrent and other torrent clients retain their own identities and settings.

Use Help → Make Torrent-Deck Default for Torrent Files if needed. If a particular file still opens elsewhere, Finder → Get Info → Open with → Torrent-Deck → Change All applies the Finder override. Quit an older running copy when manually replacing the app. Unsigned builds may need approval in System Settings.

## Windows

The installer and app register Torrent-Deck's executable and `.torrent` capabilities. On first launch, if another app owns the protected Windows UserChoice association, Default Apps opens: choose Torrent-Deck for `.torrent`. The app does not fabricate or modify UserChoice hashes. Help can reopen setup. Subsequent installs replace the same application path; registration refreshes it on launch.

Microsoft documents the user-controlled [default apps platform](https://learn.microsoft.com/windows/apps/develop/windows-integration/default-apps-platform). An application cannot promise to silently override a protected user selection on every Windows version.

## Linux

The app writes a Torrent-Deck desktop entry under the user's XDG applications directory and sets `application/x-bittorrent` using `xdg-mime`. AppImage registration uses the persistent AppImage path, rather than its temporary mount directory; Snap uses its stable launcher. Desktop support for `xdg-mime` is required. Help repeats registration; desktops may also offer Open With → Torrent-Deck → Always use.

## Updates and profiles

Torrent-Deck uses a separate settings/profile folder. On first launch it copies the existing fork configuration and certificates, preferring `Electorrent-micro23`, then legacy `Electorrent`. Originals are preserved. Its instance lock is separate from upstream Electorrent, so opening files cannot be forwarded into the original app. A recorded newer Torrent-Deck executable is not overwritten by an older copy's registration; newer launches can replace an older running Torrent-Deck instance.

Other applications can change OS defaults after installation. Launch Torrent-Deck or use Help to restore its association. Only macOS installers are compiled currently; Windows/Linux registration code is maintained, but should be exercised on those systems when their releases resume.
