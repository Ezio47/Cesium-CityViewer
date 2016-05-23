/**
 * Created by atassi on 16/03/2016.
 */

var Points = function (mongoose) {
    var Schema = mongoose.Schema;

    //points data base schema
    //create or replace Points Schema
    var PointsSchema = new mongoose.Schema({
        x : {type : Number} ,
        y : {type : Number} ,
        z : {type : Number}
    });

    try{
        var Points = mongoose.model('Points');
    }
    catch(err) {
        var Points = mongoose.model('Points', PointsSchema);
    };


    //add point to database
    this.addPoint = function (point){

        //instantiate a new points model
        var point = new Points({
            x : point.x ,
            y : point.y ,
            z : point.z
        });
        //save the point in the database
        point.save();
        return point ;
    };

    //remove All
    this.removeAll = function (){
      Points.remove({}, function (err){
            if (err) console.log(err);
      });
    };

}

exports = module.exports = Points;