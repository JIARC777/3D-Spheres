//"use strict";

var canvas;
var gl;

var numTimesToSubdivide = 4;

var index = 0;
//defining indicies per shape
var index1;
var pointsArray = [];
var startCubeIndex;
var normalsArray = [];

//Defining the camera Parameters
//These variables get added to the at vector to control where the at vector where the camera is looking
//determines the amount by which the camera strafes to the side;
var strafeSide = 0;
// determines the amount by which the camera strafes forward/backwards
var strafeFront = 0;
// determine the amount by which you fly up and down
var strafeUp = 0;
//Radius is what controls how close the camera is to its lookAt Location - distance controls sensitivity;
var radius = 30;
// theta determines amount of side to side rotation
var theta = 0;
// phi determines rotation amount of up/down rotation
var phi = 0;

// Perspective camera parameters
var far =  350;
var near = 3;
var fov = 45;
var width = 16;
var height = 9;
var aspect = width/height;
// camera up vector
var up = vec3(0.0, 1.0, 0.0);
//This value determines how much every value is incremented after a given keystroke event
var incrementFactor = 0.75;
var angleIncrement = 0.04;


//Lighting data
var lightPosition = vec4(0, 1, 0, 1);
var lightAmbient = vec4(0.2,0.2,0.2,1);
var intensity = 50;
var r = 255;
var g = 255;
var b = 255;
//Material Data
// "Room" Material
var rAmbient = vec4( 0.0, 0.0, 0.0, 1.0 );
var rDiffuse = vec4( 0.25, 0.25, 0.25, 1.0);
var rSpecular = vec4( 0.5, 0.5, 0.5, 1.0 );
var rShininess = 30.0;
//Sphere 1 Material
var s1Ambient = vec4(0.1, 0.1, 0.1, 1.0 );
var s1Diffuse = vec4( 0.0, 0.4, 0.6, 1.0);
var s1Specular = vec4( 0.5, 0.5, 0.5, 1.0 );
var s1Shininess = 50.0;
// Sphere 2 Material
var s2Ambient = vec4(0.1, 0.1, 0.1, 1.0 );
var s2Diffuse = vec4( 0.3, 0.7, 0.2, 1.0);
var s2Specular = vec4( 0.5, 0.5, 0.5, 1.0 );
var s2Shininess = 50.0;
// Sphere 3 Material
var s3Ambient = vec4(0.1, 0.1, 0.1, 1.0 );
var s3Diffuse = vec4( 0.7, 0.4, 0.2, 1.0);
var s3Specular = vec4( 0.5, 0.5, 0.5, 1.0 );
var s3Shininess = 50.0;
// Sphere 4 Material
var s4Ambient = vec4(0.1, 0.1, 0.1, 1.0 );
var s4Diffuse = vec4( 0.7, 0.3, 0.8, 1.0);
var s4Specular = vec4( 0.5, 0.5, 0.5, 1.0 );
var s4Shininess = 50.0;

//Transformation Variables
var rotTheta = 0;

// Matricies
var rScaleMat;
var s1ScaleMat;
var s1TransMat;
var s1RotMat;
var s2ScaleMat;
var s2TransMat;
var s2RotMat;
var s3ScaleMat;
var s3TransMat;
var s3RotMat;
var s4ScaleMat;
var s4TransMat;
var s4RotMat;

var modelViewMatrix;
var projectionMatrix = perspective(fov, aspect, near, far);

var roomShader;
var sphere1Shader;
var sphere2Shader;
var sphere3Shader;
var sphere4Shader;
var lightSphereShader;

//Sphere vertex data
var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

// Cube Vertex data
var vertices = [
    vec4( -4, -4,  4, 1.0 ),
    vec4( -4,  4,  4, 1.0 ),
    vec4(  4,  4,  4, 1.0 ),
    vec4(  4, -4,  4, 1.0 ),
    vec4( -4, -4, -4, 1.0 ),
    vec4( -4,  4, -4, 1.0 ),
    vec4(  4,  4, -4, 1.0 ),
    vec4(  4, -4, -4, 1.0 )
];
var colors = [
  vec3(0.0, 0.0, 1.0),
  vec3(1.0, 0.0, 0.0),
  vec3(1.0, 1.0, 0.0),
  vec3(0.0, 0.0, 0.0)
];

