import {Indicator} from './indicator.js';
import {Interface as ui} from './interface.js';
import {initialize} from './initialize.js';
import {redraw} from './drawing.js';
import {update} from './updating.js';
import {Target} from './target.js';

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

    document.addEventListener('DOMContentLoaded', () => {
        ui.initialize();
        document.getElementById('add_from_file').addEventListener('click', () => {
            ui.getNewTargetsFromFile();
            JSON.parse(localStorage['targets']).forEach((target) => {
                targets.push(new Target(target));
            });
        });
        document.getElementById('add').addEventListener('click', () => {
            const targetParameters = ui.getNewTargetFromForm();
            targets.push(new Target(targetParameters));
            const localTargets = JSON.parse(localStorage['targets']);
            localTargets.push(targetParameters);
            localStorage['targets'] = JSON.stringify(localTargets);
        });
        document.getElementById('delete').addEventListener('click', () => {
            ui.deleteAllTargets(targets);
        });
        document.getElementById('save').addEventListener('click', function() {
            this.href = ui.generateTargetsFile();
        });
    });

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
