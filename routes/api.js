     'user strict';
    require('events').EventEmitter.prototype._maxListeners = 0;
    var express = require('express');
    var http = require('http');
    var fs   = require ('fs') ;

     //cesium dependencies
    var Cartesian3 = require('cesium').Cartesian3 ;
    var GeometryInstance = require('cesium').GeometryInstance;
    var PolygonGeometry = require ('cesium').PolygonGeometry ;
    var BoundingSphere = require ('cesium').BoundingSphere ;
    var Cartographic = require ('cesium').Cartographic ;
    var Ellipsoid = require ('cesium').Ellipsoid ;
    var CMath =  require ('cesium').Math ;
    var Color = require('cesium').Color ;
    var ColorGeometryInstanceAttribute = require ('cesium').ColorGeometryInstanceAttribute;
    var PerInstanceColorAppearance = require('cesium').PerInstanceColorAppearance ;
    var VertexFormat = require ('cesium').VertexFormat ;
    var EllipsoidSurfaceAppearance = require('cesium').EllipsoidSurfaceAppearance ;
    var Material = require('cesium').Material ;
    var EllipseGeometry = require ('cesium').EllipseGeometry ;
    var Primitive = require ('cesium').Primitive ;
    //express mvc dependency
    var router = express.Router();

    //frustum culling
    var FrustumCulling = require ("../3DOptimization/FrustumCulling");

    //mongoose middleware for mongodb connection
    var mongoose = require('mongoose');
    //buildings model
    var Buildings = require('../Models/buildings_model');
    var Regions = require ('../Models/regions_model')


    mongoose.connection.on('error', function(err){
        console.log('connection is already opened or mongodb server is down');
    });
    
    mongoose.connect('mongodb://localhost/3DViewer');

    var regions  ;

    var buildings = new Buildings(mongoose);

    var regionsModel = new Regions(mongoose);
    //web interface for 3d tiles algorithms, buildings are cut out in regions
    regionsModel.getRegions().then(function (retrievedRegions) {
        regions = retrievedRegions ;
    });

    //index page route (cesium angular application)
    router.get('/', function (req, res) {
            res.redirect ('/angular/index.html');
    }
    );

    router.get('/test', function (req, res){
        var instance = new GeometryInstance({
              geometry : new EllipseGeometry({
                  center : Cartesian3.fromDegrees(-100.0, 20.0),
                  semiMinorAxis : 500000.0,
                  semiMajorAxis : 1000000.0,
                  rotation : Math.PI_OVER_FOUR,
                  vertexFormat : VertexFormat.POSITION_AND_ST
              }),
              id : 'object returned when this instance is picked and to get/set per-instance attributes'
            });
            var primitive = new Primitive({
              geometryInstances : instance
            });

            res.send (primitive);
        });


    //buildings stream using frustum culling algorithm
    router.get('/citybuildings', function (req, res){
        /*var paris = fs.readFileSync('./Data/data.json', 'utf8');
        var json = JSON.parse(paris);*/

        //buildings color, the color is fetched to a building randomly
        var buildingsColor = [Color.DARKGRAY, Color.DARKGREY, Color.GAINSBORO, Color.HONEYDEW, Color.LIGHTGRAY, Color.LIGHTSLATEGRAY, Color.LIGHTSLATEGREY, Color.SILVER ];

        //get the culling volume from the request 
        var cullingVolume =  req.query.planes;
        var idsToRemove = [];

        if(cullingVolume === undefined || cullingVolume == null) throw "cullingVolume is required as parameter" ;
        var cameraPosition = req.query.cameraPosition ;
        //last served building history this file is updated after every request and sent back to client
        var lastServedBuildings = req.query.lastServedBuildings;
        if(lastServedBuildings === undefined) lastServedBuildings = [];

        mongoose.connection.on('error', function(err){
        console.log('connection is already opened or mongodb server is down');
            });

        mongoose.connection.on('close', function(err){
        console.log('connection is already opened or mongodb server is down');
            });


        //buildings model
        var buildings = new Buildings(mongoose);

        //primitives to send to client
        var instances  = [] ;

        //get all the buildings and extrude them
        var promise = buildings.findBuildings();
        //when the retrieving is the buildings shall be transformed to building



        promise.then(function (buildings){

            //loop over all the retrieved buildings
            var b = [];
            var j = 0 ;
            buildings.forEach(function (polygon){
                    //create a building object 
                    var distance = Cartesian3.distance(new Cartesian3(cameraPosition.x, cameraPosition.y, cameraPosition.z), new Cartesian3(polygon.x, polygon.y, polygon.z));
                    



                    /*if(distance < 200)
                    { */              

                    var building = {polygonId : polygon.id,
                                    height : polygon.height,
                                    altitude : polygon.altitude,
                                    points : polygon.points
                                    };    
                    //push the object in the tail of the buildings list
                    b.push(building);
                             
            });

            //loop over the buildings
            b.forEach(function (building){
                var points = [] ;
                var boundingSpherePoints = [] ;

                /*
                    some transformations on the buildings vertices from cartographic to cartesian
                    create a bounding sphere from buildings vertices, the sphere will be used in culling computation


                 */   
                building.points.forEach(function (point){
                    points.push(point.x);
                    points.push(point.y);
                    var position = new Cartographic(CMath.toRadians(point.x), CMath.toRadians(point.y), 0);
                    var cartesianPosition = Ellipsoid.WGS84.cartographicToCartesian(position);
                    boundingSpherePoints.push({x : cartesianPosition.x , y : cartesianPosition.y , z : cartesianPosition.z});

                    var position = new Cartographic(CMath.toRadians(point.x), CMath.toRadians(point.y), 30);
                    var cartesianPosition = Ellipsoid.WGS84.cartographicToCartesian(position);    
                    boundingSpherePoints.push({x : cartesianPosition.x , y : cartesianPosition.y , z : cartesianPosition.z});

                });

                //the buildings vertices that will be sent to cesium
                var positions = Cartesian3.fromDegreesArray(points);


                //get the frustum planes
                var planes = JSON.parse(cullingVolume).planes ;

                //create a bounding sphere for the building
                var boundingSphere =BoundingSphere.fromPoints(boundingSpherePoints);


                var frustumCulling = new FrustumCulling(boundingSphere , planes);

                //not the client's first request 
                if(lastServedBuildings.length != 0) {
                    //if the actual building has never been transmitted to the client (does not belong to the array)
                    if (lastServedBuildings.indexOf(building.polygonId) == -1) {
                        if (frustumCulling.computeVisibility() == "inside" || frustumCulling.computeVisibility() == "intersecting") {
                            
                            /*
                                if the building belongs to the culling volume and has never been transmitted to client then 
                                it should be added to instances array 
                    
                            */

                            var height =  Math.floor((Math.random() * 30) + 10) ;
                            var geometry =  PolygonGeometry.fromPositions({
                                    positions: positions,
                                    extrudedHeight:  building.height ,  //building.height,
                                    vertexFormat : PerInstanceColorAppearance.VERTEX_FORMAT
                                });

                            var instance = {geometry : geometry , id : building.polygonId, color :  buildingsColor[j]};

                            j=j+1 ;
                            if(j==8) j = 0 ;

                            instances.push(instance);
                            //fill the temporaryBuffer
                            lastServedBuildings.push(building.polygonId);
                        }
                    }

                    //if the actual building is already transmitted 
                    else {
                        //and it does no longer belong to the culling volume
                        if (frustumCulling.computeVisibility() == "outside") {

                            //then it should be deleted from scene 
                            var i = lastServedBuildings.indexOf(building.polygonId);
                            lastServedBuildings.splice(i, 1);
                        }
                    }
                }


                //if the array is empty,it means that we're dealing with the client(s first request)
                else
                {
                    //if the actual building belongs to the culign volume 
                    if(frustumCulling.computeVisibility() == "inside" || frustumCulling.computeVisibility() == "intersecting")
                    {

                        //then it should be added to lastServedBuildings and to instances in oredr to be rendered in the client scene
                        var height =  Math.floor((Math.random() * 30) + 10) ;
                        var geometry =  PolygonGeometry.fromPositions({
                                    positions: positions,
                                    extrudedHeight:  building.height ,  //building.height,
                                    vertexFormat : PerInstanceColorAppearance.VERTEX_FORMAT
                                });


                        var instance = {geometry : geometry , id : building.polygonId, color : buildingsColor[j]};

                         j=j+1 ;
                        if(j==8) j = 0 ;

                        instances.push(instance);
                        //fill the temporaryBuffer
                        lastServedBuildings.push(building.polygonId);
                    }
                }
            })
            //send to the client a json object with the buildings, the ids to remove in order to free memory and the history of servedbuildings
            res.send({buildings : instances ,  lastServedBuildings : lastServedBuildings});

        });

    });




    router.get("/2dtilesbuildings", function (req,res){
        console.log('request received   --------------------- ');

        //get the culling volume from the request 
        var cullingVolume =  req.query.planes;
        var regionsToStream = [] ;
        var heights = [];
        var buildingsColor = [Color.DARKGRAY, Color.DARKGREY, Color.GAINSBORO, Color.HONEYDEW, Color.LIGHTGRAY, Color.LIGHTSLATEGRAY, Color.LIGHTSLATEGREY, Color.SILVER ];
        

        if(cullingVolume === undefined) throw "culling volume is a required parameter" ;
        var planes = JSON.parse(cullingVolume).planes ;

        var cameraPosition = JSON.parse(req.query.cameraPosition) ;

        //last served building history this file is updated after every request and sent back to client
        var lastServedRegions = JSON.parse(req.query.lastServedRegions);
        if (lastServedRegions === undefined)  lastServedRegions = [];

        var buildingsModel = new Buildings(mongoose);
        regions.forEach(function (region){

            var spherePoints = [];
            spherePoints.push(new Cartesian3.fromDegrees(region.max_long, region.max_lat, 0));
            spherePoints.push(new Cartesian3.fromDegrees(region.min_long, region.max_lat, 0));
            spherePoints.push(new Cartesian3.fromDegrees(region.max_long, region.min_lat, 0));
            spherePoints.push(new Cartesian3.fromDegrees(region.min_long, region.min_lat, 0));
            var boundingSphere = BoundingSphere.fromPoints(spherePoints);
            var frustumCulling = new FrustumCulling(boundingSphere , planes);
            var visibility = frustumCulling.computeVisibility();
            if(visibility == 'inside' || visibility == 'intersecting')
            {
                if(lastServedRegions.length > 0 && lastServedRegions != null && !(lastServedRegions === undefined))
                {
                    var index = lastServedRegions.map(function(object) { return object['id']; }).indexOf(region.id);
                    if (index == -1)
                    {
                        var latitude = (region.min_lat + region.max_lat)/2 ;
                        var longitude = (region.min_long + region.max_long)/2 ;

                        var regionCenter = Cartesian3.fromDegrees(longitude, latitude, 0);
                        var cartesianCameraPosition = new Cartesian3(cameraPosition.x, cameraPosition.y, cameraPosition.z);
                        var distance = Cartesian3.distance(cartesianCameraPosition, regionCenter);
        
                        var value = 0 ;
                        if(distance <= 600)
                        {
                            value = 0 ;
                        }
                        else if (distance >600 && distance <= 1000)
                        {
                            value = 1;
                        }
                        else if (distance >1000 && distance <= 1600)
                        {
                            value = 2;
                        }
                        else
                        {
                            value = 3;
                        }

                        regionsToStream.push({id : region.id, oldValue : -1 , newValue : value});
                        lastServedRegions.push({id :region.id, oldValue : -1 , newValue : value});
                    }
                    else 
                    {


                        var latitude = (region.min_lat + region.max_lat)/2 ;
                        var longitude = (region.min_long + region.max_long)/2 ;

                        var regionCenter = Cartesian3.fromDegrees(longitude, latitude, 0);
                        var cartesianCameraPosition = new Cartesian3(cameraPosition.x, cameraPosition.y, cameraPosition.z);
                        var distance = Cartesian3.distance(cartesianCameraPosition, regionCenter);

                        var value = 0 ;

                        if(distance <= 600)
                        {
                            value = 0 ;
                        }
                        else if (distance >600 && distance <= 1000)
                        {
                            value = 1;
                        }
                        else if (distance >1000 && distance <= 1600)
                        {
                            value = 2;
                        }
                        else
                        {
                            value = 3;
                        }

                      
                        lastServedRegions[index].oldValue = lastServedRegions[index].newValue ;
                        lastServedRegions[index].newValue = value ;
                        regionsToStream.push ({id : region.id , oldValue : lastServedRegions[index].oldValue , newValue : lastServedRegions[index].newValue });
                    }               
                }
                else
                {
                        var latitude = (region.min_lat + region.max_lat)/2 ;
                        var longitude = (region.min_long + region.max_long)/2 ;

                        var regionCenter = Cartesian3.fromDegrees(longitude, latitude, 0);
                        var cartesianCameraPosition = new Cartesian3(cameraPosition.x, cameraPosition.y, cameraPosition.z);
                        var distance = Cartesian3.distance(cartesianCameraPosition, regionCenter);

                        var value = 0 ;

                        if(distance <= 600)
                        {
                            value = 0 ;
                        }
                        else if (distance >600 && distance <= 1000)
                        {
                            value = 1;
                        }
                        else if (distance >1000 && distance <= 1600)
                        {
                            value = 2;
                        }
                        else
                        {
                            value = 3;
                        }

                        regionsToStream.push({id : region.id, oldValue : -1 , newValue : value});
                        lastServedRegions.push({id :region.id, oldValue : -1 , newValue : value});
                }
            }
            else
            {
                    

                    var index = lastServedRegions.map(function(object) { return object['id']; }).indexOf(region.id); 
                    if(index > -1){
                        console.log('removing a region ') ;
                        lastServedRegions.splice(index, 1);
                    }
            }
        
        });


        //console.log(lastServedRegions);

        
        var acq = 0 ;       //on done sream acquittal  
        var threads = [] ;

        for (var index = 0 ; index < regionsToStream.length ; index++)
        {

            var filter = '' ;

            if(regionsToStream[index].oldValue ==  -1)
            {
                filter = {region : regionsToStream[index].id , value : {$gte : regionsToStream[index].newValue}};
            }
            else if (regionsToStream[index].oldValue > regionsToStream[index].newValue )
            {
                filter = {region : regionsToStream[index].id,  value : {$gte : regionsToStream[index].newValue } ,  value : { $lt : regionsToStream[index].oldValue}  }
            }
            else if ( regionsToStream[index].oldValue <= regionsToStream[index].newValue )
            {
                continue ;
            } 
            //console.log('region ID '+ regionsToStream[index] + '  height '+heights[index]);
            var stream = buildingsModel.findBuildingsByGivenFilter(filter) ;

            threads.push(stream);
        }


        var i=0 ;           // colors array index
        var instances = []; //geometries instances to be sent to Client
        var buildings = []; //buildings retirieved from Mongo Server
        threads.forEach(function (thread){
            
            thread.on('data', function (doc){
                buildings.push(doc);
            });

            thread.on('close', function (){
                //
                //console.log('streams number  '+streamsNumber);
                acq = acq + 1 ;
                if(acq == threads.length )
                {


                        for(var j =0 ; j<buildings.length ; j++)
                        {
                            var points = [] ;

                            //some transformations on the buildings vertices
                            buildings[j].points.forEach(function (point){
                                points.push(point.x);
                                points.push(point.y);
                            });

                            //the buildings vertices that will be sent to cesium
                            var positions = Cartesian3.fromDegreesArray(points);
                            var height ;
                            if(buildings[j].height > 10 ) height = buildings[j].height 
                            else height = 10 ;
                            var geometry =  PolygonGeometry.fromPositions({
                                                positions : positions,
                                                extrudedHeight :  buildings[j].height ,  //building.height,
                                                vertexFormat : PerInstanceColorAppearance.VERTEX_FORMAT
                                            });
                            var instance = {geometry : geometry , id : buildings[j].region+'#'+buildings[j].value, color : buildingsColor[i]};
                            instances.push(instance);
                            i=i+1 ;
                            if(i==8) i = 0 ;
                        }

                        console.log('response sent  , number of buildings '+buildings.length) ;
                        res.send({lastServedRegions : lastServedRegions, buildings : instances});
                      
                }
            }) ;
        });     

    });





     /*
        the web interface below returns an array of tiles that must be visible in a given 
        culling volume

        -request :
            cullingVolume : Array[6] / not null or undefined
            lastServedRegions : Array[*] /Array of Ids containing the last served regions if the array is empty or undefined the request is considered the first one.
        -response :
            regionsToBeRetrieved : Array[*] / Array of ids it could be empty if the culling volume does not intersect with any region
            lastServedRegions : Array[*] / the array should be retransmitted to client as a mapping trace
    */

    router.get("/newregions", function (req, res){

        console.log('new regions web service');

        //get the cullong volume from the request object
        var cullingVolume =  req.query.planes;
        var distances = [] ;
        //the array of regions 
        var regionsToStream = [] ;
        var cameraPosition = JSON.parse(req.query.cameraPosition) ;

        if(cullingVolume === undefined) throw "culling volume is a required parameter" ;
        var planes = JSON.parse(cullingVolume).planes ;

        //last served building history this file is updated after every request and sent back to client
        var lastServedRegions = JSON.parse(req.query.lastServedRegions);
        if (lastServedRegions === undefined)  lastServedRegions = [];





        console.log(' camera position   '+ JSON.parse(cullingVolume)) ;
        console.log('starting regions process ... ');

        regions.forEach(function (region){

            var spherePoints = [];
            spherePoints.push(new Cartesian3.fromDegrees(region.max_long, region.max_lat, 0));
            spherePoints.push(new Cartesian3.fromDegrees(region.min_long, region.max_lat, 0));
            spherePoints.push(new Cartesian3.fromDegrees(region.max_long, region.min_lat, 0));
            spherePoints.push(new Cartesian3.fromDegrees(region.min_long, region.min_lat, 0));
            var boundingSphere = BoundingSphere.fromPoints(spherePoints);
            var frustumCulling = new FrustumCulling(boundingSphere , planes);
            var visibility = frustumCulling.computeVisibility();
            if(visibility == 'inside' || visibility == 'intersecting')
            {
                if(lastServedRegions.length > 0 && lastServedRegions != null && !(lastServedRegions === undefined))
                {
                    var index = lastServedRegions.map(function(object) { return object['id']; }).indexOf(region.id);
                    if (index == -1) {
                        var latitude = (region.min_lat + region.max_lat) / 2;
                        var longitude = (region.min_long + region.max_long) / 2;

                        var regionCenter = Cartesian3.fromDegrees(longitude, latitude, 0);
                        var cartesianCameraPosition = new Cartesian3(cameraPosition.x, cameraPosition.y, cameraPosition.z);
                        
                        //cartographic camera position
                        var cartographicCameraPosition = Cartographic.fromCartesian(cartesianCameraPosition);

                        var height = cartographicCameraPosition.height ;
                        console.log( 'height  '+height);
                        var maxLod = 1 ;
                        if(height > 2500) 
                        {
                            maxLod = 1 ;
                        }
                        else if (height > 2200)
                        {
                            maxLod = 2 ;
                        }
                        else if (height > 2000)
                        {
                            maxLod = 3 ;
                        }
                        else if(height > 1800)
                        {
                            maxLod = 4 ;
                        }
                        else if(height > 1600)
                        {
                            maxLod = 5 ;
                        }
                        else if(height > 1400)
                        {
                            maxLod = 6 ;
                        }
                        else if(height > 1200)
                        {
                            maxLod = 7 ;
                        }
                        else if(height > 1050)
                        {
                            maxLod = 8 ;
                        }
                        else if(height > 900)
                        {
                            maxLod = 9 ;
                        }
                        else if(height > 700)
                        {
                            maxLod = 10 ;
                        }
                        else if(height > 600)
                        {
                            maxLod = 11 ;
                        }
                        else if(height > 450)
                        {
                            maxLod = 12 ;
                        }
                        else if(height > 350)
                        {
                            maxLod = 13 ;
                        }
                        else if(height > 250)
                        {
                            maxLod = 14 ;
                        }
                        else 
                        {
                            maxLod = 15 ;
                        }


                        var distance = Cartesian3.distance(cartesianCameraPosition, regionCenter);
                        console.log('distance   '+distance);
                        var lod = 0;
                        if (distance <= 400) {
                            lod = 15;
                            if(maxLod < lod)
                                lod = maxLod ;
                            
                        }
                        else if (distance > 400 && distance <= 700) {
                            lod = 14;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 700 && distance <= 900) {
                            lod = 13;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 900 && distance <= 1100) {
                            lod = 12;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 1100 && distance <= 1300) {
                            lod = 11;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 1300 && distance <= 1500) {
                            lod = 10;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 1500 && distance <= 1800) {
                            lod = 9;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 1800 && distance <= 2000) {
                            lod = 8;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 2000 && distance <= 2400) {
                            lod = 7;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 2400 && distance <= 2800) {
                            lod = 6;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 2800 && distance <= 3200) {
                            lod = 5;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 3200 && distance <= 3600) {
                            lod = 4;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 3600 && distance <= 4200) {
                            lod = 3;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 4200 && distance <= 4800) {
                            lod = 2;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else {
                            lod = 1;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }

                        regionsToStream.push({id: region.id, lastLod : -1, newLod : lod });
                        lastServedRegions.push({id: region.id, lastLod : -1 , newLod : lod});
                    }
                    else
                    {
                        var latitude = (region.min_lat + region.max_lat) / 2;
                        var longitude = (region.min_long + region.max_long) / 2;

                        var regionCenter = Cartesian3.fromDegrees(longitude, latitude, 0);
                        var cartesianCameraPosition = new Cartesian3(cameraPosition.x, cameraPosition.y, cameraPosition.z);
                        //cartographic camera position
                        var cartographicCameraPosition = Cartographic.fromCartesian(cartesianCameraPosition);

                        var height = cartographicCameraPosition.height ;


                        console.log( 'height  '+height);

                        var maxLod = 1 ;
                        if(height > 2500) 
                        {
                            maxLod = 1 ;
                        }
                        else if (height > 2200)
                        {
                            maxLod = 2 ;
                        }
                        else if (height > 2000)
                        {
                            maxLod = 3 ;
                        }
                        else if(height > 1800)
                        {
                            maxLod = 4 ;
                        }
                        else if(height > 1600)
                        {
                            maxLod = 5 ;
                        }
                        else if(height > 1400)
                        {
                            maxLod = 6 ;
                        }
                        else if(height > 1200)
                        {
                            maxLod = 7 ;
                        }
                        else if(height > 1050)
                        {
                            maxLod = 8 ;
                        }
                        else if(height > 900)
                        {
                            maxLod = 9 ;
                        }
                        else if(height > 700)
                        {
                            maxLod = 10 ;
                        }
                        else if(height > 600)
                        {
                            maxLod = 11 ;
                        }
                        else if(height > 450)
                        {
                            maxLod = 12 ;
                        }
                        else if(height > 350)
                        {
                            maxLod = 13 ;
                        }
                        else if(height > 250)
                        {
                            maxLod = 14 ;
                        }
                        else 
                        {
                            maxLod = 15 ;
                        }


                        var distance = Cartesian3.distance(cartesianCameraPosition, regionCenter);
                        console.log('distance   '+distance);
                        var lod = 0;
                        if (distance <= 400) {
                            lod = 15;
                            if(maxLod < lod)
                                lod = maxLod ;
                            
                        }
                        else if (distance > 400 && distance <= 700) {
                            lod = 14;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 700 && distance <= 900) {
                            lod = 13;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 900 && distance <= 1100) {
                            lod = 12;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 1100 && distance <= 1300) {
                            lod = 11;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 1300 && distance <= 1500) {
                            lod = 10;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 1500 && distance <= 1800) {
                            lod = 9;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 1800 && distance <= 2000) {
                            lod = 8;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 2000 && distance <= 2400) {
                            lod = 7;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 2400 && distance <= 2800) {
                            lod = 6;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 2800 && distance <= 3200) {
                            lod = 5;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 3200 && distance <= 3600) {
                            lod = 4;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 3600 && distance <= 4200) {
                            lod = 3;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 4200 && distance <= 4800) {
                            lod = 2;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else {
                            lod = 1;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        regionsToStream.push({id: region.id, lastLod : lastServedRegions[index].newLod, newLod : lod });
                        lastServedRegions[index].lastLod= lastServedRegions[index].newLod ;
                        lastServedRegions[index].newLod = lod ;

                    }

                }
                else
                {

                        var latitude = (region.min_lat + region.max_lat) / 2;
                        var longitude = (region.min_long + region.max_long) / 2;

                        var regionCenter = Cartesian3.fromDegrees(longitude, latitude, 0);
                        var cartesianCameraPosition = new Cartesian3(cameraPosition.x, cameraPosition.y, cameraPosition.z);
                        //cartographic camera position
                        var cartographicCameraPosition = Cartographic.fromCartesian(cartesianCameraPosition);

                        var height = cartographicCameraPosition.height ;


                        console.log( 'height  '+height);

                        var maxLod = 1 ;
                        if(height > 2500) 
                        {
                            maxLod = 1 ;
                        }
                        else if (height > 2200)
                        {
                            maxLod = 2 ;
                        }
                        else if (height > 2000)
                        {
                            maxLod = 3 ;
                        }
                        else if(height > 1800)
                        {
                            maxLod = 4 ;
                        }
                        else if(height > 1600)
                        {
                            maxLod = 5 ;
                        }
                        else if(height > 1400)
                        {
                            maxLod = 6 ;
                        }
                        else if(height > 1200)
                        {
                            maxLod = 7 ;
                        }
                        else if(height > 1050)
                        {
                            maxLod = 8 ;
                        }
                        else if(height > 900)
                        {
                            maxLod = 9 ;
                        }
                        else if(height > 700)
                        {
                            maxLod = 10 ;
                        }
                        else if(height > 600)
                        {
                            maxLod = 11 ;
                        }
                        else if(height > 450)
                        {
                            maxLod = 12 ;
                        }
                        else if(height > 350)
                        {
                            maxLod = 13 ;
                        }
                        else if(height > 250)
                        {
                            maxLod = 14 ;
                        }
                        else 
                        {
                            maxLod = 15 ;
                        }


                        var distance = Cartesian3.distance(cartesianCameraPosition, regionCenter);
                        console.log('distance   '+distance);
                        var lod = 0;
                        if (distance <= 400) {
                            lod = 15;
                            if(maxLod < lod)
                                lod = maxLod ;
                            
                        }
                        else if (distance > 400 && distance <= 700) {
                            lod = 14;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 700 && distance <= 900) {
                            lod = 13;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 900 && distance <= 1100) {
                            lod = 12;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 1100 && distance <= 1300) {
                            lod = 11;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 1300 && distance <= 1500) {
                            lod = 10;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 1500 && distance <= 1800) {
                            lod = 9;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 1800 && distance <= 2000) {
                            lod = 8;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 2000 && distance <= 2400) {
                            lod = 7;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 2400 && distance <= 2800) {
                            lod = 6;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 2800 && distance <= 3200) {
                            lod = 5;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 3200 && distance <= 3600) {
                            lod = 4;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 3600 && distance <= 4200) {
                            lod = 3;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else if (distance > 4200 && distance <= 4800) {
                            lod = 2;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }
                        else {
                            lod = 1;
                            if(maxLod < lod)
                                lod = maxLod ;
                        }

                        regionsToStream.push({id: region.id, lastLod : -1, newLod : lod });
                        lastServedRegions.push({id: region.id, lastLod : -1 , newLod : lod});
                }
            }
            else
            {

                var index = lastServedRegions.map(function(object) { return object['id']; }).indexOf(region.id);
                if(index > -1){
                    console.log('removing a region ') ;
                    lastServedRegions.splice(index, 1);
                }
            }

        });

        console.log('done processing regions');
        res.send({lastServedRegions : lastServedRegions , newregions : regionsToStream }) ;

    });





    //web interface for 3d tiles serving, the web service below returns an array of buildings based on a regions Id that should be transmitted in the request body
    router.get("/tiledbuildings", function (req,res){
     
        var regionsToStream = JSON.parse(req.query.newregions) ;

        var buildingsColor = [Color.DARKGRAY, Color.DARKGREY, Color.GAINSBORO, Color.HONEYDEW, Color.LIGHTGRAY, Color.LIGHTSLATEGRAY, Color.LIGHTSLATEGREY, Color.SILVER ];
        var baseDir = './Tilesets/';
        var response = [] ;

        regionsToStream.forEach(function (region) {

            var begin = region.lastLod ;

            if(begin == -1 )
                begin = 0 ;

            for(var i = begin+1 ; i<= region.newLod ; i++)
            {   
                var content = fs.readFileSync(baseDir+region.id+'/lod'+i+'/geometry', 'utf8');
                try {
                    var geometries = JSON.parse(content);
                    //console.log('geometries  ' + geometries);
                    Array.prototype.push.apply(response, geometries);
                }catch (err)
                {
                    console.log('cant parse json file');
                }
            }    
            
        });

        //console.log(JSON.stringify(response));

        res.send(response);

    }) ;


    // proxy server is used every time  "cross origin resource sharing" starts screwing around
    router.get("/proxy",function (req,res){
        var url=req.query.url.substring(1,req.query.url.length);
        http.get (url,function (res2){
            var data="";
            res2.setEncoding('binary');
            res2.on('data', function (chunk) {
                data+=chunk;
            });
            res2.on("end",function(){
                res.writeHead(200, {'Content-Type': 'image/png' });
                res.end(data, 'binary');
            });
        });

    });


    module.exports = router;