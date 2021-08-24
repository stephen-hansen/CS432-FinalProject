class OBJLoader extends glObject { 
   constructor(fname, texture){
      super(texture);

      this.vPositions = [];
      this.vNormals = [];
      this.vTexs = [];
      this.loadVertices(fname);
	  this.numVertices = this.vPositions.length;
	  this.bindVertices();
   }
   loadVertices(fname) {
      var obj_file = loadFileAJAX(fname);
      var lines = obj_file.split('\n');
	  var vertices = [];
	  var vnormals = [];
	  var vtxtures = [];

      for (var line = 0; line < lines.length; line++) {
         var strings = lines[line].trimRight().split(/[ ]+/);

         switch(strings[0]) {
            case('v'):
               var vertex = vec4(parseFloat(strings[1]), parseFloat(strings[2]), parseFloat(strings[3]), 1.0);
               vertices.push(vertex);
               break;
			case('vn'):
               var normal = vec3(parseFloat(strings[1]), parseFloat(strings[2]), parseFloat(strings[3]));
               vnormals.push(normal);
               break;
			case('vt'):
               var txture = vec2(parseFloat(strings[1]), parseFloat(strings[2]));
               vtxtures.push(txture);
               break;
            case('f'):
			   var nStrings = strings.length - 1;
			   // https://stackoverflow.com/questions/23723993/converting-quadriladerals-in-an-obj-file-into-triangles
				  for (var i = 2; i < strings.length - 1; i++) {
				     var pos1 = strings[1].split('/');
				     var pos2 = strings[i].split('/');
				     var pos3 = strings[i+1].split('/');
				     var a = vertices[parseInt(pos1[0])-1];
				     var b = vertices[parseInt(pos2[0])-1];
				     var c = vertices[parseInt(pos3[0])-1];
				     var N = normalize(cross(subtract(vec3(b[0],b[1],b[2]),vec3(a[0],a[1],a[2])), subtract(vec3(c[0],c[1],c[2]),vec3(a[0],a[1],a[2]))));
				     this.vPositions.push(a);
				     this.vTexs.push(vtxtures[parseInt(pos1[1])-1]);
				     if (pos1.length == 3) {
					    this.vNormals.push(vnormals[parseInt(pos1[2])-1]);
				     } else {
					    this.vNormals.push(N);
				     }
				     this.vPositions.push(b);
				     this.vTexs.push(vtxtures[parseInt(pos2[1])-1]);
				     if (pos2.length == 3) {
					    this.vNormals.push(vnormals[parseInt(pos2[2])-1]);
				     } else {
					    this.vNormals.push(N);
				     }
				     this.vPositions.push(c);
				     this.vTexs.push(vtxtures[parseInt(pos3[1])-1]);
				     if (pos3.length == 3) {
					    this.vNormals.push(vnormals[parseInt(pos3[2])-1]);
				     } else {
					    this.vNormals.push(N);
				     }
			     }
               break;
         }
      }
   }
}
