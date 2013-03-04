'use strict';

Geotool.Filters.filter('round', function() {
  return function(number) {
    if(number === null) return 0;
    return Math.round(number * 10000) / 10000;
  }
});

Geotool.Filters.filter('markerToString', ['$filter', function($filter) {
  return function(marker) {
    return $filter('round')(marker.position.lat()) + "," + $filter('round')(marker.position.lng());
  }
}]);

Geotool.Filters.filter('circleToString', ['$filter', function($filter) {
  return function(circle) {
    return $filter('round')(circle.circle.center.lat()) + "," + $filter('round')(circle.circle.center.lng());
  }
}]);

Geotool.Filters.filter('markerArrayToString', ['$filter', function($filter) {
  return function(markers) {
    var markerArray = [];
    angular.forEach(markers, function(m) {
      markerArray.push([$filter('round')(m.position.lat()), $filter('round')(m.position.lng())]);
    });
    return markerArray;
  }
}]);