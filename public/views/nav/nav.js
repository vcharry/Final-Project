app.controller("NavCtrl", function ($scope, $http, $location, $rootScope) {

    // logout function bound to navbar to manipulate which
    // links to show users
    $scope.logout = function () {
        // if logout clicked, log user out
        $http.post("/logout")
        .success(function () {
            $rootScope.currentUser = null;
            $location.url("/home");
        });
    }
});