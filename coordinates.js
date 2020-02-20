var [setup, draw, mouseClicked, doubleClicked, mouseWheel] = (function () {
  'use strict';

  // Symbolic constants for canvas size, geometry, and color.
  const FULL_SIZE = 500;
  const HALF_SIZE = FULL_SIZE / 2;
  const RAY_LENGTH = FULL_SIZE; // Anything long enough is fine.
  const ANGLE_EPSILON = 0.0001; // For numeric comparisons (not iteration).
  const CANVAS_SHADE = 240;

  // Symbolic constants for the point to plot and its coordinate label.
  const POINT_SHADE = 230;
  const POINT_LABELS_FONTSIZE = 12;
  const POINT_CARTESIAN_LABEL_CX_OFFSET = 5;
  const POINT_CARTESIAN_LABEL_CY_OFFSET = -7;
  const POINT_POLAR_LABEL_CX_OFFSET = POINT_CARTESIAN_LABEL_CX_OFFSET;
  const POINT_POLAR_LABEL_CY_OFFSET = 15;

  // Number of fractional digits (fixed-point precision) for angle labels.
  const POINT_POLAR_LABEL_R_PREC = 0;
  const POINT_POLAR_LABEL_RADS_PREC = 2;
  const POINT_POLAR_LABEL_DEGS_PREC = 1;

  // Symbols and spacers used in the text label of the point being plotted.
  const ANGLE_GLYPH = '\u2220';
  const DEGS_GLYPH = '\u00B0';
  const THIN_SPACE = '\u2009';

  // Shade of lines/curves with one coordinate of the point to plot.
  const INTERSECTOR_SHADE = 200;

  // Symbolic constants for gridlines ("graph paper lines").
  const GRID_MESH_MIN = 10;
  const GRID_MESH_MAX = 100;
  const GRID_MESH_SCALE_DELTA = 5;
  const GRID_LINES_OPACITY = 8; // alpha channel value

  // Symbolic constants for axis scale markings (tick marks and labels).
  const SCALE_TICK_MARKS_LENGTH = 6;
  const SCALE_TICK_MARKS_OPACITY = 48; // alpha channel value
  const SCALE_LABELS_FONTSIZE = 8;
  const SCALE_LABELS_MIN_SPACING = 20;
  const SCALE_LABELS_CX_OFFSET = 6;
  const SCALE_LABELS_CY_OFFSET = SCALE_TICK_MARKS_LENGTH +
                                  SCALE_LABELS_FONTSIZE;

  // Symbolic constants to tune the fill pattern ("eye candy").
  const PATTERN_CX_OFFSET = 1; // Also test with: 10
  const PATTERN_CY_OFFSET = 2; // Also test with: 20
  const PATTERN_MESH = 7; // Unrelated to grid mesh. Also test with: 25
  const PATTERN_OPACITY = 100; // alpha channel value
  const DEBUG_PATTERN_ENVELOPE = false;

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
  let gridMesh = GRID_MESH_MIN - 5; // Any out-of-range value is good here.

  let cxDrawn = null;
  let cyDrawn = null;

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

  function inCanvas(cx, cy) {
    return 0 <= cx && cx < FULL_SIZE && 0 <= cy && cy < FULL_SIZE;
  }

  function haveGrid() {
    return GRID_MESH_MIN <= gridMesh && gridMesh <= GRID_MESH_MAX;
  }

  function doPoint(cx, cy) {
    stroke(POINT_SHADE, 0, 0);
    strokeWeight(5);
    point(cx, cy);
  }

  function xCoord(cx) {
    return cx - HALF_SIZE;
  }

  function yCoord(cy) {
    return HALF_SIZE - cy;
  }

  function cxParam(x) {
    return x + HALF_SIZE;
  }

  function cyParam(y) {
    return HALF_SIZE - y;
  }

  function doHorizontal(cy) {
    line(0, cy, FULL_SIZE, cy);
  }

  function doVertical(cx) {
    line(cx, 0, cx, FULL_SIZE);
  }

  function doGridLines() {
    stroke(0, 0, 0, GRID_LINES_OPACITY);
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
    const cx = cxParam(x);

    stroke(0, 0, 0, SCALE_TICK_MARKS_OPACITY);
    strokeWeight(1);
    fill(0, 0, 0, SCALE_TICK_MARKS_OPACITY);
    line(cx, HALF_SIZE, cx, HALF_SIZE + SCALE_TICK_MARKS_LENGTH);

    noStroke();
    fill(0, 0, 0, 255);
    textAlign(CENTER);
    textSize(SCALE_LABELS_FONTSIZE);
    text(withSign(x), cx, HALF_SIZE + SCALE_LABELS_CY_OFFSET);
  }

  function labelCoordY(y) {
    const cy = cyParam(y);

    stroke(0, 0, 0, SCALE_TICK_MARKS_OPACITY);
    strokeWeight(1);
    fill(0, 0, 0, SCALE_TICK_MARKS_OPACITY);
    line(HALF_SIZE, cy, HALF_SIZE + SCALE_TICK_MARKS_LENGTH, cy);

    noStroke();
    fill(0, 0, 0, 255);
    textAlign(LEFT);
    textSize(SCALE_LABELS_FONTSIZE);
    text(withSign(y), HALF_SIZE + SCALE_LABELS_CX_OFFSET, cy);
  }

  function doGridLabels() {
    const spacing = roundUp(SCALE_LABELS_MIN_SPACING, gridMesh);

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

  function doCrosslines(cx, cy, shade) {
    stroke(shade, shade, shade);
    strokeWeight(1);
    doHorizontal(cy);
    doVertical(cx);
  }

  function doCartesian(cx, cy) {
    doCrosslines(HALF_SIZE, HALF_SIZE, 0);
    doCrosslines(cx, cy, INTERSECTOR_SHADE);

    noStroke();
    fill(0, 0, 0, 255);
    textSize(POINT_LABELS_FONTSIZE);
    textAlign(LEFT);

    text(`(${withSign(xCoord(cx))}, ${withSign(yCoord(cy))})`,
         cx + POINT_CARTESIAN_LABEL_CX_OFFSET,
         cy + POINT_CARTESIAN_LABEL_CY_OFFSET);
  }

  function rCoord(cx, cy) {
    const x = xCoord(cx);
    const y = yCoord(cy);
    return sqrt(sq(x) + sq(y));
  }

  function phiCoord(cx, cy) {
    const x = xCoord(cx);
    const y = yCoord(cy);
    const phi = atan2(y, x);

    return phi < 0 ? phi + TWO_PI : phi;
  }

  function doCircle(cx, cy) {
    const r = rCoord(cx, cy);

    stroke(0, INTERSECTOR_SHADE, INTERSECTOR_SHADE, 255);
    strokeWeight(1);
    fill(0, 0, 0, 0);
    circle(HALF_SIZE, HALF_SIZE, r * 2);
  }

  function doArc(cx, cy) {
    const r = rCoord(cx, cy);
    const phi = phiCoord(cx, cy);
    if (phi < ANGLE_EPSILON) return; // Keep arc() from drawing 2pi for 0.

    stroke(0, 0, INTERSECTOR_SHADE, 255);
    strokeWeight(1);
    fill(0, 0, 0, 0);
    arc(HALF_SIZE, HALF_SIZE, r * 2, r * 2, -phi, 0);
  }

  function doRay(cx, cy) {
    const r = rCoord(cx, cy);
    if (r < 1) return;

    const scale = RAY_LENGTH / r;
    const x = xCoord(cx);
    const y = yCoord(cy);

    stroke(0, INTERSECTOR_SHADE, INTERSECTOR_SHADE, 255);
    strokeWeight(1);
    fill(0, 0, 0, 0);
    line(HALF_SIZE, HALF_SIZE,
         HALF_SIZE + x * scale, HALF_SIZE - y * scale);
  }

  function doRadius(cx, cy) {
    stroke(0, 0, INTERSECTOR_SHADE, 255);
    strokeWeight(1);
    fill(0, 0, 0, 0);
    line(HALF_SIZE, HALF_SIZE, cx, cy);
  }

  function showPatternEnvelope(imin, imax, jmin, jmax) {
    stroke(255, 0, 0, 255);
    strokeWeight(1);

    doVertical(imin);
    doVertical(imax);
    doHorizontal(jmin);
    doHorizontal(jmax);
  }

  function doPattern(cx, cy) {
    const r = rCoord(cx, cy);
    const phi = phiCoord(cx, cy);

    const imin = snapDown(HALF_SIZE - r, PATTERN_CX_OFFSET, PATTERN_MESH);
    const imax = snapUp(HALF_SIZE + r, PATTERN_CX_OFFSET, PATTERN_MESH);
    const jmin = snapDown(HALF_SIZE - r, PATTERN_CY_OFFSET, PATTERN_MESH);
    const jmax = snapUp(HALF_SIZE + r, PATTERN_CY_OFFSET, PATTERN_MESH);

    if (DEBUG_PATTERN_ENVELOPE) {
      showPatternEnvelope(imin, imax, jmin, jmax);
    }

    stroke(0, 128, 255, PATTERN_OPACITY); // Halfway between blue and cyan.
    strokeWeight(1);

    for (let i = imin; i <= imax; i += PATTERN_MESH) {
      for (let j = jmin; j <= jmax; j += PATTERN_MESH) {
        if (rCoord(i, j) < r && phiCoord(i, j) < phi) {
          point(i, j);
        }
      }
    }
  }

  function doPolar(cx, cy) {
    doCircle(cx, cy);
    doArc(cx, cy);
    doRay(cx, cy);
    doRadius(cx, cy);

    if (patternModeOn) {
      doPattern(cx, cy);
    }

    const r = rCoord(cx, cy);
    const phi = phiCoord(cx, cy);

    const rStr = r.toFixed(POINT_POLAR_LABEL_R_PREC);
    const phiStr = phi.toFixed(POINT_POLAR_LABEL_RADS_PREC);
    const phiDegsStr = degrees(phi).toFixed(POINT_POLAR_LABEL_DEGS_PREC);

    noStroke();
    fill(0, 0, 0, 255);
    textSize(POINT_LABELS_FONTSIZE);
    textAlign(LEFT);

    text(`${rStr}${ANGLE_GLYPH}${phiStr}` +
          `${THIN_SPACE}[${phiDegsStr}${DEGS_GLYPH}]`,
         cx + POINT_POLAR_LABEL_CX_OFFSET, cy + POINT_POLAR_LABEL_CY_OFFSET);
  }

  function reveal(cx, cy) {
    doCartesian(cx, cy);
    doPolar(cx, cy);
    doPoint(cx, cy);
  }

  function update(cx, cy) {
    background(CANVAS_SHADE);

    if (haveGrid()) {
      doGrid();
    }

    reveal(cx, cy);
  }

  function draw() {
    if (!activeModeOn) return;

    const cx = mouseX;
    const cy = mouseY;
    if (!inCanvas(cx, cy)) return;

    update(cx, cy);
    cxDrawn = cx;
    cyDrawn = cy;
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
      gridMesh = GRID_MESH_MAX; // Scroll "back around" to large mesh.
    } else {
      gridMesh = GRID_MESH_MIN; // Scroll "back around" to small mesh.
    }

    if (activeModeOn || cxDrawn === null || cyDrawn === null) return;

    // Even if the UI isn't set to respond to cursor position, a grid mesh
    // change should still take effect immediately. So do it explicitly.
    update(cxDrawn, cyDrawn);
  }

  function mouseWheel(event) {
    if (inCanvas(mouseX, mouseY) && event.delta !== 0) {
      adjustGridMesh(-Math.sign(event.delta) * GRID_MESH_SCALE_DELTA);
    }

    return false;
  }

  return [setup, draw, mouseClicked, doubleClicked, mouseWheel];
})();
