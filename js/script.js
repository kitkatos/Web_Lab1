'use strict';

let geometry = {
  rectangle: { x: -0.5, y: 1 },
  circle:    { r: 1, quadrant: 1 },
  triangle:  { x: -0.5, y: -0.5 },
};


const QUADRANT_SIGNS = {
  1: [ 1,  1],
  2: [-1,  1],
  3: [-1, -1],
  4: [ 1, -1],
};

let currentR = 1; 

const canvas = document.getElementById('graph');
const form = document.getElementById('point-form');
const resultsBody = document.querySelector('#results-table tbody');
const radioButton = document.querySelectorAll('input[name="r"]');



let layers = ['circle', 'triangle', 'rectangle'];

let layer;

let rawGeometry = {
  rectangle: { x: -0.5, y: 1 },
  circle:    { y: 0, x: 1 },
  triangle:  { x: -0.5, y: -0.5 },
};

function init() {
  setupCanvas();

  points = loadPoints();
  renderTable();

  // Обработчики
  form.addEventListener('submit', onFormSubmit);

  document.getElementById('clear-btn').addEventListener('click', clearPoints);

  radioButton.forEach(radio => {
    radio.addEventListener('change', onRChange);
  });

  canvas.addEventListener('mousemove', onMouseMove);

  canvas.addEventListener('mousedown', onMouseDown);
}



function onRChange(event) {
  const result = validateR(event.target.value);
  if (!result.ok) return;
  currentR = result.value;
  redrawCanvasAdapter();
}

function onMouseDown(event) {
  if (layer) {
    layer = null;
    return;
  }
  const pixelX = event.offsetX;
  const pixelY = event.offsetY;

  const coordinate = pixelToMath(pixelX, pixelY);
  const currentLayer = getTopAreaAndUpdateLayers(coordinate.x, coordinate.y);
  if (!currentLayer) return;
  layer = currentLayer;
  return;
}

function onMouseMove(event) {
  if (!layer) return;
  const pixelX = event.offsetX;
  const pixelY = event.offsetY;

  const coordinate = pixelToMath(pixelX, pixelY);
  const shape = rawGeometry[layer];

  shape.x = coordinate.x;
  shape.y = coordinate.y;

  updateGeometry();

  redrawCanvasAdapter();
}

function updateGeometry() {
  if (layer == 'triangle') {
    const triangle = Math.abs(rawGeometry.triangle.x) + Math.abs(rawGeometry.triangle.y);
    const tSingX = rawGeometry.triangle.x > 0 ? 1 : -1;
    const tSingY = rawGeometry.triangle.y > 0 ? 1 : -1;
    geometry.triangle.x = triangle * tSingX;
    geometry.triangle.y = triangle * tSingY;
  } else  if (layer == "circle") {
    geometry.circle.r = Math.hypot(rawGeometry.circle.x, rawGeometry.circle.y);
    geometry.circle.quadrant = quadrantOf(rawGeometry.circle.x, rawGeometry.circle.y);
  } else {
    geometry.rectangle.x = rawGeometry.rectangle.x;
    geometry.rectangle.y = rawGeometry.rectangle.y;
  }
  return;
}

function quadrantOf(x, y) {
  if (x >= 0 && y >= 0) return 1;
  if (x <  0 && y >= 0) return 2;
  if (x <  0 && y <  0) return 3;
  return 4;
}




function redrawCanvasAdapter() {
  redrawCanvas(geometry.rectangle.x, geometry.rectangle.y,
    geometry.circle.r, geometry.circle.quadrant,
    geometry.triangle.x, geometry.triangle.y,
    currentR,
    layers
  );
}

document.addEventListener('DOMContentLoaded', init);
