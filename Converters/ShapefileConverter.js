const fs = require('fs');
var spawnSync = require('spawn-sync');




function ShapefileConverter (filePath,destination)
{
	this.process = null ;
	//convert file using gdal on command line by creating a child process
	this.convert = function ()
	{
		this.process = spawnSync('ogr2ogr', [
		  '-f', 'GeoJSON',
		  destination , filePath]
		);

		return this.process
	};


}

module.exports = ShapefileConverter;