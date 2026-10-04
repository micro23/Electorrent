export class WelcomePageController {
    static $inject = ["$scope", "$btclients", "settingsService", "Server"];

    constructor(
        $scope: any,
        $btclients: any,
        settingsService: any,
        Server: any,
    ) {
        $scope.connecting = false;
        $scope.btclients = $btclients;
        $scope.server = new Server();
        function clearForm() {
            $scope.server = new Server();
        }

        $scope.connect = () => {
            $scope.connecting = true;

            settingsService.saveServer($scope.server).then(() => {
                $scope.$emit("connect:server", $scope.server, true);
                clearForm();
            }).catch((err: unknown) => {
                console.error(err);
            }).finally(() => {
                $scope.connecting = false;
            });
        };

    }
}
