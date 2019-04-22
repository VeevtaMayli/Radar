import {Indicator} from './indicator.js';
import {initialize} from './initialize.js';
import {redraw} from './drawing.js';
import {update} from './updating.js';

(function main() {
    const canvasEl = document.getElementById('canvas');
    const width = canvasEl.offsetWidth;
    const height = canvasEl.offsetHeight;

    const ctx = canvasEl.getContext('2d');

    let time = 0;

    const indicator = new Indicator({
        startX: width / 2,
        startY: height / 2,
        radius: width / 2,
        color: 'black',
    });

    const targets = [];
    const detectedTargets = [];

    initialize({indicator, targets});
    redraw({
        ctx,
        indicator,
        targets: detectedTargets,
    });

    let lastTimestamp = Date.now();
    const animate = () => {
        const currentTimestamp = Date.now();
        const deltaTime = (currentTimestamp - lastTimestamp) * 0.001;
        lastTimestamp = currentTimestamp;
        time += deltaTime;

        update({
            dt: deltaTime,
            time,
            indicator,
            targets,
            detectedTargets,
        });
        redraw({
            ctx,
            indicator,
            targets: detectedTargets,
        });
        requestAnimationFrame(animate);
    };
    animate();
})();
