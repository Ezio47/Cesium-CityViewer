/**
 * Created by atassi on 16/03/2016.
 */


var Regions = function (mongoose)
{
    var Schema = mongoose.Schema;
    var RegionsSchema =  new mongoose.Schema({
        min_lat : {type : Number},
        max_lat : {type : Number},
        min_long : {type : Number},
        max_long : {type : Number},
        max_height : {type : Number},
        min_height : {type : Number}
    });

    try{
        var Regions = mongoose.model('Regions');
    }
    catch(err){
        var Regions = mongoose.model('Regions', RegionsSchema);
    };



    //get all regions
    this.getRegions = function (){
        var promise = Regions.find({}) ;
        return promise ;
    };

    //add regions to database
    this.addRegions = function (regions){
        regions.forEach(function (region){
            var regionModel = new Regions({
                min_lat : region.min_lat,
                min_long : region.min_long,
                max_lat : region.max_lat,
                max_long : region.max_long
            });
            regionModel.save();
        });
    };

    //find Regions by position
    this.findRegionByPosition = function (latitude, longitude)
    {
        var promise = Regions.findOne({min_lat : {$lte : latitude} , max_lat : {$gte : latitude},
            min_long : {$lte : longitude} , max_long : {$gte : longitude} }).exec();
        return promise ;
    };


    //remove All
    this.removeAll = function ()
    {
        Regions.remove({}, function (err) {
            if(err) console.log(err);
        });

    };

}

exports = module.exports = Regions;