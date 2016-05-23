/**
 * Created by atassi on 16/02/2016.
 */


var Intersect = require('cesium').Intersect ;
var CullingVolume = require('cesium').CullingVolume ;

var FrustumCulling = function (boundingVolume, cullingVolume) {

    this.intersect = undefined;
    this.boudingVolume = boundingVolume;
    this.cullingVolume = cullingVolume;

    this.computeVisibility = function () {
        var culling = new CullingVolume( this.cullingVolume);
        var visibility;

        visibility = culling.computeVisibility(this.boudingVolume);
        if (visibility == Intersect.INSIDE) {
            this.intersect = "inside";
        }
        else if (visibility == Intersect.OUTSIDE) {
            this.intersect = "outside";
        }
        else if (visibility == Intersect.INTERSECTING) {
            this.intersect = "intersecting";
        }
        else
            throw  'error while computing visibility';

        return this.intersect;

    }
};


module.exports = FrustumCulling;



