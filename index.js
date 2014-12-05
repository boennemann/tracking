'use strict'

var $ = require('jquery')
var tracking = require('tracking')

window.onload = function() {
  document.getElementById( "fileLoader1" ).addEventListener( "change", function() {
    $( '#image1' ).attr( 'src', document.getElementById( "fileLoader1" ).files[0].name );
  } );

  document.getElementById( "fileLoader2" ).addEventListener( "change", function() {
    $( '#image2' ).attr( 'src', document.getElementById( "fileLoader2" ).files[0].name );
  } );

  var width = 393;
  var height = 295;
  var canvas = document.getElementById( 'canvas' );
  var context = canvas.getContext( '2d' );

  var image1 = document.getElementById( 'image1' );
  var image2 = document.getElementById( 'image2' );

  window.descriptorLength = 256;
  window.matchesShown = 30;
  window.blurRadius = 3;

  var doMatch = function() {
    tracking.Brief.N = window.descriptorLength;

    context.drawImage( image1, 0, 0, width, height );
    context.drawImage( image2, width, 0, width, height );

    var imageData1 = context.getImageData( 0, 0, width, height );
    var imageData2 = context.getImageData( width, 0, width, height );

    var gray1 = tracking.Image.grayscale( tracking.Image.blur( imageData1.data, width, height, blurRadius ), width, height );
    var gray2 = tracking.Image.grayscale( tracking.Image.blur( imageData2.data, width, height, blurRadius ), width, height );

    var corners1 = tracking.Fast.findCorners( gray1, width, height );
    var corners2 = tracking.Fast.findCorners( gray2, width, height );

    var descriptors1 = tracking.Brief.getDescriptors( gray1, width, corners1 );
    var descriptors2 = tracking.Brief.getDescriptors( gray2, width, corners2 );

    var matches = tracking.Brief.reciprocalMatch( corners1, descriptors1, corners2, descriptors2 );

    matches.sort( function( a, b ) {
      return b.confidence - a.confidence;
    } );

    for( var i = 0; i < Math.min( window.matchesShown, matches.length ); i++ ) {
      var color = '#' + Math.floor( Math.random() * 16777215 ).toString( 16 );
      context.fillStyle = color;
      context.strokeStyle = color;
      context.fillRect( matches[i].keypoint1[0], matches[i].keypoint1[1], 4, 4 );
      context.fillRect( matches[i].keypoint2[0] + width, matches[i].keypoint2[1], 4, 4 );

      context.beginPath();
      context.moveTo( matches[i].keypoint1[0], matches[i].keypoint1[1] );
      context.lineTo( matches[i].keypoint2[0] + width, matches[i].keypoint2[1] );
      context.stroke();

    }
  };
  $( '#doMatchButton' ).click( doMatch );

  doMatch();
}
