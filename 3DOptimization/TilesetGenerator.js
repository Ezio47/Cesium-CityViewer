
var fs = require('fs');
var BuildingsModel = require ('../Models/buildings_model');
var RegionsModel = require ('../Models/regions_model');
var mongoose = require('mongoose');
var Cartesian3 = require('cesium').Cartesian3 ;
var PolygonGeometry = require ('cesium').PolygonGeometry ;
var PerInstanceColorAppearance = require('cesium').PerInstanceColorAppearance ;


var TilesetGenerator = function (){


	this.generateTileset = function (minLatitude, maxLatitude, minLongitude, maxLongitude, latStep, longStep, tilesetName){
			var tileset = { root : {min_lat : minLatitude , max_lat : maxLatitude , min_long : minLongitude, max_long : maxLongitude},
			regions : [] };
			var region_id =0 ;
			for(var i = minLongitude ; i<=maxLongitude ; i=i+longStep)
			{
				for(var j = minLatitude ; j<=maxLatitude ; j=j+latStep)
				{
					var region = {region_id : region_id,   min_long : i , max_long : i+longStep , min_lat : j , max_lat : j+latStep};
					tileset.regions.push(region);
					region_id ++ ;
				}
			};

			fs.writeFile('Tilesets/'+tilesetName, JSON.stringify(tileset), function (err) {
				  if (err) return console.log(err);
				  console.log('tile set generated');
				});

			return tileset ;
	};

	this.generateData = function (){
		mongoose.connect('mongodb://localhost/3DViewer');
		var regionsModel = new RegionsModel(mongoose);
		var buildingsModel = new BuildingsModel(mongoose);
		var promise = regionsModel.getRegions() ;
		var basePath = './Tilesets'
		promise.then(function (regions){
			var j=0 ;
			//generate data folders
			for(var i =0 ; i<regions.length ; i++) {

					console.log(regions[i]);
					try {
						fs.mkdirSync(basePath + '/' + regions[i].id);
						fs.mkdirSync(basePath + '/' + regions[i].id + '/lod1');
						fs.writeFileSync(basePath + '/' + regions[i].id + '/lod1/' + 'geometry', '[');
						fs.mkdirSync(basePath + '/' + regions[i].id + '/lod2');
						fs.writeFileSync(basePath + '/' + regions[i].id + '/lod2/' + 'geometry', '[');
						fs.mkdirSync(basePath + '/' + regions[i].id + '/lod3');
						fs.writeFileSync(basePath + '/' + regions[i].id + '/lod3/' + 'geometry', '[');
						fs.mkdirSync(basePath + '/' + regions[i].id + '/lod4');
						fs.writeFileSync(basePath + '/' + regions[i].id + '/lod4/' + 'geometry', '[');
						fs.mkdirSync(basePath + '/' + regions[i].id + '/lod5');
						fs.writeFileSync(basePath + '/' + regions[i].id + '/lod5/' + 'geometry', '[');
						fs.mkdirSync(basePath + '/' + regions[i].id + '/lod6');
						fs.writeFileSync(basePath + '/' + regions[i].id + '/lod6/' + 'geometry', '[');
						fs.mkdirSync(basePath + '/' + regions[i].id + '/lod7');
						fs.writeFileSync(basePath + '/' + regions[i].id + '/lod7/' + 'geometry', '[');
						fs.mkdirSync(basePath + '/' + regions[i].id + '/lod8');
						fs.writeFileSync(basePath + '/' + regions[i].id + '/lod8/' + 'geometry', '[');
						fs.mkdirSync(basePath + '/' + regions[i].id + '/lod9');
						fs.writeFileSync(basePath + '/' + regions[i].id + '/lod9/' + 'geometry', '[');
						fs.mkdirSync(basePath + '/' + regions[i].id + '/lod10');
						fs.writeFileSync(basePath + '/' + regions[i].id + '/lod10/' + 'geometry', '[');
						fs.mkdirSync(basePath + '/' + regions[i].id + '/lod11');
						fs.writeFileSync(basePath + '/' + regions[i].id + '/lod11/' + 'geometry', '[');
						fs.mkdirSync(basePath + '/' + regions[i].id + '/lod12');
						fs.writeFileSync(basePath + '/' + regions[i].id + '/lod12/' + 'geometry', '[');
						fs.mkdirSync(basePath + '/' + regions[i].id + '/lod13');
						fs.writeFileSync(basePath + '/' + regions[i].id + '/lod13/' + 'geometry', '[');
						fs.mkdirSync(basePath + '/' + regions[i].id + '/lod14');
						fs.writeFileSync(basePath + '/' + regions[i].id + '/lod14/' + 'geometry', '[');
						fs.mkdirSync(basePath + '/' + regions[i].id + '/lod15');
						fs.writeFileSync(basePath + '/' + regions[i].id + '/lod15/' + 'geometry', '[');

						var promise = buildingsModel.findBuildingsByRegionId(regions[i].id);
						j=0 ;
						promise.then(function (buildings) {
							console.log('found buildings ') ;
							var lod1= false, lod2 = false, lod3 = false , lod4 = false, lod5 = false ; 
							var lod6= false, lod7 = false, lod8 = false , lod9 = false, lod10 = false ; 
							var lod11= false, lod12 = false, lod13 = false , lod14 = false, lod15 = false ; 
							buildings.forEach(function (building) {
								var points = [];

								//some transformations on the buildings vertices
								building.points.forEach(function (point) {
									points.push(point.x);
									points.push(point.y);
								});

								//the buildings vertices that will be sent to cesium
								var positions = Cartesian3.fromDegreesArray(points);

								//create a geometry
								var geometry = PolygonGeometry.fromPositions({
									positions: positions,
									extrudedHeight: building.height,  //building.height,
									vertexFormat: PerInstanceColorAppearance.VERTEX_FORMAT
								});
								console.log("reeggggiion" + regions[i] +'building  '+building);

								var stringifiedGeometry = JSON.stringify(geometry);
								
								var content = stringifiedGeometry ;

								if (building.height > 270) {
									if( ! lod1)
									{
											fs.appendFileSync(basePath + '/' + building.region + '/lod1/' + 'geometry','{"id" : "'+building.region+'#1",');
											fs.appendFileSync(basePath + '/' + building.region + '/lod1/' + 'geometry','"geometry" : '+content+'}');
											lod1 = true ;
									}
									else
									{
											fs.appendFileSync(basePath + '/' + building.region + '/lod1/' + 'geometry',',{"id" : '+building.region+'#1",');
											fs.appendFileSync(basePath + '/' + building.region + '/lod1/' + 'geometry','"geometry" : '+content+'}');
									}
								}
								else if (building.height > 230) {
									if( ! lod2)
									{
											fs.appendFileSync(basePath + '/' + building.region + '/lod2/' + 'geometry','{"id" : "'+building.region+'#2",');
											fs.appendFileSync(basePath + '/' + building.region + '/lod2/' + 'geometry','"geometry" : '+content+'}');
											lod2 = true ;
									}
									else
									{
											fs.appendFileSync(basePath + '/' + building.region + '/lod2/' + 'geometry',',{"id" : "'+building.region+'#2",');
											fs.appendFileSync(basePath + '/' + building.region + '/lod2/' + 'geometry','"geometry" : '+content+'}');
									}
	
								}
								else if (building.height > 190) {
									if( ! lod3)
									{
											fs.appendFileSync(basePath + '/' + building.region + '/lod3/' + 'geometry','{"id" : "'+building.region+'#3",');
											fs.appendFileSync(basePath + '/' + building.region + '/lod3/' + 'geometry','"geometry" : '+content+'}');
											lod3 = true ;
									}
									else
									{
											fs.appendFileSync(basePath + '/' + building.region + '/lod3/' + 'geometry',',{"id" : "'+building.region+'#3",');
											fs.appendFileSync(basePath + '/' + building.region + '/lod3/' + 'geometry','"geometry" : '+content+'}');
									}
								}
								else if (building.height > 140) {
									if( ! lod4)
									{
											fs.appendFileSync(basePath + '/' + building.region + '/lod4/' + 'geometry','{"id" : "'+building.region+'#4",');
											fs.appendFileSync(basePath + '/' + building.region + '/lod4/' + 'geometry','"geometry" : '+content+'}');
											lod4 = true ;
									}
									else
									{
											fs.appendFileSync(basePath + '/' + building.region + '/lod4/' + 'geometry',',{"id" : "'+building.region+'#4",');
											fs.appendFileSync(basePath + '/' + building.region + '/lod4/' + 'geometry','"geometry" : '+content+'}');
									}
								}
								else if (building.height > 100) {
									if( ! lod5)
									{
											fs.appendFileSync(basePath + '/' + building.region + '/lod5/' + 'geometry','{"id" : "'+building.region+'#5",');
											fs.appendFileSync(basePath + '/' + building.region + '/lod5/' + 'geometry','"geometry" : '+content+'}');
											lod5 = true ;
									}
									else
									{
											fs.appendFileSync(basePath + '/' + building.region + '/lod5/' + 'geometry',',{"id" : "'+building.region+'#5",');
											fs.appendFileSync(basePath + '/' + building.region + '/lod5/' + 'geometry','"geometry" : '+content+'}');
									}
								}
								else if (building.height > 90) {
									if( ! lod6)
									{
											fs.appendFileSync(basePath + '/' + building.region + '/lod6/' + 'geometry','{"id" : "'+building.region+'#6",');
											fs.appendFileSync(basePath + '/' + building.region + '/lod6/' + 'geometry','"geometry" : '+content+'}');
											lod6 = true ;
									}
									else
									{
											fs.appendFileSync(basePath + '/' + building.region + '/lod6/' + 'geometry',',{"id" : "'+building.region+'#6",');
											fs.appendFileSync(basePath + '/' + building.region + '/lod6/' + 'geometry','"geometry" : '+content+'}');
									}
								}
								else if (building.height > 80) {
									if( ! lod7)
									{
											fs.appendFileSync(basePath + '/' + building.region + '/lod7/' + 'geometry','{"id" : "'+building.region+'#7",');
											fs.appendFileSync(basePath + '/' + building.region + '/lod7/' + 'geometry','"geometry" : '+content+'}');
											lod4 = true ;
									}
									else
									{
											fs.appendFileSync(basePath + '/' + building.region + '/lod7/' + 'geometry',',{"id" : "'+building.region+'#7",');
											fs.appendFileSync(basePath + '/' + building.region + '/lod7/' + 'geometry','"geometry" : '+content+'}');
									}
								}
								else if (building.height > 70) {
									if( ! lod8)
									{
											fs.appendFileSync(basePath + '/' + building.region + '/lod8/' + 'geometry','{"id" : "'+building.region+'#8",');
											fs.appendFileSync(basePath + '/' + building.region + '/lod8/' + 'geometry','"geometry" : '+content+'}');
											lod8 = true ;
									}
									else
									{
											fs.appendFileSync(basePath + '/' + building.region + '/lod8/' + 'geometry',',{"id" : "'+building.region+'#8",');
											fs.appendFileSync(basePath + '/' + building.region + '/lod8/' + 'geometry','"geometry" : '+content+'}');
									}
								}
								else if (building.height > 60) {
									if( ! lod9)
									{
											fs.appendFileSync(basePath + '/' + building.region + '/lod9/' + 'geometry','{"id" : "'+building.region+'#9",');
											fs.appendFileSync(basePath + '/' + building.region + '/lod9/' + 'geometry','"geometry" : '+content+'}');
											lod9 = true ;
									}
									else
									{
											fs.appendFileSync(basePath + '/' + building.region + '/lod9/' + 'geometry',',{"id" : "'+building.region+'#9",');
											fs.appendFileSync(basePath + '/' + building.region + '/lod9/' + 'geometry','"geometry" : '+content+'}');
									}
								}
								else if (building.height > 50) {
									if( ! lod10)
									{
											fs.appendFileSync(basePath + '/' + building.region + '/lod10/' + 'geometry','{"id" : "'+building.region+'#10",');
											fs.appendFileSync(basePath + '/' + building.region + '/lod10/' + 'geometry','"geometry" : '+content+'}');
											lod10 = true ;
									}
									else
									{
											fs.appendFileSync(basePath + '/' + building.region + '/lod10/' + 'geometry',',{"id" : "'+building.region+'#10",');
											fs.appendFileSync(basePath + '/' + building.region + '/lod10/' + 'geometry','"geometry" : '+content+'}');
									}
								}
								else if (building.height > 40) {
									if( ! lod11)
									{
											fs.appendFileSync(basePath + '/' + building.region + '/lod11/' + 'geometry','{"id" : "'+building.region+'#11",');
											fs.appendFileSync(basePath + '/' + building.region + '/lod11/' + 'geometry','"geometry" : '+content+'}');
											lod11 = true ;
									}
									else
									{
											fs.appendFileSync(basePath + '/' + building.region + '/lod11/' + 'geometry',',{"id" : "'+building.region+'#11",');
											fs.appendFileSync(basePath + '/' + building.region + '/lod11/' + 'geometry','"geometry" : '+content+'}');
									}
								}
								else if (building.height > 30) {
									if( ! lod12)
									{
											fs.appendFileSync(basePath + '/' + building.region + '/lod12/' + 'geometry','{"id" : "'+building.region+'#12",');
											fs.appendFileSync(basePath + '/' + building.region + '/lod12/' + 'geometry','"geometry" : '+content+'}');
											lod12 = true ;
									}
									else
									{
											fs.appendFileSync(basePath + '/' + building.region + '/lod12/' + 'geometry',',{"id" : "'+building.region+'#12",');
											fs.appendFileSync(basePath + '/' + building.region + '/lod12/' + 'geometry','"geometry" : '+content+'}');
									}
								}
								else if (building.height > 20) {
									if( ! lod13)
									{
											fs.appendFileSync(basePath + '/' + building.region + '/lod13/' + 'geometry','{"id" : "'+building.region+'#13",');
											fs.appendFileSync(basePath + '/' + building.region + '/lod13/' + 'geometry','"geometry" : '+content+'}');
											lod13 = true ;
									}
									else
									{
											fs.appendFileSync(basePath + '/' + building.region + '/lod13/' + 'geometry',',{"id" : "'+building.region+'#13",');
											fs.appendFileSync(basePath + '/' + building.region + '/lod13/' + 'geometry','"geometry" : '+content+'}');
									}
								}

								else if (building.height > 10) {
									if( ! lod14)
									{
											fs.appendFileSync(basePath + '/' + building.region + '/lod14/' + 'geometry','{"id" : "'+building.region+'#14",');
											fs.appendFileSync(basePath + '/' + building.region + '/lod14/' + 'geometry','"geometry" : '+content+'}');
											lod14 = true ;
									}
									else
									{
											fs.appendFileSync(basePath + '/' + building.region + '/lod14/' + 'geometry',',{"id" : "'+building.region+'#14",');
											fs.appendFileSync(basePath + '/' + building.region + '/lod14/' + 'geometry','"geometry" : '+content+'}');
									}
								}

								else {
									if( ! lod15)
									{
											fs.appendFileSync(basePath + '/' + building.region + '/lod15/' + 'geometry','{"id" : "'+building.region+'#15",');
											fs.appendFileSync(basePath + '/' + building.region + '/lod15/' + 'geometry','"geometry" : '+content+'}');
											lod15 = true ;
									}
									else
									{
											fs.appendFileSync(basePath + '/' + building.region + '/lod15/' + 'geometry',', {"id" : "'+building.region+'#15",');
											fs.appendFileSync(basePath + '/' + building.region + '/lod15/' + 'geometry','"geometry" : '+content+'}');
									}
								}

								if( buildings[buildings.length-1] === building)
								{
									fs.appendFileSync(basePath + '/' + building.region + '/lod1/' + 'geometry', ']');
									fs.appendFileSync(basePath + '/' + building.region + '/lod2/' + 'geometry', ']');
									fs.appendFileSync(basePath + '/' + building.region + '/lod3/' + 'geometry', ']');
									fs.appendFileSync(basePath + '/' + building.region + '/lod4/' + 'geometry', ']');
									fs.appendFileSync(basePath + '/' + building.region + '/lod5/' + 'geometry', ']');
									fs.appendFileSync(basePath + '/' + building.region + '/lod6/' + 'geometry', ']');
									fs.appendFileSync(basePath + '/' + building.region + '/lod7/' + 'geometry', ']');
									fs.appendFileSync(basePath + '/' + building.region + '/lod8/' + 'geometry', ']');
									fs.appendFileSync(basePath + '/' + building.region + '/lod9/' + 'geometry', ']');
									fs.appendFileSync(basePath + '/' + building.region + '/lod10/' + 'geometry', ']');
									fs.appendFileSync(basePath + '/' + building.region + '/lod11/' + 'geometry', ']');
									fs.appendFileSync(basePath + '/' + building.region + '/lod12/' + 'geometry', ']');
									fs.appendFileSync(basePath + '/' + building.region + '/lod13/' + 'geometry', ']');
									fs.appendFileSync(basePath + '/' + building.region + '/lod14/' + 'geometry', ']');
									fs.appendFileSync(basePath + '/' + building.region + '/lod15/' + 'geometry', ']');
								}

								j++ ;
							});




						});

					} catch (e) {
						if (e.code != 'EEXIST') throw e;
					}

			}



		});

	}

};

module.exports = TilesetGenerator ;
