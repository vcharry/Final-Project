app.controller("DetailsCtrl", function ($scope, $http, $location, $rootScope) {

    // currentCar 
    //{"make":"Bentley","model":"Flying Spur","year":2014,"yearID":200464775,"makeNiceName":"bentley","modelNiceName":"flying-spur"} 
    $scope.detailsFlag = 0;
    console.log("rS currentCar: ", $rootScope.currentCar);
    $scope.currCar = $rootScope.currentCar;

    var edmundsKey = '6uxrsuqw542pu8b7d8nx2gj6';

    // Get specific car details from Edmunds API
    var apiMake = $rootScope.currentCar.makeNiceName;
    var apiModel = $rootScope.currentCar.modelNiceName;
    var apiYear = $rootScope.currentCar.year;

    $http.post('/make/model/year', { make: apiMake, model: apiModel, year: apiYear })
    .success(function (response) {
        $scope.carDetails = response;
        console.log(response);
    });

    // Check if car is user's favorite
    if ($scope.currentUser) {
        var userFavs = $scope.currentUser.favorites;
        var currCar = $rootScope.currentCar;
        for (i = 0; i < userFavs.length; i++) {
            if ((userFavs[i].make == currCar.make) && (userFavs[i].model == currCar.model) && (userFavs[i].year == currCar.year))
            { $scope.isUserFavorite = 1; }
        }
    };

    $http.get("/rest/car")
    .success(function (cars) {
        $scope.cars = cars; // all cars in DB
        console.log(cars);
        // find the comments for this car
        for (i = 0; i < cars.length; i++) {
            if ((cars[i].make == $rootScope.currentCar.make) && (cars[i].model == $rootScope.currentCar.model) && (cars[i].year == $rootScope.currentCar.year)) {
                $scope.thisCar = cars[i];
                $scope.comments = cars[i].comments;
                $scope.car_id = cars[i]._id;
            }
        }
    });

    // Save comment
    $scope.submit = function (comment) {

        // Car details dont exist in the DB
        if ($scope.car_id == null) {
            var user = $rootScope.currentUser.username;
            var vehicle = $rootScope.currentCar;
            var car = {
                make: vehicle.make,
                model: vehicle.model,
                year: vehicle.year,
                yearID: vehicle.yearID,
                makeNiceName: vehicle.makeNiceName,
                modelNiceName: vehicle.modelNiceName,
                comments: [{
                    user: user,
                    comment: comment
                }]
            }
            console.log(car);

            $http.post("/rest/car", car)
            .success(function (response) {
                console.log("details.js post/rest/car, ", response);
                $scope.thisCar = response;
                $scope.comments = response.comments;
            });
        }
        else {
            var user = $rootScope.currentUser.username;
            var updateCar = $scope.thisCar;
            updateCar.comments.push({ user: user, comment: comment });
            // use _id to update
            console.log(updateCar);
            $http.put("/rest/car/" + updateCar._id, updateCar)
            .success(function (cars) {
                $scope.cars = cars; // all cars in DB

                for (i = 0; i < cars.length; i++) {
                    if ((cars[i].make == $rootScope.currentCar.make) && (cars[i].model == $rootScope.currentCar.model) && (cars[i].year == $rootScope.currentCar.year)) {
                        $scope.thisCar = cars[i];
                        $scope.comments = cars[i].comments;
                        $scope.car_id = cars[i]._id;
                    }
                }
            })

        }
        
    } // end of submit()

    var baseMediaUrl = "https://media.ed.edmunds-media.com";
    var photoInfoList = [];

    // Get photos by make, model, year
    $http.get("https://api.edmunds.com/api/media/v2/" + apiMake + "/" + apiModel + "/" + apiYear + "/photos?provider=oem&pagenum=1&pagesize=10&view=basic&api_key=" + edmundsKey)
    .success(function (response) {
        //$scope.stylePhotos = response;
        console.log("photos ", response);

        //$scope.photosList = response.photos;
        var photos_list = response.photos;

        // For every photo object in the response
        for (i = 0; i < photos_list.length; i++) {

            // For every source object in the sources
            for (j = 0; j < photos_list[i].sources.length; j++) {
                var photoObject = {
                    title: photos_list[i].title,
                    category: photos_list[i].category,
                    href: baseMediaUrl + photos_list[i].sources[j].link.href,
                    width: photos_list[i].sources[j].size.width,
                    height: photos_list[i].sources[j].size.height
                };
                photoInfoList.push(photoObject);
            };
        };
        $scope.photoInfoList = photoInfoList;
    }); // end of request for images
        
    $scope.change = function () {

        /* $scope.carStyle object
        { id: 100773420, name: "2dr Coupe AWD (8.0L 16cyl Turbo 7A)", submodel: Object, trim: "Base" }
        */
        $scope.detailsFlag = 1;
        console.log($scope.carStyle);

        var styleId = $scope.carStyle.id;
        var styleIdDetails;

        // Details by Style ID
        $http.post('/styleId/details', { styleId: styleId, view: 'full'})
        .success(function (response) {
            $scope.styleDetails = response;
            styleIdDetails = response;
            console.log(response);

            $scope.categories = styleIdDetails.categories || null; // { EPAClass:, market:, primaryBodyType:, vehicleSize:, vehicleStyle:, vehicleType:}
            $scope.numDoors = styleIdDetails.numOfDoors || null;
            $scope.drivenWheels = styleIdDetails.drivenWheels || null;
            $scope.price = styleIdDetails.price|| null;
            $scope.mpg = styleIdDetails.MPG || null; // { city:, highway: }
            $scope.submodel = styleIdDetails.submodel || null; // { body: }
            $scope.colors = styleIdDetails.colors || null; // [ { category:, options = [ {name:} ] } ]
            $scope.trim = styleIdDetails.trim || null; // string
            $scope.engine = styleIdDetails.engine || null; // { ---- }
            $scope.transmission = styleIdDetails.transmission || null; // { name:, numberOfSpeeds:, transmissionType:}
            $scope.optional = styleIdDetails.options || null; // [ { category:, options = [ {name:, (description:) } ] } ]

        });
    };

    $scope.favoriteCar = function (user) {
        // If user not signed in
        if (!$rootScope.currentUser) {
            $scope.promptLogin = 1;
        }
        else {
            $rootScope.currentUser.favorites.push($rootScope.currentCar)
            // add car id to DB 
            $http.put('/rest/user/' + user._id, user)
            .success(function (users) {
                $scope.isUserFavorite = 1;
            });
        }
    };

    $scope.unfavoriteCar = function (user) {
        // Adds the cars id to the user

        // If user not signed in
        if (!$rootScope.currentUser) {
            $scope.promptLogin = 1;
        }
        else {
            var index = $rootScope.currentUser.favorites.indexOf($rootScope.currentCar);
            $rootScope.currentUser.favorites.splice(index, 1);
            // add car id to DB 
            $http.put('/rest/user/' + user._id, user)
            .success(function (users) {
                $scope.isUserFavorite = 0;
            });
        }
    };
});
