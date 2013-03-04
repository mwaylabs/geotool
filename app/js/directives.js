'use strict';

Geotool.Directives.directive('geotoolMap', function () {
  return {
    restrict:'A',
    templateUrl:'templates/geotool-map.html',
    link:function ($scope, element) {
      $scope.markers = [];
      $scope.circles = [];
      $scope.radius = 1;

      $scope.map = new google.maps.Map(element.find('#map_canvas')[0], {
        center:new google.maps.LatLng(48.7722, 9.18053),
        zoom:12,
        mapTypeId:google.maps.MapTypeId.ROADMAP
      });

      $scope.polygonMarkers = [];
      $scope.polygonPath = new google.maps.MVCArray;
      $scope.polygon = new google.maps.Polygon({
        map: $scope.map,
        strokeColor:"green",
        strokeOpacity:0.8,
        strokeWeight:2,
        fillColor:"green",
        fillOpacity:0.35,
        paths: new google.maps.MVCArray([$scope.polygonPath])
      });

      google.maps.event.addListener($scope.map, 'click', $scope.mapClicked);

      $scope.overlayType = 'marker';
    },
    controller:['$scope', '$filter', function ($scope, $filter) {
      $scope.mapClicked = function (event) {
        if ($scope.overlayType === 'marker') $scope.addMarker(event.latLng);
        if ($scope.overlayType === 'circle') $scope.addCircle(event.latLng);
        if ($scope.overlayType === 'polygon') $scope.addToPolygon(event.latLng);
        $scope.$apply();
      }

      $scope.addMarker = function (latLng) {
        var marker = new google.maps.Marker({
          position:latLng,
          map:$scope.map,
          draggable: true
        });

        var infowindow = new google.maps.InfoWindow({
          content:$filter('round')(latLng.lat()) + ", " + $filter('round')(latLng.lng())
        });
        google.maps.event.addListener(marker, 'click', function () {
          infowindow.open($scope.map, marker);
        });

        google.maps.event.addListener(marker, 'drag', function (event) {
          $scope.$apply();
        });

        $scope.markers.push(marker);
      }

      $scope.addCustomMarker = function () {
        console.log($scope.customMarker);
        var splitted = $scope.customMarker.split(",");
        $scope.addMarker(new google.maps.LatLng(splitted[0],splitted[1]));
      }

      $scope.setFromMarker = function(index) {
        $scope.distanceFrom = $filter('markerToString')($scope.markers[index]);
      }
      $scope.setToMarker = function(index) {
        $scope.distanceTo = $filter('markerToString')($scope.markers[index]);
      }

      $scope.removeMarker = function (index) {
        $scope.markers[index].setMap(null);
        $scope.markers.splice(index, 1);
      }

      $scope.addCircle = function (latLng) {
        var circle = new google.maps.Circle({
          strokeColor:"#FF0000",
          strokeOpacity:0.8,
          strokeWeight:2,
          fillColor:"#FF0000",
          fillOpacity:0.35,
          map:$scope.map,
          center:latLng,
          radius:$scope.radius * 1000,
          draggable: true
        });
        google.maps.event.addListener(circle, 'drag', function (event) {
          $scope.$apply();
        });
        $scope.circles.push({ circle:circle, radius:$scope.radius });
      }

      $scope.setFromCircle = function(index) {
        $scope.distanceFrom = $filter('circleToString')($scope.circles[index]);
      }
      $scope.setToCircle = function(index) {
        $scope.distanceTo = $filter('circleToString')($scope.circles[index]);
      }

      $scope.removeCircle = function (index) {
        $scope.circles[index].circle.setMap(null);
        $scope.circles.splice(index, 1);
      }

      $scope.addToPolygon = function(latLng) {
        $scope.polygonPath.insertAt($scope.polygonPath.length, latLng);

        var marker = new google.maps.Marker({
          position: latLng,
          map: $scope.map,
          draggable: true
        });
        $scope.polygonMarkers.push(marker);

        google.maps.event.addListener(marker, 'dragend', function() {
          for (var i = 0, I = $scope.polygonMarkers.length; i < I && $scope.polygonMarkers[i] != marker; ++i);
            $scope.polygonPath.setAt(i, marker.getPosition());
            $scope.$apply();
          }
        );
      }

      $scope.setFromPolygon = function(index) {
        $scope.distanceFrom = $filter('markerToString')($scope.polygonMarkers[index]);
      }
      $scope.setToPolygon = function(index) {
        $scope.distanceTo = $filter('markerToString')($scope.polygonMarkers[index]);
      }

      $scope.removeFromPolygon = function(index) {
        $scope.polygonMarkers[index].setMap(null);
        $scope.polygonMarkers.splice(index, 1);
        $scope.polygonPath.removeAt(index);
      }

      $scope.distanceChanged = function () {
        if ($scope.distanceFrom && $scope.distanceTo) {
          var bareFrom = $scope.distanceFrom.split(","),
              from = new google.maps.LatLng(Number(bareFrom[0]), Number(bareFrom[1])),
              bareTo = $scope.distanceTo.split(","),
              to = new google.maps.LatLng(Number(bareTo[0]), Number(bareTo[1]));

          if($scope.distanceLine) { $scope.distanceLine.setMap(null); }
          $scope.distanceLine = new google.maps.Polyline({
            map: $scope.map,
            path: [from, to],
            strokeColor:"#FF0000",
            strokeOpacity:0.8,
            strokeWeight:2,
            fillColor:"#FF0000",
            fillOpacity:0.35
          });
          $scope.distanceResult = Math.round(google.maps.geometry.spherical.computeDistanceBetween(from, to)) / 1000;
        } else {
          if($scope.distanceLine) { $scope.distanceLine.setMap(null); }
          $scope.distanceResult = 0;
        }
      }
      $scope.$watch('distanceFrom', $scope.distanceChanged);
      $scope.$watch('distanceTo', $scope.distanceChanged);

    }]
  }
});
