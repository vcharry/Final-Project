app.controller("SearchCtrl", function ($scope, $http, $location, $rootScope) {

    
    $http.get("/makes")
    .success(function (response) {
        $scope.makes = response.makes;
        console.log(response.makes);

        // Search page restarted
        $scope.searchFlag = 0;
    });
    
    $scope.search = function () {

        var myMake = $scope.myCarMake;
        var myModel = $scope.myCarModel;
        var myYear = $scope.myCarYear;

        /* 
        make object:
        { id: 200000001, name: "Audi", niceName: "audi", models: Array[35] }
        model object:
        { id: "Audi_R8", name: "R8", niceName: "r8", years: Array[8] }
        year object:
        { id: 100531909, year: 2012 }
        */

        console.log("Searching..");
        console.log("make: ", myMake);
        console.log("model: ", myModel);
        console.log("year: ", myYear);

        var allCars = [];
        var allMakes = $scope.makes;

        // Return result list of every car
        
        for (i = 0; i < allMakes.length; i++) {
            for (j = 0; j < allMakes[i].models.length; j++) {
                for (k = 0; k < allMakes[i].models[j].years.length; k++) {
                    var car = {
                        make: allMakes[i].name,
                        model: allMakes[i].models[j].name,
                        year:allMakes[i].models[j].years[k].year,
                        yearID: allMakes[i].models[j].years[k].id,
                        makeNiceName: allMakes[i].niceName,
                        modelNiceName: allMakes[i].models[j].niceName
                    };
                    allCars.push(car);
                    //console.log(car);
                }
            }
        }
        
        // If no make selected, send all
        if (myMake == null) {
            $scope.resultList = allCars;
        }
        else {
            // If no model selected, send all models for make
            if (myModel == null) {
                var allModels = [];
                for (i = 0; i < allCars.length; i++) {
                    if (myMake.name == allCars[i].make) {
                        allModels.push(allCars[i]);
                    }
                }
                console.log("Num Models: ", allModels.length);
                $scope.resultList = allModels;
            }
            else {
                // If no year selected, send all years per model
                if (myYear == null) {
                    var allYears = [];
                    for (i = 0; i < allCars.length; i++) {
                        if ((myMake.name == allCars[i].make) && (myModel.name==allCars[i].model)) {
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
                        if ((myMake.name == allCars[i].make) && (myModel.name == allCars[i].model) && (myYear.year == allCars[i].year)) {
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

});