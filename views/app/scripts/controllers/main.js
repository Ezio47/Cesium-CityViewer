'use strict';

/**
 * @ngdoc function
 * @name viewsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the viewsApp
 */

angular.module('WebGLViewerApp')
  .controller('MainCtrl',['$scope','$http',  '$cacheFactory','CameraControl', function ($scope,$http, $cacheFactory ,CameraControl) {
    $scope.initCesium = function () {
      $scope.proxyUrl = 'http://localhost:3000/proxy/?url=';
      //create a cesium map in the div "cesiumContainer"


        /*var imageryProvider = new Cesium.createTileMapServiceImageryProvider({
           url : 'http://localhost:8080/Source/Assets/Textures/NaturalEarthII',
           fileExtension : 'jpg',
           proxy : new Cesium.DefaultProxy('http://localhost:3000/proxy/?url=')
          });*/

      $scope.viewer =  new Cesium.Viewer('cesiumContainer');


      var scene = $scope.viewer.scene ;

      $scope.loader = document.getElementById('loader') ;


      $scope.startLoading = function () {
            loader.className = '';
        }

      $scope.finishedLoading = function() {
            // first, toggle the class 'done', which makes the loading screen
            // fade out
            loader.className = 'done';
            setTimeout(function() {
                // then, after a half-second, add the class 'hide', which hides
                // it completely and ensures that the user can interact with the
                // map again.
                loader.className = 'hide';
            }, 500);
        }

      //$scope.startLoading();


      var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
      handler.setInputAction(
                function (click) {
                    var pickedObject = $scope.viewer.scene.pick(click.position);
                    alert(pickedObject.primitive.geometryInstances.id);
                    //pickedObject.primitive.material.setValue('diffuse', Cesium.Cartesian4.fromColor(Cesium.Color.BLUE));
                },
                Cesium.ScreenSpaceEventType.LEFT_CLICK
            );


      var position = new Cesium.Cartographic(Cesium.Math.toRadians(114.13990872078719), Cesium.Math.toRadians(22.255056662502106), 1000);
      var cartesianPosition = Cesium.Ellipsoid.WGS84.cartographicToCartesian(position);

      scene.camera.position = new Cesium.Cartesian3(-2417176.9074030295, 5387657.341091297, 2408832.496700542);

      scene.camera.direction =  new Cesium.Cartesian3 (-0.0002736038104914327 , 0.0006098368611871486, -0.9999997766199528);

      scene.camera.up = new Cesium.Cartesian3 (-0.13098187000997633, 0.9913845568650007, 0.0006404201281850658);




      var camPosition = scene.camera.position;
      CameraControl.tiledBuildingsHandler($scope.viewer, cache);
      /*var cache = $cacheFactory('regionsCache');


      var cachedBuildings = cache.get('importantbuildings');

      if(cachedBuildings == null || cachedBuildings === undefined)
      {

          cache.put('importantbuildings', JSON.stringify([]));
          $http({
                  method: 'GET',
                  url: '/importantbuildings'
                }).then(function successCallback(response) {
                  var buildings = response["data"]["buildings"] ;

                        //draw the new polygons in the scene
                    buildings.forEach(function (building){

                        var geometryInstance = new Cesium.GeometryInstance({
                          geometry : building.geometry,
                          attributes: {
                            color: Cesium.ColorGeometryInstanceAttribute.fromColor(building.color)
                          },
                          id : 'importantbuilding'
                            });


                        var primitive = new Cesium.Primitive({
                            releaseGeometryInstances : false ,
                            geometryInstances : geometryInstance,
                            appearance : new Cesium.PerInstanceColorAppearance({
                                closed : true,
                                translucent : false
                            })
                        });


                        $scope.viewer.scene.primitives.add(primitive);

                        var cachedBuildings = cache.get('importantbuildings') ;
                        var jsonArray = JSON.parse(cachedBuildings) ;
                        jsonArray.push(building) ;
                        cache.put(building.id, JSON.stringify(jsonArray)) ;
                      });


                      $scope.finishedLoading();
                });

      }
      else
      {
                    var parsedBuildings = JSON.parse(buildings) ;
                    parsedBuildings.forEach(function (building){
                      //console.log('cached building  '+JSON.stringify(building.geometryInstances));


                    var geometryInstance = new Cesium.GeometryInstance({
                          geometry : building.geometry,
                          attributes: {
                            color: Cesium.ColorGeometryInstanceAttribute.fromColor(building.color)
                          },
                          id : building.id
                            });

                    var primitive = new Cesium.Primitive({
                            releaseGeometryInstances : false ,
                            geometryInstances : geometryInstance,
                            appearance : new Cesium.PerInstanceColorAppearance({
                                closed : true,
                                translucent : false
                            })
                        });
                      mainViewer.scene.primitives.add(primitive);
                    })
                    $scope.finishedLoading();
      }*/






      //scene.camera.direction = new Cesium.Cartesian3(-2415921.8471555314, 5390201.907724024, 2404394.805129175);


      /*var layers = $scope.viewer.scene.imageryLayers;
      var blackMarble = layers.addImageryProvider(new Cesium.TileMapServiceImageryProvider({
          url : '//cesiumjs.org/tilesets/imagery/blackmarble',
          maximumLevel : 8,
          credit : 'Black Marble imagery courtesy NASA Earth Observatory',
          proxy : new Cesium.DefaultProxy('http://localhost:3000/proxy/?url=')
      }));*/

      /*var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
          Cesium.Cartesian3.fromDegrees(-75.62898254394531, 40.02804946899414, 0.0));
      var model = scene.primitives.add(Cesium.Model.fromGltf({
          url : '/gltffile/eiffel_tower.gltf',
          modelMatrix : modelMatrix,
          scale : 200.0
      }));


      //config camera control (the keyboard keys and mouse movement)
      CameraControl.configCamera($scope.viewer, 'Z','S','W','X','D','Q');*/






      /*var layers = scene.imageryLayers;

      layers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
        url : 'http://localhost:8080/geoserver/topp/wms',
        layers : 'states' ,
        proxy : new Cesium.DefaultProxy('http://localhost:3000/proxy/?url=')
      }));*/

      /*var rectangleInstance = new Cesium.GeometryInstance({
        geometry : new Cesium.RectangleGeometry({
          rectangle : Cesium.Rectangle.fromDegrees(-140.0, 30.0, -100.0, 40.0)
        }),
        id : 'rectangle',
        attributes : {
          color : new Cesium.ColorGeometryInstanceAttribute(0.0, 1.0, 1.0, 0.5)
        }
      });
      scene.primitives.add(new Cesium.GroundPrimitive({
        geometryInstance : rectangleInstance
      }));  */




      /* $http({
            method: 'GET',
            url: '/allbuildings'
          }).then(function successCallback(response) {
                  console.log(response.data);
                  response.data.forEach(function(geometry){
                  var geometryInstance = new Cesium.GeometryInstance({
                    geometry : geometry,
                    attributes: {
                      color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.ORANGE)
                    }
                      });

                  scene.primitives.add(new Cesium.Primitive({
                      geometryInstances : geometryInstance,
                      appearance : new Cesium.PerInstanceColorAppearance({
                          closed : true,
                          translucent : false
                      })
                  }));
                });

          }
          );*/







      /*var positions = Cesium.Cartesian3.fromDegreesArray([
          -88.0, 35.0,
          -80.0, 35.0,
          -80.0, 40.0,
          -88.0, 40.0
      ]);

      var geometryInstance = new Cesium.GeometryInstance({
          geometry : Cesium.PolygonGeometry.fromPositions({
              positions : positions,
              height: 0,
              extrudedHeight: 1500000,
              vertexFormat : Cesium.PerInstanceColorAppearance.VERTEX_FORMAT
          }),
          attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.BLUE)
          }
      });

      scene.primitives.add(new Cesium.Primitive({
          geometryInstances : geometryInstance,
          appearance : new Cesium.PerInstanceColorAppearance({
              closed : true,
              translucent : false
          })
      }));*/



 }


  }]);
