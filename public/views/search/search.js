app.controller("SearchCtrl", function ($scope, $http, $location, $rootScope) {

    
    $http.get("/makes")
    .success(function (response) {
        $scope.makes = response.makes;
        console.log(response.makes);

        // Search page restarted
        $scope.searchFlag = 0;
    });
    
    $scope.search = function () {

        var make = $scope.myCarMake;
        var model = $scope.myCarModel;
        var year = $scope.myCarYear;

        /* 
        make object:
        { id: 200000001, name: "Audi", niceName: "audi", models: Array[35] }
        model object:
        { id: "Audi_R8", name: "R8", niceName: "r8", years: Array[8] }
        year object:
        { id: 100531909, year: 2012 }
        */

        console.log("Searching..");
        console.log("make: ", make);
        console.log("model: ", model);
        console.log("year: ", year);

        var allCars = [];
        var allMakes = $scope.makes;

        // Return result list of every car
        
        for (i = 0; i < allMakes.length; i++) {
            for (j = 0; j < allMakes[i].models.length; j++) {
                for (k = 0; k < allMakes[i].models[j].years.length; k++) {
                    var car = [
                        allMakes[i].name,
                        allMakes[i].models[j].name,
                        allMakes[i].models[j].years[k].year,
                        allMakes[i].models[j].years[k].id,
                        allMakes[i].niceName,
                        allMakes[i].models[j].niceName
                    ];
                    allCars.push(car);
                    //console.log(car);
                }
            }
        }
        
        // If no make selected, send all
        if (make == null) {
            $scope.resultList = allCars;
        }
        else {
            // If no model selected, send all models for make
            if (model == null) {
                var allModels = [];
                for (i = 0; i < allCars.length; i++) {
                    if (make.name == allCars[i][0]) {
                        allModels.push(allCars[i]);
                    }
                }
                console.log("Num Models: ", allModels.length);
                $scope.resultList = allModels;
            }
            else {
                // If no year selected, send all years per model
                if (year == null) {
                    var allYears = [];
                    for (i = 0; i < allCars.length; i++) {
                        if ((make.name == allCars[i][0]) && (model.name==allCars[i][1])) {
                            allYears.push(allCars[i]);
                        }
                    }
                    console.log("Num Years: ", allYears.length);
                    $scope.resultList = allYears;
                }
                else {
                    // For a specific Make-Model-Car
                    var exactCar = [];
                    for (i = 0; i < allCars.length; i++) {
                        if ((make.name == allCars[i][0]) && (model.name == allCars[i][1]) && (year.year == allCars[i][2])) {
                            exactCar.push(allCars[i]);
                        }
                    }
                    console.log("Num Exact: ", exactCar.length);
                    $scope.resultList = exactCar;
                }
            }

        }
        
        $scope.searchFlag = 1;
        console.log($scope.resultList.length);
    };

    /*
    $scope.searchByMake = function () {
        var make = $scope.carmake;
        $http.get("/make/models", make)
        .success(function (models) {
            $scope.models = models;
        })
    }*/




    //var carmodels = $scope.makes[$scope.carmake].models;
    //console.log(carmodels);
    //$scope.carmodels = carmake.models;
    /*
    var make = $scope.carmake;

    $http.get("/make/models", make)
    .success(function (models) {
        $scope.models = models;
        console.log(models);
    })
    */
});