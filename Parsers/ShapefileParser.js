/**
 * Created by atassi on 24/02/2016.
 */

var fs   = require ('fs') ;
var ShapefileConverter = require('../Converters/ShapefileConverter');

var ShapefileParser = function (filePath, /* the height attributes changes from a file to the other */ heightAttributeName){

    var extrudedPolygons = [];
    var jsonData =[];


    this.parseShapefile = function (){
        
        //convert the shapefile to a geojson file , json files are much easier to parse then a shapefile or a mapinfo
        var shapefileConverter = new ShapefileConverter(filePath, './output.json');
        var result = shapefileConverter.convert();
        

        //if the parsing pass tyhen
        if (result.status !== 0) {
            throw "Cant not parse file" 
        }
        else
        {
            //load in memory the generated json file
            jsonData = fs.readFileSync('./output.json');
            var json = JSON.parse(jsonData);
            var i =0 ;

            //loop over every and each feature and push into the features list
            var features = json.features ; 
            for(var j=0 ; j<features.length ; j++){
               console.log('parsing shape file ');
               var height = features[j].properties[heightAttributeName] ;
               var altitude = 0 ;
               var points = [];
               
               if(features[j].geometry.type != 'Polygon')
                    throw "geometries type should be polygon" ;
               features[j].geometry.coordinates[0].forEach(function(coordinate){
                   points.push({x:coordinate[0], y:coordinate[1] , z : 0});
               });
               extrudedPolygons.push({height : height , altitude : altitude, points : points}) ;
            }

            //return the list of the polygons with height attribute
            return extrudedPolygons;
       }
    };

};

module.exports = ShapefileParser;