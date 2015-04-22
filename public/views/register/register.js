app.controller("RegisterCtrl", function ($scope, $http, $location, $rootScope) {

    $rootScope.message = 'Woo!'

    $scope.register = function (user) {
        console.log(user);
        if (user.password != user.password2 || !user.password || !user.password2) {
            $rootScope.message = "Your passwords don't match";
        }
        else {
            $http.post("/register", user)
            .success(function (response) {
                console.log(response);
                if (response != null) {
                    $rootScope.currentUser = response;
                    $location.url("/login");
                }
                else {
                    $rootScope.message = "That username already exists! Please select a new one!"
                }
            });
        }
    }
});