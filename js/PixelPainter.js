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
  var fillQueue = [];
  var currentColor = 'black';
  var currentTool = 'pencil';
  var mouseIsDown = false;

  var tools = {
    pencil: 'pencil',
    fill: 'fill'
  };
  var colors = {
    red: '#FF0000',
    orange: '#FFA500',
    yellow: '#FFE000',
    green: '#3CB371',
    blue: '#4169E1',
    purple: '#483D8B',
    black: '#000000',
    white: '#FFFFFF',
    pink: '#FFC0CB',
    peach: '#FFDAB9',
    lightyellow: 'FFF8DC',
    lightgreen: '#90EE90',
    lightblue: '#00BFFF',
    lightpurple: '#9370DB',
    brown: '#8B4513',
    tan: '#CD853F'
  };

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

  };

  module.saveData = function(){
    var dataArray =[];
    pixelData = document.body.querySelectorAll('.pixCell');
    for(var i = 0; i < pixelData.length; i++){
      dataArray.push(pixelData[i].style.backgroundColor);
    }
    localStorage.setItem('pixStorage',JSON.stringify(dataArray)); // this saves data to local storage
  };

  module.getData = function(){
    var data = JSON.parse(localStorage.getItem('pixStorage'));
    console.log("getdata",data);
    console.log(data);
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
    clearButton.innerHTML = '🗙';
    controlsDiv.appendChild(clearButton);

    saveButton.addEventListener('click', module.saveData);
    saveButton.innerHTML = '💾';
    controlsDiv.appendChild(saveButton);

    fetchButton.addEventListener('click', module.getData);
    fetchButton.innerHTML = '🗁';
    controlsDiv.appendChild(fetchButton);

    pencilButton.addEventListener('click', module.setPencil);
    pencilButton.innerHTML = '🖉';
    controlsDiv.appendChild(pencilButton);

    fillButton.addEventListener('click', module.setFill);
    fillButton.innerHTML = '🌢';
    controlsDiv.appendChild(fillButton);

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
  };

  module.initialize();

  return module;
}

var pp = pixelPainter(64, 64);