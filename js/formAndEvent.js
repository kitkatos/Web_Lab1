'use strict';

const STORAGE_KEY = 'lab1_points';

const X_MIN = -4;
const X_MAX = 4;
const Y_MIN = -3;
const Y_MAX = 3;
const R_MIN = 1;
const R_MAX = 5;

let points = [];



// основной метод обработки формы


function onFormSubmit(event) {
  event.preventDefault();

  const xSelect = form.elements['x'];
  const yInput = form.elements['y'];

  // X
  const xResult = validateX(xSelect.value);
  if (xResult.ok) clearError(xSelect);
  else showError(xSelect, xResult.message);

  // Y
  const yResult = validateY(yInput.value);
  if (yResult.ok) clearError(yInput);
  else showError(yInput, yResult.message);

  // R
  const rChecked = form.querySelector('input[name="r"]:checked');
  const rGroup = form.querySelector('input[name="r"]').closest('.form-group');
  const rResult = validateR(rChecked.value);
  if (rResult.ok) clearError(rGroup);
  else showError(rGroup, rResult.message);

  // Если есть ошибки — ничего не считаем
  if (!yResult.ok || !xResult.ok || !rResult.ok ) return;

  // Всё корректно: проверяем попадание и сохраняем
  const hit = isHit(xResult.value, yResult.value, rResult.value);
  addPoint(xResult.value, yResult.value, rResult.value, hit);
}


// проверка на попадание в заданную область


function isHit(x, y, r) {
  const xn = x / r;
  const yn = y / r;
  return inRectangle(xn, yn) || inCircle(xn, yn) || inTriangle(xn, yn);
}

function inCircle(x, y) {
  const [sx, sy] = QUADRANT_SIGNS[geometry.circle.quadrant];
  const r = geometry.circle.r;
  return x * sx >= 0
    && y * sy >= 0
    && x * x + y * y <= r * r;
}

function inRectangle(x, y) {
  const rx = geometry.rectangle.x;
  const ry = geometry.rectangle.y;
  return x * rx >= 0 && Math.abs(x) <= Math.abs(rx)
    && y * ry >= 0 && Math.abs(y) <= Math.abs(ry);  
}

function inTriangle(x, y) { 
  const tx = geometry.triangle.x;
  const ty = geometry.triangle.y;
  return x * tx >= 0 && y * ty >= 0 
    && Math.abs(x) + Math.abs(y) <= Math.abs(tx);  
}

function getTopAreaAndUpdateLayers(x, y) {
  let newLayers = [0, 0, 0];
  if (inCircle(x, y)) newLayers[layers.indexOf("circle")] = 1;
  if (inTriangle(x, y)) newLayers[layers.indexOf("triangle")] = 1;
  if (inRectangle(x, y)) newLayers[layers.indexOf("rectangle")] = 1;

  if (newLayers[0] == 1) return layers[0];
  if (newLayers[1] == 1) {
    [layers[0], layers[1]] = [layers[1], layers[0]];
    return layers[0];
  }
  if (newLayers[2] == 1) {
    [layers[0], layers[1], layers[2]] = [layers[2], layers[0], layers[1]];
    return layers[0];
  }

  return null;  
}


// валидация значений переменных из формы


function validateX(raw) {
  const value = parseNumber(raw);
  if (Number.isNaN(value)) {
    return {
      ok: false,
      message: 'X должен быть числом. Можно использовать точку или запятую.'
    };
  }
  if (value < X_MIN || value > X_MAX) {
    return {
      ok: false,
      message: 'X должен быть в диапазоне от ' + Y_MIN + ' до ' + Y_MAX + '.'
    };
  }
  return { ok: true, value };
}

function validateY(raw) {
  const value = parseNumber(raw);
  if (Number.isNaN(value)) {
    return {
      ok: false,
      message: 'Y должен быть числом. Можно использовать точку или запятую.'
    };
  }
  if (value < Y_MIN || value > Y_MAX) {
    return {
      ok: false,
      message: 'Y должен быть в диапазоне от ' + Y_MIN + ' до ' + Y_MAX + '.'
    };
  }
  return { ok: true, value };
}

function validateR(raw) {
  const value = parseNumber(raw);
  if (Number.isNaN(value)) {
    return {
      ok: false,
      message: 'Выберите корректный R'
    };
  }
  if (value < R_MIN || value > R_MAX) {
    return {
      ok: false,
      message: 'R должен быть в диапазоне от ' + R_MIN + ' до ' + R_MAX + '.'
    };
  }
  return { ok: true, value };
}


function parseNumber(raw) {
  if (typeof raw !== 'string') return NaN;
  const trimmed = raw.trim();
  if (trimmed === '') return NaN;
  const normalized = trimmed.replace(',', '.');
  const num = Number(normalized);
  return Number.isFinite(num) ? num : NaN;
}


// отображение ошибок ввода данных в форму


function showError(input, message) {
  const group = input.closest('.form-group');
  if (!group) return;
  let el = group.querySelector('.error-message');
  if (!el) {
    el = document.createElement('span');
    el.className = 'error-message';
    group.appendChild(el);
  }
  el.textContent = message;
}

function clearError(input) {
  const group = input.closest('.form-group');
  if (!group) return;
  const el = group.querySelector('.error-message');
  if (el) el.textContent = '';
}


// сохранение точек в браузере


function loadPoints() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(p =>
      p &&
      typeof p.x === 'number' &&
      typeof p.y === 'number' &&
      typeof p.r === 'number' &&
      typeof p.hit === 'boolean' &&
      typeof p.time === 'string'
    );
  } catch (e) {
    console.error('Не удалось прочитать сохранённые точки:', e);
    return [];
  }
}

function savePoints() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(points));
  } catch (e) {
    console.error('Не удалось сохранить точки:', e);
  }
}

function clearPoints() {
  points = [];
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Не удалось очистить хранилище:', e);
  }
  renderTable();
}


// отрисовка таблицы 


function renderTable() {
  resultsBody.innerHTML = '';
  for (const p of points) {
    const tr = document.createElement('tr');
    tr.innerHTML =
      '<td>' + p.x + '</td>' +
      '<td>' + p.y + '</td>' +
      '<td>' + p.r + '</td>' +
      '<td>' + (p.hit ? 'Попадание' : 'Промах') + '</td>' +
      '<td>' + formatDate(p.time) + '</td>';
    resultsBody.appendChild(tr);
  }
}


// сохранение точки


function addPoint(x, y, r, hit) {
  points.push({
    x: x,
    y: y,
    r: r,
    hit: hit,
    time: new Date().toISOString()
  });
  savePoints();
  renderTable();
  drawPoint(x, y, r);
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}