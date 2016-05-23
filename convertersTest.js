
var TilesetGenerator = require('./3DOptimization/TilesetGenerator');
var mongoose = require('mongoose');



//polygons model
var Buildings = require('./Models/buildings_model');
var Regions = require ('./Models/regions_model');
var Parser = require('./Parsers/ShapefileParser')

/*mongoose.connection.on('error', function(err){
    console.log('connection is already opened or mongodb server is down');
});
mongoose.connect('mongodb://localhost/3DViewer');*/


// var buildings = new Buildings(mongoose);


// /*var tilesetGenerator = new TilesetGenerator (22.15, 22.56, 113.83, 114.40);
// var tileset = tilesetGenerator.generateTileset(0.02,0.02,'HONG_KONG.json');*/


/*var buildings = new Buildings(mongoose);

var parser = new Parser('./Data/HONG_KONG_32_BUILDING.tab','AGL');
var extrudedBuildings = parser.parseShapefile();
console.log('done parsing');


buildings.addBuildings(extrudedBuildings, buildings);*/


var tilesetGenerator = new TilesetGenerator ();
var tileset = tilesetGenerator.generateTileset(22.15, 22.56, 113.83, 114.40, 0.02,0.02,'HONG_KONG.json');
tilesetGenerator.generateData();


// //buildings.duplicateRegionsSchema();

// //buildings.assignRegionToBuildings();

