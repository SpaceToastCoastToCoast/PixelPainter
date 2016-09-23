/*
*  PixelPainter creates a canvas that can be painted on.
* @param {Number} width  --> Width of the canvas, in number of cells
* @param {Number} height --> Height of the canvas, in number of cells
*/

function pixelPainter(width, height) {
  var module = {};
  var ppDiv = document.getElementById('pixelPainter');
  var ppCanvas = document.createElement('div');
  var pixelSize = 8;
  var colorDiv = document.createElement('div');
  var controlsDiv = document.createElement('div');
  var currentColorDisplay = document.createElement('div');
  var swatchSize = 16;
  var clearButton = document.createElement('button');
  var saveButton = document.createElement('button');
  var fetchButton = document.createElement('button');
  var pencilButton = document.createElement('button');
  var fillButton = document.createElement('button');
  var shareButton = document.createElement('button');
  var fillQueue = [];
  var currentColor = 'black';
  var currentTool = 'pencil';
  var mouseIsDown = false;

  var tools = {
    pencil: 'pencil',
    fill: 'fill'
  };
  var colors = {
    red: 'rgb(255, 0, 0)',
    orange: 'rgb(255, 165, 0)',
    yellow: 'rgb(255, 224, 0)',
    green: 'rgb(60, 179, 113)',
    blue: 'rgb(65, 105, 225)',
    purple: 'rgb(72, 61, 139)',
    black: 'rgb(0, 0, 0)',
    white: 'rgb(255, 255, 255)',
    pink: 'rgb(255, 192, 203)',
    peach: 'rgb(255, 218, 185)',
    lightyellow: 'rgb(255, 248, 0)',
    lightgreen: 'rgb(144, 238, 144)',
    lightblue: 'rgb(0, 191, 255)',
    lightpurple: 'rgb(147, 112, 219)',
    brown: 'rgb(139, 69, 19)',
    tan: 'rgb(205, 133, 63)'
  };
  var colorsToArray = Object.keys(colors).map(function(key) {
    return colors[key];
  });

  module.clearCanvas = function(){
    var matches = document.body.querySelectorAll('.pixCell');
    for(var i = 0; i < matches.length; i++){
      matches[i].style.backgroundColor = colors.white;
    }
  };

  module.changeColor = function(e) {
    mouseIsDown = true;
    e.target.style.backgroundColor = currentColor;
  };

  module.changeColorContinuous = function(e) {
    if(mouseIsDown) {
      e.target.style.backgroundColor = currentColor;
    }
  };

  module.storeColor = function(e){
    currentColor = e.target.style.backgroundColor;
    currentColorDisplay.innerHTML = currentColor;
    currentColorDisplay.style.backgroundColor = currentColor;
  };

  module.setPencil = function() {
    currentTool = tools.pencil;
  };

  module.setFill = function() {
    currentTool = tools.fill;
    var cellQuery = document.body.querySelectorAll('.pixCell');
    for(var y = 0; y < height; y++) {
      var row = [];
      for(var x = 0; x < width; x++) {
        row.push(cellQuery[x + (y * height)]);
      }
      fillQueue.push(row);
    }
  };

  module.fill = function(e) {
    if(currentTool != tools.fill) {
      return;
    }
    var targetColor = e.target.style.backgroundColor;
    if(targetColor === currentColor) {
      return;
    }
    var node = fillQueue[parseInt(e.target.dataY)][parseInt(e.target.dataX)];
    var queue = [];
    var n = null;
    var east, west, north, south;
    queue.push(node);
    while(queue.length > 0) {
      n = queue[0];
      queue.shift();
      if(n.style.backgroundColor === currentColor) {
        continue;
      }
      if(n.style.backgroundColor === targetColor) {
        n.style.backgroundColor = currentColor;
        n.dataProcessed = true;
        west = fillQueue[n.dataY][parseInt(n.dataX) - 1];
        east = fillQueue[n.dataY][parseInt(n.dataX) + 1];
        if(west !== undefined && !west.dataProcessed) {
          west.dataProcessed = true;
          queue.push(west); //west
        }
        if(east !== undefined && !east.dataProcessed) {
          east.dataProcessed = true;
          queue.push(east); //east
        }
        if(parseInt(n.dataY) > 0) {
          north = fillQueue[parseInt(n.dataY) - 1][n.dataX];
          if(north !== undefined && !north.dataProcessed) {
            north.dataProcessed = true;
            queue.push(north); //north
          }
        }
        if(parseInt(n.dataY) < (height - 1)) {
          south = fillQueue[parseInt(n.dataY) + 1][n.dataX];
          if(south !== undefined && !south.dataProcessed) {
            south.dataProcessed = true;
            queue.push(south); //south
          }
        }
      }
    }
    //reset all processed bits to false
    var canvasList = document.body.querySelectorAll('.pixCell');
    for(var l in canvasList) {
      canvasList[l].dataProcessed = false;
    }
  };

  module.saveData = function(){
    var dataArray =[];
    pixelData = document.body.querySelectorAll('.pixCell');
    for(var i = 0; i < pixelData.length; i++){
      dataArray.push(pixelData[i].style.backgroundColor);
    }
    localStorage.setItem('pixStorage',JSON.stringify(dataArray)); // this saves data to local storage
  };

  module.sharePicture = function(){
    module.saveData();
    var data = JSON.parse(localStorage.getItem('pixStorage'));
    var parsedData = data.map(function(pixelColor) {
      return colorsToArray.indexOf(pixelColor).toString(16);
    });
    //now we reduce the parsed data into a string
    window.location.hash = module.encode(parsedData.join(''));
  };

  module.encode = function(input) {
    var encoding = [];
    var prev, count, i;
    for(count = 1, prev = input[0], i = 1; i < input.length; i++) {
      if(input[i] != prev) {
        //count and value are separated by H
        encoding.push([count,prev].join('H'));
        count = 1;
        prev = input[i];
      } else {
        count++;
      }
    }
    encoding.push([count, prev].join('H'));
    //runlines are saparated by G
    var encodedStr = encoding.join('G');
    return encodedStr;
  };

  module.decode = function(encoded) {
    var output = [];
    firstSplit = encoded.slice(1).split('G');
    firstSplit.forEach(function(node) {
      var pair = node.split('H');
      for(var i = 0; i < pair[0]; i++) {
        output.push (pair[1]);
      }
    });
    var indexedToColors = output.map(function(colorIndex) {
      return colorsToArray[parseInt(colorIndex, 16)];
    });
    var matches = document.body.querySelectorAll('.pixCell');
    for(var i = 0; i < matches.length; i++){
      matches[i].style.backgroundColor = indexedToColors[i];
    }
    return output;
  };

  module.getData = function(){
    var data = JSON.parse(localStorage.getItem('pixStorage'));
    var matches = document.body.querySelectorAll('.pixCell');
    for(var i = 0; i < matches.length; i++){
      matches[i].style.backgroundColor = data[i];
    }
  };

  //now let's see if we can make a tool that continuously changes color
  //over different colors (i.e. rainbow lines)

  module.createCanvas = function() {
    for(var y = 0; y < height; y++) {
      for(var x = 0; x < width; x++) {
        var pixCell = document.createElement('div');
        pixCell.className = 'pixCell';
        pixCell.style.width = pixelSize;
        pixCell.style.height = pixelSize;
        pixCell.style.backgroundColor = colors.white;
        pixCell.style.left = (x * pixelSize) + 'px';
        pixCell.style.top = (y * pixelSize) + 'px';
        pixCell.dataX = x;
        pixCell.dataY = y;
        pixCell.dataProcessed = false;
        //add touch response
        pixCell.addEventListener('touchstart', module.changeColor);
        pixCell.addEventListener('touchmove', module.changeColorContinuous);
        //add mouse response
        pixCell.addEventListener('mousedown', module.fill);
        pixCell.addEventListener('mousedown', module.changeColor);
        pixCell.addEventListener('mouseover', module.changeColorContinuous);
        pixCell.addEventListener('dragover', function(evt) {
          mouseIsDown = true;
          module.changeColorContinuous(evt);
        });

        ppCanvas.appendChild(pixCell);
      }
    }
  };

  module.createColorSwatch = function() {
    for(var col in colors){
      var pixColor = document.createElement('div');
      pixColor.className = 'colorSwatch';
      pixColor.addEventListener('click', module.storeColor);
      pixColor.style.backgroundColor = colors[col];
      pixColor.style.width = swatchSize + 'px';
      pixColor.style.height = swatchSize + 'px';

      colorDiv.appendChild(pixColor);
    }
  };

  module.initialize = function() {

    ppCanvas.style.width = (width * pixelSize) + 2;
    ppCanvas.style.height = (height * pixelSize) + 2;
    ppCanvas.id = 'ppCanvas';

    colorDiv.style.width = (8 * swatchSize) + (swatchSize) + 'px';
    colorDiv.id = 'colorDiv';
    colorDiv.style.left = (parseInt(ppCanvas.style.width) + swatchSize + pixelSize) + 'px';

    controlsDiv.style.width = (8 * swatchSize) + (swatchSize) + 'px';
    controlsDiv.id = 'controlsDiv';
    controlsDiv.style.left = (parseInt(ppCanvas.style.width) + swatchSize + pixelSize) + 'px';

    currentColorDisplay.id = 'currentColorDiv';
    currentColorDisplay.innerHTML = 'color';
    currentColorDisplay.style.backgroundColor = currentColor;
    currentColorDisplay.style.height = swatchSize + 'px';

    clearButton.addEventListener('click', module.clearCanvas);
    clearButton.innerHTML = '🗙 clear';
    controlsDiv.appendChild(clearButton);

    saveButton.addEventListener('click', module.saveData);
    saveButton.innerHTML = '💾 save';
    controlsDiv.appendChild(saveButton);

    fetchButton.addEventListener('click', module.getData);
    fetchButton.innerHTML = '🗁 load';
    controlsDiv.appendChild(fetchButton);

    pencilButton.addEventListener('click', module.setPencil);
    pencilButton.innerHTML = '🖉 pen';
    controlsDiv.appendChild(pencilButton);

    fillButton.addEventListener('click', module.setFill);
    fillButton.innerHTML = '🌢 fill';
    controlsDiv.appendChild(fillButton);

    shareButton.addEventListener('click', module.sharePicture);
    shareButton.innerHTML = 'share';
    controlsDiv.appendChild(shareButton);

    //turn off continuous drawing when mouse is released
    document.addEventListener('mouseup', function() {mouseIsDown = false;});
    //same for touch
    document.addEventListener('touchend', function() {mouseIsDown = false;});
    //disable drag
    document.addEventListener('drag', function(){mouseIsDown = false;});

    module.createCanvas();
    module.createColorSwatch();
    colorDiv.appendChild(currentColorDisplay);
    colorDiv.appendChild(controlsDiv);
    ppDiv.appendChild(colorDiv);
    ppDiv.appendChild(ppCanvas);
    module.clearCanvas();
    if(window.location.hash.length > 0) {
      module.decode(window.location.hash);
    }
  };

  module.initialize();

  return module;
}

var pp = pixelPainter(32, 32);