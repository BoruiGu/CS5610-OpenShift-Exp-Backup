var app = angular.module("ListManagement", []);

app.controller("ListManagementCtrl", function ($scope, $http, $q) {
    var vns = null;
    $http.get('/api/vns').then(updateVns($scope));

    var headers = ["title", "date", "rating"];
    var stateHeaders = ["", "", ""];
    var lastChecked = -1;

    var selected = [];
    var chkbox = [];
      
    $scope.chkbox = chkbox;    
    $scope.headers = headers;
    $scope.selected = selected;

    $scope.addItem = function (vn) {
        /* use constructor function for type casting */
        var newVn = new vn_(vn.title, vn.date, vn.rating);
        $http.post('/api/vns/', vn).then(updateVns($scope));
        chkbox.push(false);
        $scope.vn = {};
    };

    $scope.removeItem = function (vn) {
        var index = vns.indexOf(vn);
        $http.delete('/api/vns/index/' + index).then(updateVns($scope));
        for (var i in selected) {
            if (selected[i] == vn.title) {
                selected.splice(i, 1);
                chkbox.splice(index, 1);
                break;
            }
        }
    };    

    function startSort(event, ui) {
        ui.item.data("oldIndex", ui.item.index());
    }

    function updateSort(event, ui) {
        var newIndex = ui.item.index();
        var oldIndex = ui.item.data("oldIndex");
        $http.post('/api/vns/updateSort/' + oldIndex + '/' + newIndex).then(updateVns($scope));
        chkbox.splice(newIndex, 0, chkbox.splice(oldIndex, 1)[0]);
        lastChecked = -1;
    }

    /*This statement must be placed after definition of 
      startSort and updateSort */
    $("tbody").sortable({
        start: startSort,
        update: updateSort
    });

    $scope.sortItem = function (field) {
        var index = headers.indexOf(field);
        var state = stateHeaders[index];
        stateHeaders = ["", "", ""];

        if (state == "asc") state = "desc";
        else state = "asc";

        stateHeaders[index] = state;

        $http.post('/api/vns/sort/' + state + '/' + field).then(updateVns($scope));                
    };

    $scope.isAsc = function (index) {
        if (stateHeaders[index] == "asc") return true;
        else return false;
    }

    $scope.isDesc = function (index) {
        return stateHeaders[index] == "desc";
    }

    $scope.hasSelect = function () {
        return (selected.length > 0);
    }   

    $scope.idxSelected = function (vn) {
        return selected.indexOf(vn.title);
    };

    $scope.flipSelected = function (event, vn) {
        /* Do nothing if click on delete button */
        if (event.target.className == "glyphicon glyphicon-trash"
            || event.target.className == "btn btn-danger") return;
        var index = $scope.idxSelected(vn);
        if (index == -1) {
            var currIdx = vns.indexOf(vn);
            if (lastChecked == -1 || event.shiftKey == false) {
                selected.push(vn.title);
                chkbox[currIdx] = true;
            } else {                
                for (var i = lastChecked + 1; i <= currIdx; i++) {
                    if (selected.indexOf(vns[i].title) == -1)
                        selected.push(vns[i].title);
                    chkbox[i] = true;
                }
            }
            lastChecked = currIdx;
        } else {
            selected.splice(index, 1);
            chkbox[vns.indexOf(vn)] = false;
            lastChecked = -1;
        }
    };

    $scope.removeSelectedItems = function () {
        var promise = [];
        var index;
        for (var i in selected) 
            promise[i] = $http.delete('api/vns/name/', vns[k].title);
        $q.all(promise).then(updateVns_DS($scope, selected.length));
    }

    $scope.reset = function () {
        $http.post('/api/vns/reset').then(updateVns_R($scope));
    };

    function updateVns($scope) {
        return function (response) {
            vns = response.data;
            lastChecked = -1;
            if (chkbox.length == 0) {
                for (var i = 0; i < vns.length; i++)
                    chkbox.push(false);
            } else {
                for (var i in vns) {
                    var vn = vns[i];
                    if (selected.indexOf(vn.title) != -1) {
                        chkbox[i] = true;
                    } else {
                        chkbox[i] = false;
                    }
                }
            }
            $scope.vns = vns;
        }
    }

    function updateVns_DS($scope, length) {
        return function (response) {
            vns = response[length - 1].data;
            $scope.vns = vns;
            resetSelect();
        }
    }

    function updateVns_R($scope) {
        return function (response) {
            vns = response.data;
            $scope.vns = vns;
            resetSelect();
        }
    }

    function resetSelect() {
        chkbox = [];
        selected = [];
        lastChecked = -1;
        for (var i = 0; i < vns.length; i++)
            chkbox.push(false);
        $scope.chkbox = chkbox;
        $scope.selected = selected;
    }
});

function vn_(title, date, rating) {
    this.title = String(title);
    this.date = String(date);
    this.rating = rating;
}