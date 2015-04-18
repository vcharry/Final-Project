app.controller("LoginCtrl", function ($scope, $http) {
    $scope.login = function (user) {
        console.log(user);

        $http.post('/login', user)
        .success(function (response) {
            console.log(response);
        });

    };
});