// Generate Cube
function colorCube()
{
    quad( 1, 0, 3, 2);
    quad( 2, 3, 7, 6);
    quad( 3, 0, 4, 7);
    quad( 6, 5, 1, 2);
    quad( 4, 5, 6, 7);
    quad( 5, 4, 0, 1);
}
function quad(a, b, c, d) {
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    var normalInv = vec4(normal[0]* -1, normal[1]* -1, normal[2]* -1, 0);
    var indices = [ a, b, c, a, c, d ];
    for ( var i = 0; i < indices.length; ++i ) {
        pointsArray.push( vertices[indices[i]]);
        normalsArray.push(normalInv);
        index++;
    }
}
// Generate Sphere
function triangle(a, b, c) {
     pointsArray.push(a);
     pointsArray.push(b);
     pointsArray.push(c);
	   normalsArray.push(vec4(a[0],a[1], a[2], 0.0));
     normalsArray.push(vec4(b[0],b[1], b[2], 0.0));
     normalsArray.push(vec4(c[0],c[1], c[2], 0.0));
     index += 3;
}
function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {

        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else {
        triangle( a, b, c );
    }
}
function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    // Define shader
    roomShader = initShaders( gl, "roomV-shader", "roomF-shader" );
    sphere1Shader = initShaders(gl, "sphere1V-shader", "sphere1F-shader" );
    sphere2Shader = initShaders(gl, "sphere2V-shader", "sphere2F-shader" );
    sphere3Shader = initShaders(gl, "sphere3V-shader", "sphere3F-shader" );
    sphere4Shader = initShaders(gl, "sphere4V-shader", "sphere4F-shader" );
    lightSphereShader = initShaders(gl, "lightSphere-vShader", "lightSphere-fShader" );
    // Generate Geometry
  	//Create the "room" cube
    colorCube();
  	index1 = index;
  	//create the first sphere
 	  tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    // pass the position attribute to every shader
    var RvPosition = gl.getAttribLocation( roomShader, "vPosition");
    gl.vertexAttribPointer(RvPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(RvPosition);

  	var S1vPosition = gl.getAttribLocation( sphere1Shader, "vPosition");
    gl.vertexAttribPointer(S1vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(S1vPosition);

    var S2vPosition = gl.getAttribLocation( sphere2Shader, "vPosition" );
    gl.vertexAttribPointer( S2vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( S2vPosition );

    var S3vPosition = gl.getAttribLocation( sphere3Shader, "vPosition" );
    gl.vertexAttribPointer( S3vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( S3vPosition );

    var S4vPosition = gl.getAttribLocation( sphere4Shader, "vPosition" );
    gl.vertexAttribPointer( S4vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( S4vPosition );

    var LSvPosition = gl.getAttribLocation( lightSphereShader, "vPosition" );
    gl.vertexAttribPointer( LSvPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( LSvPosition );

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    //pass the normal attribute to every shader
  	var RvNormal = gl.getAttribLocation( roomShader, "vNormal" );
    gl.vertexAttribPointer( RvNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( RvNormal );

  	var S1vNormal = gl.getAttribLocation( sphere1Shader, "vNormal" );
    gl.vertexAttribPointer( S1vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( S1vNormal );

    var S2vNormal = gl.getAttribLocation( sphere2Shader, "vNormal" );
    gl.vertexAttribPointer( S2vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( S2vNormal );

    var S3vNormal = gl.getAttribLocation( sphere3Shader, "vNormal" );
    gl.vertexAttribPointer( S3vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( S3vNormal );

    var S4vNormal = gl.getAttribLocation( sphere4Shader, "vNormal" );
    gl.vertexAttribPointer( S4vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( S4vNormal );

    //Controls
    window.addEventListener("keydown", function() {
      switch (event.keyCode) {
        // Camera Controls
        case 87: // w key
          strafeFront += incrementFactor;
          break;
        case 83: // s key
          strafeFront -= incrementFactor;
          break;
       case 65: // a key
          strafeSide +=incrementFactor;
          break;
        case 68: // d key
          strafeSide -= incrementFactor;
          break;
        case 32: // space key
          strafeUp += incrementFactor;
          break;
        case 67: // c key
          strafeUp -= incrementFactor;
          break;
        case 39: // > key
          theta -= angleIncrement;
          break;
        case 37: // < key
          theta += angleIncrement;
          break;
        case 38: // ^ key
          phi += angleIncrement;
          break;
        case 40: // v key
          phi -= angleIncrement;
          break;
        // Lighting controls (color)
        case 49: // 1 key
          if (intensity > 0) { intensity--; }
          break;
        case 50: //2 key
          if (intensity < 100) { intensity++; }
          break;
        case 51: // 3 key
          if (r > 0) { r--; }
          break;
        case 52: // 4 key
          if (r < 255) { r++; }
          break;
        case 53: // 5 key
          if (g > 0) { g--; }
          break;
        case 54: // 6 key
          if (g < 255) { g++; }
          break;
        case 55: // 7 key
          if (b > 0) { b--; }
          break;
        case 56: // 8 key
          if (b < 255) { b++; }
          break;
        // Lighting controls (position)
        case 85: // U key
          lightPosition[1] += incrementFactor;
          break;
        case 74: // J key
          lightPosition[1] -= incrementFactor;
          break;
        case 72: // H key
          lightPosition[0] += incrementFactor;
          break;
        case 75: // K key
          lightPosition[0] -= incrementFactor;
          break;
        case 79: // O key
          lightPosition[2] += incrementFactor;
          break;
        case 76: // L key
          lightPosition[2] -= incrementFactor;
          break;
        }
      });
    //Define any matrices for transformations
	  //Scale for "room"
    rScaleMat = scale(30, 13, 30);
    //Transformations for spheres
	  s1ScaleMat = scale(4,4,4);
	  s1TransMat = translate(30,0,0);
    s2ScaleMat = scale(2,2,2);
	  s2TransMat = translate(40,10,0);
    s3ScaleMat = scale(7,7,7);
	  s3TransMat = translate(60,-20,0);
    s4ScaleMat = scale(3,3,3);
	  s4TransMat = translate(50,5,0);

	 // configure texture
	 var sphereTex = document.getElementById("Tex");
	 sphereTex.crossOrigin = "";
    // send texture to shaders
    configureTexture(sphere1Shader,sphereTex);
	configureTexture(sphere2Shader,sphereTex);
    configureTexture(sphere3Shader,sphereTex);
	configureTexture(sphere4Shader,sphereTex);

    render();
}

function configureTexture(shader, image ) {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image );
	if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
		gl.generateMipmap( gl.TEXTURE_2D );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
						  gl.NEAREST_MIPMAP_LINEAR );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
	}else{
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	}
	gl.useProgram(shader);
	gl.uniform1i(gl.getUniformLocation(shader, "texture"), 0);

}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}

function realTimeLighting() {
  // calculate light for each object based on user parameters for lighting calculations
  var lightDiffuse = vec4((r/255)*(intensity/100), (g/255)*(intensity/100), (b/255)*(intensity/100), 1.0);
  var lightSpecular = vec4(0.25+ 0.75*lightDiffuse[0], 0.25 + 0.75*lightDiffuse[1], 0.25 + 0.75*lightDiffuse[2], 1.0 );
  document.getElementById("lValues").innerHTML = "Lighting: Color Data | Intensity: " + intensity + "/100 | Red: " + r + "/255 | Green: " + g + "/255 | Blue: " + b + "/255";
  document.getElementById("lightPos").innerHTML = "Lighting: Position Data | X Position: " + lightPosition[0] + " | Y Position " + lightPosition[1] + " | Z Position " + lightPosition[2];

  gl.useProgram(roomShader);
  ambientProduct = mult(lightAmbient, rAmbient);
  diffuseProduct = mult(lightDiffuse, rDiffuse);
  specularProduct = mult(lightSpecular, rSpecular);

  gl.uniform4fv(gl.getUniformLocation(roomShader, "lightPosition"), flatten(lightPosition))
  gl.uniform4fv(gl.getUniformLocation(roomShader, "ambientProduct"), flatten(ambientProduct));
  gl.uniform4fv(gl.getUniformLocation(roomShader, "diffuseProduct"), flatten(diffuseProduct) );
  gl.uniform4fv(gl.getUniformLocation(roomShader, "specularProduct"), flatten(specularProduct) );
  gl.uniform1f(gl.getUniformLocation(roomShader, "shininess"), rShininess);

  gl.useProgram(sphere1Shader);
  ambientProduct = mult(lightAmbient, s1Ambient);
  diffuseProduct = mult(lightDiffuse, s1Diffuse);
  specularProduct = mult(lightSpecular, s1Specular);

  gl.uniform4fv(gl.getUniformLocation(sphere1Shader, "lightPosition"), flatten(lightPosition));
  gl.uniform4fv(gl.getUniformLocation(sphere1Shader, "ambientProduct"), flatten(ambientProduct));
  gl.uniform4fv(gl.getUniformLocation(sphere1Shader, "diffuseProduct"), flatten(diffuseProduct));
  gl.uniform4fv(gl.getUniformLocation(sphere1Shader, "specularProduct"), flatten(specularProduct));
  gl.uniform1f(gl.getUniformLocation(sphere1Shader, "shininess"), s1Shininess);

  gl.useProgram(sphere2Shader);
  ambientProduct = mult(lightAmbient, s2Ambient);
  diffuseProduct = mult(lightDiffuse, s2Diffuse);
  specularProduct = mult(lightSpecular, s2Specular);

  gl.uniform4fv(gl.getUniformLocation(sphere2Shader, "lightPosition"), flatten(lightPosition));
  gl.uniform4fv(gl.getUniformLocation(sphere2Shader, "ambientProduct"), flatten(ambientProduct));
  gl.uniform4fv(gl.getUniformLocation(sphere2Shader, "diffuseProduct"), flatten(diffuseProduct) );
  gl.uniform4fv(gl.getUniformLocation(sphere2Shader, "specularProduct"), flatten(specularProduct) );
  gl.uniform1f(gl.getUniformLocation(sphere2Shader, "shininess"), s2Shininess);

  gl.useProgram(sphere3Shader);
  ambientProduct = mult(lightAmbient, s3Ambient);
  diffuseProduct = mult(lightDiffuse, s3Diffuse);
  specularProduct = mult(lightSpecular, s3Specular);

  gl.uniform4fv(gl.getUniformLocation(sphere3Shader, "lightPosition"), flatten(lightPosition));
  gl.uniform4fv(gl.getUniformLocation(sphere3Shader, "ambientProduct"), flatten(ambientProduct));
  gl.uniform4fv(gl.getUniformLocation(sphere3Shader, "diffuseProduct"), flatten(diffuseProduct) );
  gl.uniform4fv(gl.getUniformLocation(sphere3Shader, "specularProduct"), flatten(specularProduct) );
  gl.uniform1f(gl.getUniformLocation(sphere3Shader, "shininess"), s3Shininess);

  gl.useProgram(sphere4Shader);
  ambientProduct = mult(lightAmbient, s4Ambient);
  diffuseProduct = mult(lightDiffuse, s4Diffuse);
  specularProduct = mult(lightSpecular, s4Specular);

  gl.uniform4fv(gl.getUniformLocation(sphere4Shader, "lightPosition"), flatten(lightPosition));
  gl.uniform4fv(gl.getUniformLocation(sphere4Shader, "ambientProduct"), flatten(ambientProduct));
  gl.uniform4fv(gl.getUniformLocation(sphere4Shader, "diffuseProduct"), flatten(diffuseProduct) );
  gl.uniform4fv(gl.getUniformLocation(sphere4Shader, "specularProduct"), flatten(specularProduct) );
  gl.uniform1f(gl.getUniformLocation(sphere4Shader, "shininess"), s4Shininess);

  // Pass the light sphere an approximation of the light being emitted (specular factor)
  gl.useProgram(lightSphereShader)
  gl.uniform4fv(gl.getUniformLocation(lightSphereShader, "fColor"),flatten(lightSpecular))
}

function render(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    rotTheta += 20 * angleIncrement;
	  if(theta > 2*3.14 || theta < -2*3.14) {
		  theta = 0;
	  }
    var psi = 3.14/2+theta;
    //calculate camera vectors
  	var at = vec3(strafeSide*Math.sin(psi) + radius*Math.sin(theta) + strafeFront*Math.sin(theta), strafeUp + radius*Math.sin(phi), radius*Math.cos(theta) + strafeSide*Math.cos(psi) + strafeFront*Math.cos(theta));
    var eye = vec3(strafeSide*Math.sin(psi) + strafeFront*Math.sin(theta) , strafeUp, strafeSide*Math.cos(psi) + strafeFront*Math.cos(theta));
    // Update light Position based on view Matrix
    // Calculate Lighting
    realTimeLighting();

	  gl.useProgram( roomShader );
    modelViewMatrix = mult(lookAt( eye, at, up ), rScaleMat);
    projectionMatrix = perspective(fov, aspect, near, far);
    gl.uniform3fv(gl.getUniformLocation(roomShader, "eyePos"), flatten(eye));
    gl.uniformMatrix4fv(gl.getUniformLocation(roomShader,"transformMatrix"), false, flatten(rScaleMat));
    gl.uniformMatrix4fv(gl.getUniformLocation(roomShader,"modelViewMatrix"), false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv( gl.getUniformLocation(roomShader, "projectionMatrix"), false, flatten(projectionMatrix));
    //Generate cube faces
    for (var i = 0; i < index1; i+=3) {
         gl.drawArrays( gl.TRIANGLES, i, 3 );
    }

  	gl.useProgram( sphere1Shader );
    s1RotMat = rotate( -rotTheta, vec3(0, 1, 0));
    var transformMat1 =  mult(s1RotMat, mult(s1TransMat, s1ScaleMat))
    modelViewMatrix = mult(lookAt( eye, at, up ), transformMat1);
    // send Matrices to vertex shader
    gl.uniform3fv(gl.getUniformLocation(sphere1Shader, "eyePos"), flatten(eye));
    gl.uniformMatrix4fv(gl.getUniformLocation(sphere1Shader,"transformMatrix"), false, flatten(transformMat1));
    gl.uniformMatrix4fv(gl.getUniformLocation(sphere1Shader,"modelViewMatrix"), false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv( gl.getUniformLocation(sphere1Shader, "projectionMatrix"), false, flatten(projectionMatrix));
	  for (var i = index1; i < index; i+=3) {
         gl.drawArrays( gl.TRIANGLES, i, 3 );
    }

    gl.useProgram( sphere2Shader );
    s2RotMat = rotate( 2*rotTheta, vec3(0, 1, 0));
    var transformMat2 = mult(s2RotMat, mult(s2TransMat, s2ScaleMat))
    modelViewMatrix = mult(lookAt( eye, at, up ), transformMat2);
    // send Matrices to vertex shader
    gl.uniform3fv(gl.getUniformLocation(sphere2Shader, "eyePos"), flatten(eye));
    gl.uniformMatrix4fv(gl.getUniformLocation(sphere2Shader,"transformMatrix"), false, flatten(transformMat2));
    gl.uniformMatrix4fv(gl.getUniformLocation(sphere2Shader,"modelViewMatrix"), false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv( gl.getUniformLocation(sphere2Shader, "projectionMatrix"), false, flatten(projectionMatrix));
	  for (var i = index1; i < index; i+=3) {
         gl.drawArrays( gl.TRIANGLES, i, 3 );
    }

    gl.useProgram( sphere3Shader );
    s3RotMat = rotate( 0.4*rotTheta, vec3(0, 1, 0));
    var transformMat3 = mult(s3RotMat, mult(s3TransMat, s3ScaleMat));
    modelViewMatrix = mult(lookAt( eye, at, up ), transformMat3);
    // send Matrices to vertex shader;
    gl.uniform3fv(gl.getUniformLocation(sphere3Shader, "eyePos"), flatten(eye));
    gl.uniformMatrix4fv(gl.getUniformLocation(sphere3Shader,"transformMatrix"), false, flatten(transformMat3));
    gl.uniformMatrix4fv(gl.getUniformLocation(sphere3Shader,"modelViewMatrix"), false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv( gl.getUniformLocation(sphere3Shader, "projectionMatrix"), false, flatten(projectionMatrix));
	  for (var i = index1; i < index; i+=3) {
         gl.drawArrays( gl.TRIANGLES, i, 3 );
    }
    gl.useProgram( sphere4Shader );
    s4RotMat = rotate( 1.25*rotTheta, vec3(0, 1, 0));
    var transformMat4 = mult(s4RotMat, mult(s4TransMat, s4ScaleMat));
    modelViewMatrix = mult(lookAt( eye, at, up ), transformMat4);
    // send Matrices to vertex shader;
    gl.uniform3fv(gl.getUniformLocation(sphere4Shader, "eyePos"), flatten(eye));
    gl.uniformMatrix4fv(gl.getUniformLocation(sphere4Shader,"transformMatrix"), false, flatten(transformMat4));
    gl.uniformMatrix4fv(gl.getUniformLocation(sphere4Shader,"modelViewMatrix"), false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv( gl.getUniformLocation(sphere4Shader, "projectionMatrix"), false, flatten(projectionMatrix));
	  for (var i = index1; i < index; i+=3) {
         gl.drawArrays( gl.TRIANGLES, i, 3 );
    }

    gl.useProgram( lightSphereShader );
    var spherePosition = translate(lightPosition[0], lightPosition[1], lightPosition[2]);
    modelViewMatrix = mult(lookAt( eye, at, up ), spherePosition);
    gl.uniformMatrix4fv(gl.getUniformLocation(lightSphereShader,"modelViewMatrix"), false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv( gl.getUniformLocation(lightSphereShader, "projectionMatrix"), false, flatten(projectionMatrix));
    for (var i = index1; i < index; i+=3) {
         gl.drawArrays( gl.TRIANGLES, i, 3 );
    }
    window.requestAnimFrame(render);
}
