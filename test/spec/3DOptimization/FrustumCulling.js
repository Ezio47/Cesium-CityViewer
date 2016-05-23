var expect  = require("chai").expect;
var FrustumCulling = require ("../../../3DOptimization/FrustumCulling");
var BoundingSphere = require('cesium').BoundingSphere;
var Cartesian3 = require ('cesium').Cartesian3 ;
var Cartesian4 = require ('cesium').Cartesian4 ;
var Intersect = require ('cesium').Intersect ;
var PerspectiveFrustum = require ('cesium').PerspectiveFrustum ;
var Math = require ('cesium').Math ;

describe("frustumculling", function() {
    var planes ;
    var boundingBox ;
    describe("frustum culling tests using cartesian3 bounding boxes", function () {

        it(" should Return Inside because the frustum volume contains france territory and the bounding volume is Paris ", function () {
            //camera over france map
            planes = [] ;
            planes.push(new Cartesian4(-0.36301625735886145,  0.8520390747857254,  -0.377158603151718,  3190169.267769491));
            planes.push(new Cartesian4(-0.29435132162076477, -0.8786578569625243,  -0.3759224253195631, 3196167.1775151347));
            planes.push(new Cartesian4(-0.9239905184237979,  -0.03632782018924627,  0.380685974713055,  2076128.0350597107));
            planes.push(new Cartesian4( 0.46832473513611783,  0.07578753662039182, -0.8803000577942283, 11920041.149936525));
            planes.push(new Cartesian4(-0.6572913038946775,  -0.02662398794622361, -0.7531661869005234, 6392333.357175652));
            planes.push(new Cartesian4( 0.6572913038946775,   0.02662398794622361,  0.7531661869005234, 493607665.6428244));

            //bounding box over Paris
            boundingSphere =new BoundingSphere(new Cartesian3(4202429.094501561, 172725.73507086452, 4781908.89223897), 10);
            var frustumCulling = new FrustumCulling(boundingSphere ,planes);
            expect(frustumCulling.computeVisibility()).to.equal('inside');

        });

        it("should Return Outside because the frustum volume contains france territory and the bounding volume is New York City ", function () {
            //camera over france map
            planes = [] ;
            planes.push(new Cartesian4(-0.36301625735886145,0.8520390747857254, -0.377158603151718, 3190169.267769491 ));
            planes.push(new Cartesian4(-0.29435132162076477, -0.8786578569625243, -0.3759224253195631, 3196167.1775151347));
            planes.push(new Cartesian4(-0.9239905184237979, -0.03632782018924627, 0.380685974713055, 2076128.0350597107));
            planes.push(new Cartesian4( 0.46832473513611783, 0.07578753662039182, -0.8803000577942283, 11920041.149936525));
            planes.push(new Cartesian4(-0.6572913038946775, -0.02662398794622361,-0.7531661869005234, 6392333.357175652));
            planes.push(new Cartesian4( 0.6572913038946775, 0.02662398794622361, 0.7531661869005234, 493607665.6428244));

            //bounding box over Newyork
            boundingSphere =new BoundingSphere(new Cartesian3(1355572.9945743661, -4753172.341416035, 4225461.720574692), 10);
            var frustumCulling = new FrustumCulling(boundingSphere ,planes);
            expect(frustumCulling.computeVisibility()).to.equal('outside');
        });
    });


    describe("frustum culling tests using degrees (lat, long, height) as reference for the bounding boxes", function () {
        it(" should Return Inside because the frustum volume contains france territory and the bounding volume is Paris ", function () {
            //camera over france map
            planes = [] ;
            planes.push(new Cartesian4(-0.36301625735886145,0.8520390747857254, -0.377158603151718, 3190169.267769491 ));
            planes.push(new Cartesian4(-0.29435132162076477, -0.8786578569625243, -0.3759224253195631, 3196167.1775151347));
            planes.push(new Cartesian4(-0.9239905184237979, -0.03632782018924627, 0.380685974713055, 2076128.0350597107));
            planes.push(new Cartesian4( 0.46832473513611783, 0.07578753662039182, -0.8803000577942283, 11920041.149936525));
            planes.push(new Cartesian4(-0.6572913038946775, -0.02662398794622361,-0.7531661869005234, 6392333.357175652));
            planes.push(new Cartesian4( 0.6572913038946775, 0.02662398794622361, 0.7531661869005234, 493607665.6428244));

            //bounding box over Paris
            boundingSphere =new BoundingSphere(Cartesian3.fromDegrees(2.34,48.8,42), 10);
            var frustumCulling = new FrustumCulling(boundingSphere ,planes);
            expect(frustumCulling.computeVisibility()).to.equal('inside');

        });

        it("should Return Outside because the frustum volume contains france territory and the bounding volume is Bahamas ", function () {
            //camera over france map
            planes = [] ;
            planes.push(new Cartesian4(-0.36301625735886145,0.8520390747857254, -0.377158603151718, 3190169.267769491 ));
            planes.push(new Cartesian4(-0.29435132162076477, -0.8786578569625243, -0.3759224253195631, 3196167.1775151347));
            planes.push(new Cartesian4(-0.9239905184237979, -0.03632782018924627, 0.380685974713055, 2076128.0350597107));
            planes.push(new Cartesian4( 0.46832473513611783, 0.07578753662039182, -0.8803000577942283, 11920041.149936525));
            planes.push(new Cartesian4(-0.6572913038946775, -0.02662398794622361,-0.7531661869005234, 6392333.357175652));
            planes.push(new Cartesian4( 0.6572913038946775, 0.02662398794622361, 0.7531661869005234, 493607665.6428244));

            //bounding box over Newyork
            boundingSphere =new BoundingSphere(Cartesian3.fromDegrees(-73.993286,40.696011,28), 10);
            var frustumCulling = new FrustumCulling(boundingSphere ,planes);
            expect(frustumCulling.computeVisibility()).to.equal('outside');

        });


        it("should Return Outside because the frustum volume contains eiffel tower and the bounding volume is notre dame cathedral ", function () {
            //camera over eiffel tower
            planes = [] ;
            planes.push(new Cartesian4(-0.36306026310492445,0.852168467227284, -0.3768237636054719, 3183579.7410062472 ));
            planes.push(new Cartesian4(-0.29431254007638297, -0.8785173667555757, -0.3762809655865477, 3183579.7410062533));
            planes.push(new Cartesian4(-0.9239447405903036, -0.03658226883580681, 0.3807727064042919, 2067645.4789300633));
            planes.push(new Cartesian4( 0.5011510563588064, 0.0196357991110169, -0.8651370146420921, 2027435.4286795356));
            planes.push(new Cartesian4(-0.6573728031812458, -0.02634889952828993,-0.7531047291919489, 6167159.482011903));
            planes.push(new Cartesian4( 0.6573728031812458, 0.02634889952828993, 0.7531047291919489, 493632840.5179879));

            //bounding box over notre dame cathedral
            boundingSphere =new BoundingSphere(Cartesian3.fromDegrees(2.349902,48.852966, 35), 10);
            var frustumCulling = new FrustumCulling(boundingSphere ,planes);
            expect(frustumCulling.computeVisibility()).to.equal('outside');

        });


        it("should Return Inside because the frustum volume contains eiffel tower and the bounding volume is eiffel tower ", function () {
            //camera over eiffel tower
            planes = [] ;
            planes.push(new Cartesian4(-0.3636071004222849,0.8521192895490192, -0.37640748252517053, 3183204.4854239346 ));
            planes.push(new Cartesian4(-0.2937742161537279, -0.8785231604328663, -0.3766878900446283, 3183204.485829261));
            planes.push(new Cartesian4(-0.9239088980678276, -0.037342201103785944, 0.3807859084679718, 2067404.0955072814));
            planes.push(new Cartesian4( 0.5011097379996445, 0.02036037614723215, 0.8651441992899405, 2027194.1194804655));
            planes.push(new Cartesian4(-0.6573813165854077, -0.0264038709210121,-0.7530953725822653,6366407.971358533));
            planes.push(new Cartesian4( 0.6573813165854077, 0.0264038709210121, 0.7530953725822653, 493633591.0286407));

            //bounding box over eiffel tower
            boundingSphere =new BoundingSphere(new Cartesian3(4201045.052627293, 168729.49138537087, 4780439.26837193), 1);
            var frustumCulling = new FrustumCulling(boundingSphere ,planes);
            expect(frustumCulling.computeVisibility()).to.equal('inside');

        });


        it("should Return Outside because the frustum volume contains eiffel tower and the bounding volume is Notre dame cathedral ", function () {
            //camera over eiffel tower
            planes = [] ;
            planes.push(new Cartesian4(-0.3636071004222849,0.8521192895490192, -0.37640748252517053, 3183204.4854239346 ));
            planes.push(new Cartesian4(-0.2937742161537279, -0.8785231604328663, -0.3766878900446283, 3183204.485829261));
            planes.push(new Cartesian4(-0.9239088980678276, -0.037342201103785944, 0.3807859084679718, 2067404.0955072814));
            planes.push(new Cartesian4( 0.5011097379996445, 0.02036037614723215, 0.8651441992899405, 2027194.1194804655));
            planes.push(new Cartesian4(-0.6573813165854077, -0.0264038709210121,-0.7530953725822653,6366407.971358533));
            planes.push(new Cartesian4( 0.6573813165854077, 0.0264038709210121, 0.7530953725822653, 493633591.0286407));

            //bounding box over notre dame cathedral
            boundingSphere =new BoundingSphere(new Cartesian3(4201275.553124992, 172387.9723044149, 4779872.860552276), 1);
            var frustumCulling = new FrustumCulling(boundingSphere ,planes);
            expect(frustumCulling.computeVisibility()).to.equal('outside');

        });

        it("should Return Outside because the frustum volume contains eiffel tower and the bounding volume is Notre dame cathedral ", function () {
            //camera over eiffel tower
            planes = [] ;
            planes.push(new Cartesian4(-0.3636071004222849,0.8521192895490192, -0.37640748252517053, 3183204.4854239346 ));
            planes.push(new Cartesian4(-0.2937742161537279, -0.8785231604328663, -0.3766878900446283, 3183204.485829261));
            planes.push(new Cartesian4(-0.9239088980678276, -0.037342201103785944, 0.3807859084679718, 2067404.0955072814));
            planes.push(new Cartesian4( 0.5011097379996445, 0.02036037614723215, 0.8651441992899405, 2027194.1194804655));
            planes.push(new Cartesian4(-0.6573813165854077, -0.0264038709210121,-0.7530953725822653,6366407.971358533));
            planes.push(new Cartesian4( 0.6573813165854077, 0.0264038709210121, 0.7530953725822653, 493633591.0286407));

            //bounding box over notre dame cathedral
            boundingSphere =new BoundingSphere(Cartesian3.fromDegrees(2.349902, 48.852966, 35), 1);
            var frustumCulling = new FrustumCulling(boundingSphere ,planes);
            expect(frustumCulling.computeVisibility()).to.equal('outside');

        });

        it("should Return Inside because the frustum volume contains eiffel tower and the bounding volume is Eiffel tower ", function () {
            //camera over eiffel tower

            var cameraPosition =  new Cartesian3(4204936.271740325, 168281.66801348326, 4784961.300330742);
            var cameraDirection = new Cartesian3 (-0.6573779798827106, -0.026309291254426614, -0.7531015952439719);
            var cameraUp = new Cartesian3 (-0.7525112629806391, -0.02981361328130876, 0.6579042084910925);

            var frustum = new PerspectiveFrustum();
            frustum.aspectRatio = 1.98;
            frustum.fov = Math.PI_OVER_THREE;



            var cullingVolume = frustum.computeCullingVolume(cameraPosition, cameraDirection, cameraUp);
            //bounding box over the eiffel tower
            boundingSphere =new BoundingSphere(Cartesian3.fromDegrees(2.294694, 48.858093, 0.0), 1);
            var frustumCulling = new FrustumCulling(boundingSphere ,cullingVolume);
            expect(frustumCulling.computeVisibility()).to.equal('inside');

        });


        it("should Return Outside because the frustum volume contains eiffel tower and the bounding volume is Notre dame cathedral ", function () {
            //camera over eiffel tower

            var cameraPosition =  new Cartesian3(4201066.487126744, 168707.26382428885, 4780461.58271226);
            var cameraDirection = new Cartesian3 (-0.6573812297005188, -0.026409280358732495, -0.7530952587477657);
            var cameraUp = new Cartesian3(-0.7526059850023485, -0.027214731613048212, 0.6579084964652763);

            var frustum = new PerspectiveFrustum();
            frustum.aspectRatio = 1.98;
            frustum.fov = Math.PI_OVER_THREE;



            var cullingVolume = frustum.computeCullingVolume(cameraPosition, cameraDirection, cameraUp);
            //bounding box over the eiffel tower
            boundingSphere =new BoundingSphere(Cartesian3.fromDegrees(0, 51, 0), 1);
            //var frustumCulling = new FrustumCulling(boundingSphere ,cullingVolume);
            //expect(frustumCulling.computeVisibility()).to.equal('outside');
            expect(cullingVolume.computeVisibility(boundingSphere)).to.equal(Intersect.OUTSIDE);

        });

        it("should Return Outside because the frustum volume contains eiffel tower and the bounding volume is Notre dame cathedral ", function () {
            //camera over eiffel tower

            var cameraPosition =  new Cartesian3(4204818.936943417, 168632.70021801576, 4784495.676073827);
            var cameraDirection = new Cartesian3 (-0.6574024260364408, -0.026374350291332484, -0.7530779799516829);
            var cameraUp = new Cartesian3(-0.752583869141314, -0.027340101528880452, 0.6579285970038635);

            var frustum = new PerspectiveFrustum();
            frustum.aspectRatio = 1.98;
            frustum.fov = Math.PI_OVER_THREE;



            var cullingVolume = frustum.computeCullingVolume(cameraPosition, cameraDirection, cameraUp);
            //bounding box over the eiffel tower
            boundingSphere =new BoundingSphere(Cartesian3.fromDegrees(2.294694, 48.858093, 0), 1);
            //var frustumCulling = new FrustumCulling(boundingSphere ,cullingVolume);
            //expect(frustumCulling.computeVisibility()).to.equal('outside');
            expect(cullingVolume.computeVisibility(boundingSphere)).to.equal(Intersect.INSIDE);

        });


        it("should Return Outside because the frustum volume contains eiffel tower and the bounding volume is Amiens ", function () {
            //camera over eiffel tower

            var cameraPosition =  new Cartesian3(4204818.936943417, 168632.70021801576, 4784495.676073827);
            var cameraDirection = new Cartesian3 (-0.6574024260364408, -0.026374350291332484, -0.7530779799516829);
            var cameraUp = new Cartesian3(-0.752583869141314, -0.027340101528880452, 0.6579285970038635);

            var frustum = new PerspectiveFrustum();
            frustum.aspectRatio = 1.98;
            frustum.fov = Math.PI_OVER_THREE;



            var cullingVolume = frustum.computeCullingVolume(cameraPosition, cameraDirection, cameraUp);
            //bounding box over Amiens
            boundingSphere =new BoundingSphere(Cartesian3.fromDegrees(2.3000000, 49.9000000, 0), 1);
            //var frustumCulling = new FrustumCulling(boundingSphere ,cullingVolume);
            //expect(frustumCulling.computeVisibility()).to.equal('outside');
            expect(cullingVolume.computeVisibility(boundingSphere)).to.equal(Intersect.OUTSIDE);

        });

        it("should Return Outside because the frustum volume contains eiffel tower and the bounding volume is Amiens ", function () {
            //camera over eiffel tower

            var cameraPosition =  new Cartesian3(4201495.50053111, 168728.46302859223, 4780931.394554636);
            var cameraDirection = new Cartesian3 (-0.6573828957053508, -0.026410176569414388, -0.7530937730506175);
            var cameraUp = new Cartesian3(-0.7526068455633782, -0.02715279922323452, 0.6579100709848267);

            var frustum = new PerspectiveFrustum();
            frustum.aspectRatio = 1.98;
            frustum.fov = Math.PI_OVER_THREE;



            var cullingVolume = frustum.computeCullingVolume(cameraPosition, cameraDirection, cameraUp);
            //bounding box over Amiens
            boundingSphere =new BoundingSphere(Cartesian3.fromDegrees(2.294481, 48.858370, 0), 1);
            //var frustumCulling = new FrustumCulling(boundingSphere ,cullingVolume);
            //expect(frustumCulling.computeVisibility()).to.equal('outside');
            expect(cullingVolume.computeVisibility(boundingSphere)).to.equal(Intersect.INSIDE);

        });



        it("should Return Inside because the frustum volume contains eiffel tower and the bounding volume is Amiens ", function () {
            //camera over eiffel tower

            var cameraPosition =  new Cartesian3(4201495.50053111, 168728.46302859223, 4780931.394554636);
            var cameraDirection = new Cartesian3 (-0.6573828957053508, -0.026410176569414388, -0.7530937730506175);
            var cameraUp = new Cartesian3(-0.7526068455633782, -0.02715279922323452, 0.6579100709848267);

            var frustum = new PerspectiveFrustum();
            frustum.aspectRatio = 1.98;
            frustum.fov = Math.PI_OVER_THREE;



            var cullingVolume = frustum.computeCullingVolume(cameraPosition, cameraDirection, cameraUp);
            //bounding box over Amiens
            boundingSphere =new BoundingSphere(Cartesian3.fromDegrees(2.294481, 48.858370, 0), 1);
            var frustumCulling = new FrustumCulling(boundingSphere ,cullingVolume.planes);
            expect(frustumCulling.computeVisibility()).to.equal("inside");


        });


        it("should Return Outside because the frustum volume contains eiffel tower and the bounding volume is Amiens ", function () {
            //camera over eiffel tower

            var cameraPosition =  new Cartesian3(4204818.936943417, 168632.70021801576, 4784495.676073827);
            var cameraDirection = new Cartesian3 (-0.6574024260364408, -0.026374350291332484, -0.7530779799516829);
            var cameraUp = new Cartesian3(-0.752583869141314, -0.027340101528880452, 0.6579285970038635);

            var frustum = new PerspectiveFrustum();
            frustum.aspectRatio = 1.98;
            frustum.fov = Math.PI_OVER_THREE;



            var cullingVolume = frustum.computeCullingVolume(cameraPosition, cameraDirection, cameraUp);
            //bounding box over Amiens
            boundingSphere =new BoundingSphere(Cartesian3.fromDegrees(2.3000000, 49.9000000, 0), 1);
            var frustumCulling = new FrustumCulling(boundingSphere ,cullingVolume.planes);
            expect(frustumCulling.computeVisibility()).to.equal('outside');
            //expect(cullingVolume.computeVisibility(boundingSphere)).to.equal(Intersect.OUTSIDE);

        });


        it("should Return Outside because the frustum volume contains eiffel tower and the bounding volume is Notre dame cathedral ", function () {
            //camera over eiffel tower

            var cameraPosition =  new Cartesian3(4201066.487126744, 168707.26382428885, 4780461.58271226);
            var cameraDirection = new Cartesian3 (-0.6573812297005188, -0.026409280358732495, -0.7530952587477657);
            var cameraUp = new Cartesian3(-0.7526059850023485, -0.027214731613048212, 0.6579084964652763);

            var frustum = new PerspectiveFrustum();
            frustum.aspectRatio = 1.98;
            frustum.fov = Math.PI_OVER_THREE;



            var cullingVolume = frustum.computeCullingVolume(cameraPosition, cameraDirection, cameraUp);
            //bounding box over the eiffel tower
            var boundingSphere =new BoundingSphere(Cartesian3.fromDegrees(0, 51, 0), 1);
            var frustumCulling = new FrustumCulling(boundingSphere ,cullingVolume.planes);
            expect(frustumCulling.computeVisibility()).to.equal('outside');
            //expect(cullingVolume.computeVisibility(boundingSphere)).to.equal(Intersect.OUTSIDE);

        });


    });

    });
