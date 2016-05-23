/**
 * Created by atassi on 23/02/2016.
 */

//cesium dependencies
var Cartesian3 = require('cesium').Cartesian3 ;
//frustum culling
var FrustumCulling = require ("../3DOptimization/FrustumCulling");
var BoundingSphere = require ('cesium').BoundingSphere ;
var Cartographic = require ('cesium').Cartographic ;
var CMath =  require ('cesium').Math ;
var fs = require('fs');
//import the regions model
var RegionsModel = require('./regions_model');
//import the points model
var PointsModel = require('./points_model');

var Buildings = function (mongoose)
{
    var Schema = mongoose.Schema;
    var regionsModel = new RegionsModel(mongoose);
    var pointsModel = new PointsModel (mongoose);

    var BuildingsSchema = new mongoose.Schema({
        height : {type : Number} ,
        altitude : {type : Number},
        points   : [{type: Schema.Types.ObjectId, ref: 'Points' }],
        x : {type : Number} ,
        y : {type : Number} ,
        z : {type : Number} ,
        radius : {type : Number},
        region : {type : String},
        value : {type : Number}
    });

    try {
        var Buildings = mongoose.model('Buildings');
    }
    catch(err) {
        var Buildings = mongoose.model('Buildings', BuildingsSchema);
    }



    var CitiesSchema = new mongoose.Schema({
        name : {type : String},
        regions : [{type : Schema.Types.ObjectId, ref : 'Regions'}]
    });

    try{
        var Cities = mongoose.model('Cities');
    }catch(err){
        var Cities = mongoose.model('Cities', CitiesSchema);
    }





    this.addBuildings = function (buildings, scope){
        buildings.forEach(function (building){
            console.log('adding buildings to database');
            var value =0 ;
            if( building.height <= 40 && building.height > 0) value = 0 ;
            if( building.height >  40 && building.height <=70 ) value = 1;
            if( building.height >  70 && building.height <=120) value = 2;
            if( building.height >120 ) value = 3 ;

            var degrees = [] ;
            building.points.forEach(function (point){
                degrees.push(point.x);
                degrees.push(point.y);
            });

            //create a bounding sphere for the building
            var boundingSphere =BoundingSphere.fromPoints(new Cartesian3.fromDegreesArray(degrees));

            var cartesian = boundingSphere.center ;
            var cartographic = Cartographic.fromCartesian(cartesian);

            //bounding sphere latitude & longitude
            var longitude = CMath.toDegrees(cartographic.longitude);
            var latitude = CMath.toDegrees(cartographic.latitude);
            console.log ('long  : '+longitude + '  latitude  '+latitude);
            regionsModel.findRegionByPosition(latitude, longitude).then(function (region){

                scope.addBuilding(building.height, building.altitude, building.points, boundingSphere.center, boundingSphere.radius, region.id, value);
            });

        });

    };

    this.findBuildingsByRegionsArray = function( regionArray ){
        var promise = Buildings.find({ region : { $in : regionArray }  , height : { $gte : 0}}).populate('points') ;
        return promise ;
    } ;

    this.findBuildingsByRegionId = function (regionId){
        var promise = Buildings.find ({region : regionId}).populate('points');
        return promise ;
    };

    this.addBuilding = function (height, altitude, buildingPoints, boundingSphereCenter, boundingSphereRadius, region, value)
    {
        console.log('adding a building to databse');
        var building = new Buildings({
            height : height,
            altitude : altitude,
            x : boundingSphereCenter.x,
            y : boundingSphereCenter.y,
            z : boundingSphereCenter.z ,
            radius : boundingSphereRadius,
            region : region,
            value : value
        });

        for (index in buildingPoints)
        {
            var point = pointsModel.addPoint(buildingPoints[index]);
            building.points.push(point);
        }

        building.save();
        return building ;
    };


    this.findBuildings = function ()
    {
        var promise = Buildings.find().limit(100).populate('points').stream();
        return promise ;
    };

    this.removeAllBuildings = function ()
    {
        //remove the keys before the foreign keys
        Points.remove({}, function (err){
            Buildings.remove({}, function (err){
                regionsModel.removeAll();
            });
        });


    };
};

exports = module.exports = Buildings;