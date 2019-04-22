function drawBackground({ctx, indicator}) {
    ctx.fillStyle = indicator.background;
    ctx.beginPath();
    ctx.arc(indicator.x, indicator.y, indicator.radius, 0, 2 * Math.PI);
    ctx.fill();
}

function drawRing({ctx, indicator, ring}) {
    ctx.strokeStyle = indicator.grid.color;
    ctx.lineWidth = indicator.grid.width;
    ctx.beginPath();
    ctx.arc(indicator.x, indicator.y, ring.position * indicator.radius, 0, 2 * Math.PI);
    ctx.stroke();
}

function drawRings({ctx, indicator}) {
    indicator.grid.rings.forEach((ring) => {
        drawRing({ctx, indicator, ring});
    });
}

function drawGrid({ctx, indicator}) {
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

function drawScanLine({ctx, indicator}) {
    const x = indicator.x;
    const y = indicator.y;
    const angle = indicator.scanLine.angle;
    const edge = indicator.grid.edge * indicator.radius;

    ctx.strokeStyle = indicator.scanLine.color;
    ctx.lineWidth = indicator.scanLine.width;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.sin(angle) * edge, y - Math.cos(angle) * edge);
    ctx.stroke();
}

function drawTarget({ctx, target, indicator}) {
    const maxDistance = indicator.signal.maxDistance;
    const distance = target.radius;
    const maxDistancePx = indicator.radius * indicator.grid.edge;
    if (distance > maxDistance) return;

    const radius = distance * maxDistancePx / maxDistance;
    const angle = target.angle;

    ctx.fillStyle = target.color;
    ctx.beginPath();
    ctx.arc(indicator.x + radius * Math.sin(angle), indicator.y - radius * Math.cos(angle), target.size, 0, 2 * Math.PI);
    ctx.fill();
}

function drawIndicator({ctx, indicator}) {
    drawBackground({ctx, indicator});
    drawRings({ctx, indicator});
    drawGrid({ctx, indicator});
    drawScanLine({ctx, indicator});
}

function redraw({ctx, indicator, targets}) {
    indicator.draw(ctx);

    targets.forEach((target) => {
        target.draw({ctx, indicator});
    });
}

export {
    drawIndicator,
    drawTarget,
    redraw,
};
