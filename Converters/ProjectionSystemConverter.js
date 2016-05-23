const fs = require('fs');
var spawnSync = require('spawn-sync');

function ProjectionSystemConverter (filePath,destination, format)
{
	var process = null ; 
	var formatName  ;
	
	if (format == 'shapefile')
		formatName = 'ESRI Shapefile' ;
	else if (format == 'mapinfo')
		formatName = 'MapInfo File' ;
	else
		throw 'Unknown file format ' ;	


	//convert file using gdal on command line by creating a child process
	this.convert = function (inputSrs, outputSrs)
	{
		this.process = spawnSync('ogr2ogr', [
		  '-s_srs' , inputSrs,
		  '-t_srs' , outputSrs,
		  destination , filePath]
		);

		return this.process
	};


}


module.exports = ProjectionSystemConverter;