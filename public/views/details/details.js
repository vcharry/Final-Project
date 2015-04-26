app.controller("DetailsCtrl", function ($scope, $http, $location, $rootScope) {

    $scope.detailsFlag = 0;
    console.log("rS currentCar: ", $rootScope.currentCar);
    $scope.currCar = $rootScope.currentCar;

    var edmundsKey = '6uxrsuqw542pu8b7d8nx2gj6';

    // Get specific car details from Edmunds API
    var apiMake = $rootScope.currentCar[4];
    var apiModel = $rootScope.currentCar[5];
    var apiYear = $rootScope.currentCar[2];

    $http.post('/make/model/year', { make: apiMake, model: apiModel, year: apiYear })
    .success(function (response) {
        $scope.carDetails = response;
        console.log(response);
    });

    var baseMediaUrl = "https://media.ed.edmunds-media.com";
    var photoInfoList = [];

    // Get photos by make, model, year
    // Currently NOT approved
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
                /*
                var photoTitle = photos_list[i].title;
                var photoCategory = photos_list[i].category;
                var photoHref = photos_list[i].sources[j].link.href;
                var photoWidth = photos_list[i].sources[j].size.width;
                var photoHeight = photos_list[i].sources[j].size.height;
                */
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

    });
        
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

    // FIX THIS
    $scope.favoriteCar = function () {
        // Adds the cars id to the user
        
        // If user not signed in
        if (!$rootScope.currentUser) {
            $scope.promptLogin = 1;
        }
        else {
            // add car id to DB 
            $http.post('/favoriteCar', currentCar)
            .success(function (response) {
                console.log(response);

            })
        }
    };
});
