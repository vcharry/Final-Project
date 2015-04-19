var app = angular.module("Passport", ["ngRoute"]);

app.config(function($routeProvider) {
    $routeProvider
     .when('/home', {
         templateUrl: 'views/home/home.html'
     })
    .when('/login', {
        templateUrl: 'views/login/login.html',
        controller: 'LoginCtrl'
    })
    .when('/register', {
        templateUrl: 'views/register/register.html',
        controller: 'RegisterCtrl'
    })
    .when('/profile', {
        templateUrl: 'views/profile/profile.html'
    })
    .when('/contact', {
        templateUrl: 'views/contact/contact.html'
    })
    .otherwise({
        redirectTo: '/home'
    })
});