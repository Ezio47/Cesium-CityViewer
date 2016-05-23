var collada2gltf = require('collada2gltf');

function convertColladaToglTF(filePath)
{

	//convert the dae file to gltf
	this.convert = function()
	{
		collada2gltf(filePath, {path: '../../glTF/COLLADA2GLTF/bin'},function(err){
			console.log(err);
		});
	};
};
module.exports = convertColladaToglTF;