/**
 * Created by atassi on 15/02/2016.
 */

var expect  = require("chai").expect;
var request = require("request");

describe("cscloud api", function() {

    describe("gltf 3D models server", function () {

        var url = "http://localhost:3000/gltf";

        it("returns status 404 because there must be a file name in the url", function () {
            request(url, function (error, response, body) {
                expect(response.statusCode).to.equal(404);
            });
        });

        var wrongUrl = url + '/somefile' ;

        it("returns status 500 because the file \"somefile\"  does not exist", function () {
            request(wrongUrl, function (error, response, body) {
                expect(response.statusCode).to.equal(500);
            });
        });

        var goodUrl =url + '/house.gltf' ;

        it("returns status 200, because the gltf file does exist", function () {
            request(goodUrl, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
            });
        });


        it("the content type should be app/json", function () {
            request(goodUrl, function (error, response, body) {
                expect(response.contentType).to.equal('application/json');
            });
        });

    });
});