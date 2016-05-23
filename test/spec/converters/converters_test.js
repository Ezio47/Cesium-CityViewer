/**
 * Created by atassi on 29/02/2016.
 */

var expect  = require("chai").expect;
var request = require("request");
var ShapefileConverter = require("../../../Converters/ShapefileConverter");
var ColladaToGltf = require("../../../Converters/ColladaToGltf");
var fs = require("fs");

describe("cscloud api", function() {

    describe("gltf 3D models server", function () {

        var converter = new ShapefileConverter("Data/shapefiles/75/75-.shp",
                                                "Data/output.geojson");
        converter.convert();
        // Query the entry
        var stats = fs.lstatSync('Data/output.geojson');

        it("the generated geojson file should be found in the data directory", function () {
                expect(stats.isFile()).to.equal(true);
        });



        var converter = new ShapefileConverter("Data/mapinfo/HONG_KONG/MONUMENT/HONG_KONG_32_MONUMENT.tab",
                                                "Data/output1.geojson");
        converter.convert();

        var stats = fs.lstatSync('Data/output1.geojson');

        it("the generated geojson file should be found in the data directory", function () {
                expect(stats.isFile()).to.equal(true);
        });
        



    });
});