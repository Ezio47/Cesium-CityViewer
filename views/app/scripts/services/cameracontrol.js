'use strict';

/**
 * @ngdoc service
 * @name viewsApp.CameraControl
 * @description
 * # CameraControl
 * Service in the viewsApp.
 */
angular.module('WebGLViewerApp')
  .service('CameraControl',['$http', function ($http,$cachedRegions ,$lastServedBuildings, $lastServedRegions) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    return  {
      configCamera : function (mainViewer, moveForward, moveBackward, moveUp, moveDown
                                ,moveRight , moveLeft) {

        //get scene from cesium viewer
        var scene = mainViewer.scene;
        //get the html5 canvas in order listen to click events
        var canvas = mainViewer.canvas;

        canvas.setAttribute('tabindex', '0'); // needed to put focus on the canvas
        canvas.onclick = function () {
          canvas.focus();
        };
        var ellipsoid = mainViewer.scene.globe.ellipsoid;

        // disable the default event handlers
        scene.screenSpaceCameraController.enableRotate = false;
        scene.screenSpaceCameraController.enableTranslate = false;
        scene.screenSpaceCameraController.enableZoom = false;
        scene.screenSpaceCameraController.enableTilt = false;
        scene.screenSpaceCameraController.enableLook = false;

        var startMousePosition;
        var mousePosition;
        var flags = {
          looking: false,
          moveForward: false,
          moveBackward: false,
          moveUp: false,
          moveDown: false,
          moveLeft: false,
          moveRight: false
        };

        var handler = new Cesium.ScreenSpaceEventHandler(canvas);

        handler.setInputAction(function (movement) {
          flags.looking = true;
          mousePosition = startMousePosition = Cesium.Cartesian3.clone(movement.position);
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        handler.setInputAction(function (movement) {
          mousePosition = movement.endPosition;
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        handler.setInputAction(function (position) {
          flags.looking = false;
        }, Cesium.ScreenSpaceEventType.LEFT_UP);

        function getFlagForKeyCode(keyCode) {
          switch (keyCode) {
            case moveForward.charCodeAt(0):
              return 'moveForward';
            case moveBackward.charCodeAt(0):
              return 'moveBackward';
            case moveUp.charCodeAt(0):
              return 'moveUp';
            case moveDown.charCodeAt(0):
              return 'moveDown';
            case moveRight.charCodeAt(0):
              return 'moveRight';
            case moveLeft.charCodeAt(0):
              return 'moveLeft';
            default:
              return undefined;
          }
        }

        document.addEventListener('keydown', function (e) {
          var flagName = getFlagForKeyCode(e.keyCode);
          if (typeof flagName !== 'undefined') {
            flags[flagName] = true;
          }
        }, false);

        document.addEventListener('keyup', function (e) {
          var flagName = getFlagForKeyCode(e.keyCode);
          if (typeof flagName !== 'undefined') {
            flags[flagName] = false;
          }
        }, false);

        mainViewer.clock.onTick.addEventListener(function (clock) {
          var camera = mainViewer.camera;

          if (flags.looking) {
            var width = canvas.clientWidth;
            var height = canvas.clientHeight;

            // Coordinate (0.0, 0.0) will be where the mouse was clicked.
            var x = (mousePosition.x - startMousePosition.x) / width;
            var y = -(mousePosition.y - startMousePosition.y) / height;

            var lookFactor = 0.1;
            camera.lookRight(x * lookFactor);
            camera.lookUp(y * lookFactor);
          }

          // Change movement speed based on the distance of the camera to the surface of the ellipsoid.
          var cameraHeight = ellipsoid.cartesianToCartographic(camera.position).height;
          var moveRate = cameraHeight / 50.0;

          if (flags.moveForward) {
            camera.moveForward(moveRate);
          }
          if (flags.moveBackward) {
            camera.moveBackward(moveRate);
          }
          if (flags.moveUp) {
            camera.moveUp(moveRate);
          }
          if (flags.moveDown) {
            camera.moveDown(moveRate);
          }
          if (flags.moveLeft) {
            camera.moveLeft(moveRate);
          }
          if (flags.moveRight) {
            camera.moveRight(moveRate);
          }
        });
      },

      /*

        The service below handles the client side culling requests
        After each camera move an Http request is sent to the server in order to retrieve the buildings sthat should be rendered in the scene
        and also the buildings that should no longer exist.

      */




      cameraCullingHandler  : function (mainViewer) {
        mainViewer.camera.moveStart.addEventListener(function (){
          //event on camera move start
        });


        mainViewer.camera.moveEnd.addEventListener(function (){
          //event on camera move end


          //client shall keep the old buildings and add only the new ones for performance improvement
          //mainViewer.scene.primitives.removeAll();

          if($lastServedBuildings === undefined)  $lastServedBuildings = [];
          var frustum = new Cesium.PerspectiveFrustum();
          frustum.aspectRatio = 1.98;
          frustum.fov = Cesium.Math.PI_OVER_THREE;
          frustum.far = 50000000 ;

          var camPosition = mainViewer.scene.camera.position ;

          console.log('cartographic camera position ' + Cesium.Math.toDegrees(Cesium.Cartographic.fromCartesian(new Cesium.Cartesian3(camPosition.x, camPosition.y, camPosition.z)).longitude)+'      '+
           Cesium.Math.toDegrees(Cesium.Cartographic.fromCartesian(new Cesium.Cartesian3(camPosition.x, camPosition.y, camPosition.z)).latitude)) ;

          var cameraPosition = mainViewer.scene.camera.position ;
          var cameraDirection = mainViewer.scene.camera.direction;
          var cameraUp = mainViewer.scene.camera.up;

          var cullingVolume =  frustum.computeCullingVolume(cameraPosition, cameraDirection, cameraUp);
          console.log(cullingVolume);
          $http({
            method: 'GET',
            url: '/citybuildings',
            params: {planes : cullingVolume, cameraPosition : cameraPosition , lastServedBuildings : $lastServedBuildings}
          }).then(function successCallback(response) {
            console.log('response received');
            var buildings = response["data"]["buildings"];
            $lastServedBuildings = response["data"]["lastServedBuildings"];

            if($lastServedBuildings === undefined) $lastServedBuildings= [];
            // var x = -75.62898254394531 ;
            // var y = 40.02804946899414 ;
            // var z = 0.0 ;

            var idsToRemove = response["data"]["idsToRemove"];
            //delete all building that no longer exists in the scene




              var indexes = [] ;
              for(var i =0  ; i< mainViewer.scene.primitives.length ; i++)
              {
                var index = idsToRemove.indexOf(mainViewer.scene.primitives.get(i).geometryInstances.id);
                if(index > -1)
                {
                    mainViewer.scene.primitives.remove(mainViewer.scene.primitives.get(i));
                    i-- ;
                }
              }
                console.log('number of served buildings '+buildings.length);
                buildings.forEach(function (building){
                  var geometryInstance = new Cesium.GeometryInstance({
                    geometry : building.geometry,
                    attributes: {
                      color: Cesium.ColorGeometryInstanceAttribute.fromColor(building.color)
                    },
                    id : building.id
                      });

                  mainViewer.scene.primitives.add(new Cesium.Primitive({
                      releaseGeometryInstances : false ,
                      geometryInstances : geometryInstance,
                      appearance : new Cesium.PerInstanceColorAppearance({
                          closed : true,
                          translucent : false
                      })
                  }));
                });

                console.log(' number of primitives in scene : '+mainViewer.scene.primitives.length)

            //$scope.viewer.camera.position = new Cesium.Cartesian3.fromDegrees(597855.750002, 5334045.702554, 35.322496);

          }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
          });

        });

      },

      /*
        the service below handles the client side 2d tiling requests
        it sends a request to server after each and every move of the camera
        the http client shall send the culling volume and the last served regions (tiles)

        the response content is an array of cesium geometry instances to be rendered in the scene
        and an array of buildings Ids that should be removed from the scene in order to free client memory (RAM)

      */

      tiledBuildingsHandler : function (mainViewer, cache){
          mainViewer.camera.moveEnd.addEventListener(function (){

          //create a frustum
          var frustum = new Cesium.PerspectiveFrustum();
          frustum.aspectRatio = 1.98;
          frustum.fov = Cesium.Math.PI_OVER_THREE;
          frustum.far = 2500 ;


          var cameraPosition = mainViewer.scene.camera.position ;
          var cameraDirection = mainViewer.scene.camera.direction;
          var cameraUp = mainViewer.scene.camera.up;


          if($lastServedRegions === undefined )  $lastServedRegions = [] ;

          //compute the culling volume from the camera position, direction ...
          var cullingVolume =  frustum.computeCullingVolume(cameraPosition, cameraDirection, cameraUp);

          $http({
            method: 'GET',
            url: '/newregions',
            params: {planes : cullingVolume, lastServedRegions : JSON.stringify($lastServedRegions)}
          }).then(function successCallback(response) {


              //the regions to retirieve from the server
              var regionsToRetrieve = response["data"]["newregions"] ;

              $lastServedRegions = response["data"]["lastServedRegions"];
              if($lastServedRegions === undefined) $lastServedRegions = [];


              //remove all the buildings that should no longer exist in the scene in order to free client memory
              for(var i =0  ; i< mainViewer.scene.primitives.length ; i++)
              {

                if(mainViewer.scene.primitives.get(i).geometryInstances.id == 'importantbuilding')
                  continue ;
                var index = $lastServedRegions.indexOf(mainViewer.scene.primitives.get(i).geometryInstances.id);
                if(index == -1)
                {
                    mainViewer.scene.primitives.remove(mainViewer.scene.primitives.get(i));
                    i-- ;
                }

              }

              // look for the new visible regions in server
              if(regionsToRetrieve.length > 0)
              {

               //perform the http request
               $http({
                  method: 'GET',
                  url: '/tiledbuildings',
                  //send the regions array
                  params: {newregions : regionsToRetrieve}
                }).then(function successCallback(response) {
                  var buildings = response["data"]["buildings"] ;
                    var i = 0 ;
                        //draw the new polygons in the scene
                    for(var i = 0 ; i < buildings.length/4 ; i++ )
                    {
                        //;
                        var geometryInstance = new Cesium.GeometryInstance({
                          geometry : buildings[i].geometry,
                          attributes: {
                            color: Cesium.ColorGeometryInstanceAttribute.fromColor(buildings[i].color)
                          },
                          id : buildings[i].id
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

                    }

                    setTimeout(function(){


                      for(var i = Math.floor(buildings.length/4) ; i < buildings.length/2 ; i++ )
                      {
                        //;
                        var geometryInstance = new Cesium.GeometryInstance({
                          geometry : buildings[i].geometry,
                          attributes: {
                            color: Cesium.ColorGeometryInstanceAttribute.fromColor(buildings[i].color)
                          },
                          id : buildings[i].id
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

                      }



                    setTimeout(function(){

                      for(var i = Math.floor(buildings.length/2) ; i < 3*buildings.length/4 ; i++ )
                      {
                        //;
                        var geometryInstance = new Cesium.GeometryInstance({
                          geometry : buildings[i].geometry,
                          attributes: {
                            color: Cesium.ColorGeometryInstanceAttribute.fromColor(buildings[i].color)
                          },
                          id : buildings[i].id
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

                      }



                      setTimeout(function(){

                          for(var i = Math.floor(3*buildings.length/4) ; i < buildings.length ; i++ )
                          {
                            //;
                            var geometryInstance = new Cesium.GeometryInstance({
                              geometry : buildings[i].geometry,
                              attributes: {
                                color: Cesium.ColorGeometryInstanceAttribute.fromColor(buildings[i].color)
                              },
                              id : buildings[i].id
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

                          }


                       }, 800);


                    }, 1000);


                    }, 900);

                }) ;

              }




              /*var buildings = response["data"]["buildings"];
              $lastServedRegions = response["data"]["lastServedRegions"];
              if($lastServedRegions === undefined) $lastServedRegions = [];

              if($lastServedRegions.length == 0 )
              {
                mainViewer.scene.primitives.removeAll();
              }



              //remove the 3d models that should no longer appears in the scene in order to free allocated memory
              var regionsToRemove = response["data"]["regionsToRemove"];
              var indexes = [] ;
              for(var i =0  ; i< mainViewer.scene.primitives.length ; i++)
              {


                var index = regionsToRemove.indexOf(mainViewer.scene.primitives.get(i).geometryInstances.id);
                if(index > -1)
                {
                    mainViewer.scene.primitives.remove(mainViewer.scene.primitives.get(i));
                    i-- ;
                }

              }






              console.log(' number of primitives in scene : '+mainViewer.scene.primitives.length);*/


          });
      });

    }



      }
  }]);
