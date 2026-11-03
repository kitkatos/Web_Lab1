'use strict';

const CANVAS_SIZE = 500;
const cx = Math.trunc(CANVAS_SIZE / 2) + CANVAS_SIZE % 2;
const cy = Math.trunc(CANVAS_SIZE / 2) + CANVAS_SIZE % 2;
const padding = 50;
const scale = (CANVAS_SIZE / 2 - padding);
const toX = (x) => cx + x * scale;
const toY = (y) => cy - y * scale;

const ctx = canvas.getContext('2d');

const LAYER_COLORS = [
  'rgba(80, 160, 255, 0.8)',
  'rgba(80, 160, 255, 0.6)',
  'rgba(80, 160, 255, 0.4)',
];

/* Во время генерации страницы создается канвас с дефолтными формами
   Радиус по умолчанию указывается как R */

function setupCanvas() {
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  canvas.style.width = CANVAS_SIZE + 'px';
  canvas.style.height = CANVAS_SIZE + 'px';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawDefoltArea();
}

function drawDefoltArea() {
  drawDinamicRectangle(-1/2, 1, layers);
  drawDinamicCircle(1, 1, layers);
  drawDinamicTriangle(-1/2, -1/2, layers);
  drawGraphAxes();
  drawSymbols("R");
}

/* Двигая любую область, мы скорее всего будем накладывать ее на символы и оси графика
   Так что на каждое событие изменения форм надо перерисовывать канвас полностью */


function redrawCanvas(xRect, yRect, widthCircle, quadrantsCircle, xTriangle, yTriangle, r, layers) {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  drawDinamicRectangle(xRect, yRect, layers);
  drawDinamicCircle(widthCircle, quadrantsCircle, layers);
  drawDinamicTriangle(xTriangle, yTriangle, layers);
  drawGraphAxes();
  drawSymbols(r);
}


function drawDinamicRectangle(x, y, layers) {
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(y));
  ctx.lineTo(toX(x), toY(y));
  ctx.lineTo(toX(x), toY(0));  
  ctx.lineTo(toX(0), toY(0));
  ctx.closePath();

  ctx.fillStyle = LAYER_COLORS[layers.indexOf("rectangle")];
  ctx.fill();
}

function drawDinamicCircle(width, quadrants, layers) {
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(0));
  ctx.arc(toX(0), toY(0), (width) * scale,
          -Math.PI * quadrants / 2, -Math.PI * (quadrants - 1) / 2, false);
  ctx.closePath();

  ctx.fillStyle = LAYER_COLORS[layers.indexOf("circle")];
  ctx.fill();
}

function drawDinamicTriangle(x, y, layers) {
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(y));
  ctx.lineTo(toX(x), toY(0));  
  ctx.lineTo(toX(0), toY(0));
  ctx.closePath();

  ctx.fillStyle = LAYER_COLORS[layers.indexOf("triangle")];
  ctx.fill();
}

function drawSymbols(R) {
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#000';

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('x', CANVAS_SIZE - 15, cy + 8);
  ctx.fillText(typeof R == "number" ? `-${R}` : `-${R}`, toX(-1), cy + 8);
  ctx.fillText(typeof R == "number" ? `-${R/2}` : `-${R}/2`, toX(-1 / 2), cy + 8);
  ctx.fillText(typeof R == "number" ? `${R/2}` : `${R}/2`, toX(1 / 2), cy + 8);
  ctx.fillText(`${R}`, toX(1), cy + 8);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('y', cx + 8, 5);
  ctx.fillText(`${R}`, cx + 8, toY(1));
  ctx.fillText(typeof R == "number" ? `${R/ 2}` : `${R}/2`, cx + 8, toY(1 / 2));
  ctx.fillText(typeof R == "number" ? `-${R/2}` : `-${R}/2`, cx + 8, toY(-1 / 2));
  ctx.fillText(typeof R == "number" ? `-${R}` : `-${R}`, cx + 8, toY(-1));
}

function drawGraphAxes() {
  ctx.beginPath();
  ctx.moveTo(0, cy);
  ctx.lineTo(CANVAS_SIZE, cy);
  ctx.moveTo(cx, CANVAS_SIZE);
  ctx.lineTo(cx, 0);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(CANVAS_SIZE - 10, cy - 5);
  ctx.lineTo(CANVAS_SIZE, cy);
  ctx.lineTo(CANVAS_SIZE - 10, cy + 5);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - 5, 10);
  ctx.lineTo(cx, 0);
  ctx.lineTo(cx + 5, 10);
  ctx.stroke();
}




function drawPoint(x, y, r) {
  ctx.beginPath();
  ctx.arc(toX(x / r),toY(y / r), 5, 0, Math.PI * 2);
  ctx.fillStyle = 'red';
  ctx.fill();
}

function pixelToMath(px, py) {
  return {
    x: (px - cx) / scale,
    y: (py - cy) / -scale,
  };
}