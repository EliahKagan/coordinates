// Geometrically meaningful lengths.
const FULL_SIZE = 500;
const HALF_SIZE = FULL_SIZE / 2;
const RAY_LENGTH = FULL_SIZE; // Anything long enough is fine.
const EPSILON = 0.0001;

// More geometrically meaningful lengths. These relate to gridlines.
const MIN_GRID_MESH = 10;
const MAX_GRID_MESH = 100;
const GRID_MESH_DELTA = 5;

// Lengths pertaining to the drawing of labels for the grid.
const MIN_LABEL_SPACING = 20;
const TICK_MARK_LENGTH = 6;
const LABEL_FONTSIZE = 8;
const HORIZONTAL_LABEL_OFFSET = 6;
const VERTICAL_LABEL_OFFSET = TICK_MARK_LENGTH + LABEL_FONTSIZE;

// Lengths that are eye-candy parameters.
const PATTERN_UX_OFFSET = 1; // Also test with: 10
const PATTERN_UY_OFFSET = 2; // Also test with: 20
const PATTERN_MESH = 7; // Unrelated to grid mesh. Also test with: 25

// Unicode code points for symbols and spacers.
const ANGLE_GLYPH = '\u2220';
const DEGREES_GLYPH = '\u00B0';
const THIN_SPACE = '\u2009';

// Coloring constants.
const MEDIUM_SHADE = 200;

// I should have actual unit tests, but until then...
const DEBUG_PATTERN = false;

function roundDown(value, resolution) {
  return floor(value / resolution) * resolution;
}

function roundUp(value, resolution) {
  return ceil(value / resolution) * resolution;
}

function snapDown(value, offset, mesh) {
  return roundDown(value - offset, mesh) + offset;
}

function snapUp(value, offset, mesh) {
  return roundUp(value - offset, mesh) + offset;
}

function withSign(value) {
  return value > 0 ? `+${value}` : str(value);
}

let activeModeOn = false;
let patternModeOn = false;
let gridMesh = MIN_GRID_MESH - 5; // Any out-of-range value is good here.

let uxDrawn = null;
let uyDrawn = null;

function toggleActivation() {
  if (activeModeOn) {
    activeModeOn = false;
    cursor(ARROW);
  } else {
    activeModeOn = true;
    noCursor();
  }
}

function togglePattern() {
  patternModeOn = !patternModeOn;
}

function setup() {
  createCanvas(FULL_SIZE, FULL_SIZE);
  toggleActivation();
}

function inCanvas(ux, uy) {
  return 0 <= ux && ux < FULL_SIZE && 0 <= uy && uy < FULL_SIZE;
}

function haveGrid() {
  return MIN_GRID_MESH <= gridMesh && gridMesh <= MAX_GRID_MESH;
}

function doPosition(ux, uy) {
  stroke(230, 0, 0);
  strokeWeight(5);
  point(ux, uy);
}

function xCoord(ux) {
  return ux - HALF_SIZE;
}

function yCoord(uy) {
  return HALF_SIZE - uy;
}

function uxParam(x) {
  return x + HALF_SIZE;
}

function uyParam(y) {
  return HALF_SIZE - y;
}

function doHorizontal(uy) {
  line(0, uy, FULL_SIZE, uy);
}

function doVertical(ux) {
  line(ux, 0, ux, FULL_SIZE);
}

function doGridLines() {
  stroke(0, 0, 0, 8);
  strokeWeight(1);
  
  for (let k = HALF_SIZE; k > 0; k -= gridMesh) {
    doHorizontal(k);
    doVertical(k);
    
  }
  
  for (let k = HALF_SIZE + gridMesh; k < FULL_SIZE; k += gridMesh) {
    doHorizontal(k);
    doVertical(k);
  }
}

function labelCoordX(x) {
  const ux = uxParam(x);
  
  stroke(0, 0, 0, 48);
  strokeWeight(1);
  fill(0, 0, 0, 48);
  line(ux, HALF_SIZE, ux, HALF_SIZE + TICK_MARK_LENGTH);
  
  noStroke();
  fill(0, 0, 0, 255);
  textAlign(CENTER);
  textSize(LABEL_FONTSIZE);
  text(withSign(x), ux, HALF_SIZE + VERTICAL_LABEL_OFFSET);
}

function labelCoordY(y) {
  const uy = uyParam(y);
  
  stroke(0, 0, 0, 48);
  strokeWeight(1);
  fill(0, 0, 0, 48);
  line(HALF_SIZE, uy, HALF_SIZE + TICK_MARK_LENGTH, uy);
  
  noStroke();
  fill(0, 0, 0, 255);
  textAlign(LEFT);
  textSize(LABEL_FONTSIZE);
  text(withSign(y), HALF_SIZE + HORIZONTAL_LABEL_OFFSET, uy);
}

function doGridLabels() {
  const spacing = roundUp(MIN_LABEL_SPACING, gridMesh);
  
  for (let r = spacing; r < HALF_SIZE; r += spacing) {
    labelCoordX(-r);
    labelCoordX(r);
    labelCoordY(-r);
    labelCoordY(r);
  }
}

function doGrid() {
  doGridLines();
  doGridLabels();
}

function doCrosslines(ux, uy, shade) {
  stroke(shade, shade, shade);
  strokeWeight(1);
  doHorizontal(uy);
  doVertical(ux);
}

function doCartesian(ux, uy) {
  doCrosslines(HALF_SIZE, HALF_SIZE, 0);
  doCrosslines(ux, uy, MEDIUM_SHADE);
  
  noStroke();
  fill(0, 0, 0, 255);
  textSize(12);
  textAlign(LEFT);
  text(`(${withSign(xCoord(ux))}, ${withSign(yCoord(uy))})`,
       ux + 5, uy - 7);
}

