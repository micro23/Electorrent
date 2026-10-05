import type { IDirective, IDirectiveFactory } from "angular";
import html from "./forest-artwork.template.html";

export class ForestArtworkDirective implements IDirective {
    restrict = "E";
    scope = { kind: "@" };
    template = html;

    static getInstance(): IDirectiveFactory {
        return () => new ForestArtworkDirective();
    }
}
