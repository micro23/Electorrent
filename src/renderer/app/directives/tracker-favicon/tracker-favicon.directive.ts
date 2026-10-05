import { IAugmentedJQuery, IDirective, IDirectiveFactory, IScope } from "angular"

export class HideBrokenImageDirective implements IDirective {
    restrict = "A"

    static getInstance(): IDirectiveFactory {
        return () => new HideBrokenImageDirective()
    }

    link(_scope: IScope, element: IAugmentedJQuery) {
        element.on("error", () => element.prop("hidden", true))
        element.on("load", () => element.prop("hidden", false))
    }
}