function rCoord(ux, uy) {
  const x = xCoord(ux);
  const y = yCoord(uy);
  return sqrt(sq(x) + sq(y));
}

function phiCoord(ux, uy) {
  const x = xCoord(ux);
  const y = yCoord(uy);
  const phi = atan2(y, x);
  
  return phi < 0 ? phi + TWO_PI : phi;
}

function doCircle(ux, uy) {
  const r = rCoord(ux, uy);
  
  stroke(0, MEDIUM_SHADE, MEDIUM_SHADE, 255);
  strokeWeight(1);
  fill(0, 0, 0, 0);
  circle(HALF_SIZE, HALF_SIZE, r * 2);
}

function doArc(ux, uy) {
  const r = rCoord(ux, uy);
  const phi = phiCoord(ux, uy);
  if (phi < EPSILON) return; // Prevent arc() from drawing 2pi for 0.
  
  stroke(0, 0, MEDIUM_SHADE, 255);
  strokeWeight(1);
  fill(0, 0, 0, 0);
  arc(HALF_SIZE, HALF_SIZE, r * 2, r * 2, -phi, 0);
}

function doRay(ux, uy) {
  const r = rCoord(ux, uy);
  if (r < 1) return;
  
  const scale = RAY_LENGTH / r;
  const x = xCoord(ux);
  const y = yCoord(uy);
  
  stroke(0, MEDIUM_SHADE, MEDIUM_SHADE, 255);
  strokeWeight(1);
  fill(0, 0, 0, 0);
  line(HALF_SIZE, HALF_SIZE,
       HALF_SIZE + x * scale, HALF_SIZE - y * scale);
}

function doRadius(ux, uy) {
  stroke(0, 0, MEDIUM_SHADE, 255);
  strokeWeight(1);
  fill(0, 0, 0, 0);
  line(HALF_SIZE, HALF_SIZE, ux, uy);
}

function showPatternEnvelope(imin, imax, jmin, jmax) {
  stroke(255, 0, 0, 255);
  strokeWeight(1);
  
  doVertical(imin);
  doVertical(imax);
  doHorizontal(jmin);
  doHorizontal(jmax);
}

function doPattern(ux, uy) {
  const r = rCoord(ux, uy);
  const phi = phiCoord(ux, uy);
  
  const imin = snapDown(HALF_SIZE - r, PATTERN_UX_OFFSET, PATTERN_MESH);
  const imax = snapUp(HALF_SIZE + r, PATTERN_UX_OFFSET, PATTERN_MESH);
  const jmin = snapDown(HALF_SIZE - r, PATTERN_UY_OFFSET, PATTERN_MESH);
  const jmax = snapUp(HALF_SIZE + r, PATTERN_UY_OFFSET, PATTERN_MESH);
  
  if (DEBUG_PATTERN) {
    showPatternEnvelope(imin, imax, jmin, jmax);
  }
  
  stroke(0, 128, 255, 100);
  strokeWeight(1);
  
  for (let i = imin; i <= imax; i += PATTERN_MESH) {
    for (let j = jmin; j <= jmax; j += PATTERN_MESH) {
      if (rCoord(i, j) < r && phiCoord(i, j) < phi) {
        point(i, j);
      }
    }
  }
}

function doPolar(ux, uy) {
  doCircle(ux, uy);
  doArc(ux, uy);
  doRay(ux, uy);
  doRadius(ux, uy);
  
  if (patternModeOn) {
    doPattern(ux, uy);
  }
  
  const r = rCoord(ux, uy);
  const phi = phiCoord(ux, uy);
  
  noStroke();
  fill(0, 0, 0, 255);
  textSize(12);
  textAlign(LEFT);
  text(`${r.toFixed(0)}${ANGLE_GLYPH}${phi.toFixed(2)}` +
         `${THIN_SPACE}[${degrees(phi).toFixed(1)}${DEGREES_GLYPH}]`,
       ux + 5, uy + 15);
}

function reveal(ux, uy) {
  doCartesian(ux, uy);
  doPolar(ux, uy);
  doPosition(ux, uy);
}

function update(ux, uy) {
  background(240);
  
  if (haveGrid()) {
    doGrid();
  }
  
  reveal(ux, uy);
}

function draw() {
  if (!activeModeOn) return;
  
  const ux = mouseX;
  const uy = mouseY;
  if (!inCanvas(ux, uy)) return;
  
  update(ux, uy);
  uxDrawn = ux;
  uyDrawn = uy;
}

function mouseClicked() {
  if (inCanvas(mouseX, mouseY)) {
    toggleActivation();
  }
  
  return false;
}

function doubleClicked() {
  if (inCanvas(mouseX, mouseY)) {
    togglePattern();
  }
  
  return false;
}

function adjustGridMesh(delta) {
  if (haveGrid()) {
    gridMesh += delta;
  } else if (delta < 0) {
    gridMesh = MAX_GRID_MESH; // Scroll "back around" to large mesh.
  } else {
    gridMesh = MIN_GRID_MESH; // Scroll "back around" to small mesh.
  }
  
  if (activeModeOn || uxDrawn === null || uyDrawn === null) return;
  
  // Even if the UI isn't set to respond to cursor position, a grid mesh
  // change should still take effect immediately. So do it explicitly.
  update(uxDrawn, uyDrawn);
}

function mouseWheel(event) {
  if (inCanvas(mouseX, mouseY) && event.delta !== 0) {
    adjustGridMesh(-Math.sign(event.delta) * GRID_MESH_DELTA);
  }
  
  return false;
}
