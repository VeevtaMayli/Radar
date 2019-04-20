const INDICATOR_BACKGROUND = 'black';
const GRID_COLOR = 'green';
const SCAN_LINE_COLOR = 'red';
const RING_AMOUNT = 5;
const SECTOR_AMOUNT = 8;
const GRID_WIDTH = 2;
const SCAN_LINE_WIDTH = 3;
const GRID_BORDER = 0.95;
const SCAN_LINE_START_ANGLE = 0;
const SCAN_LINE_FREQUENCY = 10;

function Indicator({
    startX,
    startY,
    radius,
}) {
    this.x = startX;
    this.y = startY;
    this.radius = radius;
    this.background = INDICATOR_BACKGROUND;
    this.grid = {
        edge: GRID_BORDER,
        rings: createRings(this),
        color: GRID_COLOR,
        width: GRID_WIDTH,
        sectorCount: SECTOR_AMOUNT,
    };
    this.scanLine = {
        angle: SCAN_LINE_START_ANGLE,
        width: SCAN_LINE_WIDTH,
        color: SCAN_LINE_COLOR,
        frequency: SCAN_LINE_FREQUENCY,
    };
}

function Ring(position) {
    this.position = position;
}

function createRings(indicator) {
    let rings = [];
    for (let i = 0; i < RING_AMOUNT; i++) {
        const position = GRID_BORDER * (i + 1) / RING_AMOUNT;
        rings.push(new Ring(position));
    }
    return rings;
}

function drawIndicator({ctx, indicator,}) {
    drawBackground({ctx, indicator});
    drawRings({ctx, indicator});
    drawGrid({ctx, indicator});
    drawScanLine({ctx, indicator});
}

function drawBackground({ctx, indicator,}) {
    ctx.fillStyle = indicator.background;
    ctx.beginPath();
    ctx.arc(indicator.x, indicator.y, indicator.radius, 0, 2 * Math.PI);
    ctx.fill();
}

function drawRing({ctx, indicator, ring,}) {
    ctx.strokeStyle = indicator.grid.color;
    ctx.lineWidth = indicator.grid.width;
    ctx.beginPath();
    ctx.arc(indicator.x, indicator.y, ring.position * indicator.radius, 0, 2 * Math.PI);
    ctx.stroke();
}

function drawRings({ctx, indicator,}) {
    indicator.grid.rings.forEach((ring) => {
        drawRing({ctx, indicator, ring});
    })
}

function drawGrid({ctx, indicator,}) {
    const x = indicator.x;
    const y = indicator.y;
    const sectorCount = indicator.grid.sectorCount;
    const edge = indicator.grid.edge * indicator.radius;

    ctx.strokeStyle = indicator.grid.color;
    ctx.lineWidth = indicator.grid.width;
    ctx.beginPath();
    for (let i = 0; i < sectorCount; i++) {
        const angle = i * 2 * Math.PI / sectorCount;
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.sin(angle) * edge, y - Math.cos(angle) * edge);
    }
    ctx.stroke();
}

function drawScanLine({ctx, indicator,}) {
    const x = indicator.x;
    const y = indicator.y;
    const angle = indicator.scanLine.angle;
    const edge = indicator.grid.edge * indicator.radius;

    ctx.strokeStyle = indicator.scanLine.color;
    ctx.lineWidth = indicator.scanLine.lineWidth;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.sin(angle) * edge, y - Math.cos(angle) * edge);
    ctx.stroke();
}

function redraw({ctx, indicator,}) {
    drawIndicator({ctx, indicator,});
}

function updateScanLine({indicator, dt}) {
    indicator.scanLine.angle += 2 * Math.PI * dt / indicator.scanLine.frequency;
}

function update({dt, indicator,}) {
    updateScanLine({dt, indicator, });
}

function main() {
    const canvasEl = document.getElementById('canvas');
    const width = canvasEl.offsetWidth;
	const height = canvasEl.offsetHeight;
    
    const ctx = canvasEl.getContext('2d');

    let indicator = new Indicator({
        startX: width / 2,
        startY: height / 2,
        radius: width / 2,
        color: 'black',
    });

    redraw({ctx, indicator,});

    let lastTimestamp = Date.now();
    const animateFn = () => {
        const currentTimestamp = Date.now();
        const deltaTime = (currentTimestamp - lastTimestamp) * 0.001;
        lastTimestamp = currentTimestamp;

        update({
            dt: deltaTime,
            indicator,
        });
        redraw({ctx, indicator});
        requestAnimationFrame(animateFn);
    };
    animateFn();
}