var app = angular.module("AllThingsCars", ["ngRoute"]);

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
        templateUrl: 'views/profile/profile.html',
        controller: 'ProfileCtrl'
    })
    .when('/contact', {
        templateUrl: 'views/contact/contact.html'
    })
    .otherwise({
        redirectTo: '/home'
    })
});