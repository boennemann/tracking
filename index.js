'use strict'

var $ = require('jquery')
var tracking = require('tracking')


$(function() {

  ;['1', '2'].forEach(function(id) {
    $('#filerLoader' + id).on('change', function() {
      $('#image' + id).attr('src', $(this)[0].files[0].name)
    })
  })

  var width = 393;
  var height = 295;
  var canvas = $('#canvas')
  var ctx = canvas[0].getContext('2d')

  var image1 = $('#image1')[0]
  var image2 = $('#image2')[0]

  var descriptorLength = 256
  var matchesShown = 30
  var blurRadius = 3

  var doMatch = function() {
    tracking.Brief.N = descriptorLength;

    ctx.drawImage(image1, 0, 0, width, height)
    ctx.drawImage(image2, width, 0, width, height)

    var imageData1 = ctx.getImageData(0, 0, width, height)
    var imageData2 = ctx.getImageData(width, 0, width, height)

    var gray1 = tracking.Image.grayscale(tracking.Image.blur(imageData1.data, width, height, blurRadius ), width, height)
    var gray2 = tracking.Image.grayscale(tracking.Image.blur(imageData2.data, width, height, blurRadius ), width, height)

    var corners1 = tracking.Fast.findCorners(gray1, width, height)
    var corners2 = tracking.Fast.findCorners(gray2, width, height)

    var descriptors1 = tracking.Brief.getDescriptors(gray1, width, corners1)
    var descriptors2 = tracking.Brief.getDescriptors(gray2, width, corners2)

    var matches = tracking.Brief.reciprocalMatch(corners1, descriptors1, corners2, descriptors2)

    matches.sort(function(a, b) {
      return b.confidence - a.confidence
    })

    for(var i = 0; i < Math.min(matchesShown, matches.length); i++ ) {
      var color = '#' + Math.floor(Math.random() * 16777215).toString(16)
      ctx.fillStyle = color
      ctx.strokeStyle = color
      ctx.fillRect(matches[i].keypoint1[0], matches[i].keypoint1[1], 4, 4)
      ctx.fillRect(matches[i].keypoint2[0] + width, matches[i].keypoint2[1], 4, 4)

      ctx.beginPath();
      ctx.moveTo(matches[i].keypoint1[0], matches[i].keypoint1[1])
      ctx.lineTo(matches[i].keypoint2[0] + width, matches[i].keypoint2[1])
      ctx.stroke()
    }
  }

  $('#doMatchButton').click(doMatch)

  doMatch()
})
