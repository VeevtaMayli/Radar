import {scan} from './radar.js';

function update({dt, indicator, targets, detectedTargets}) {
    scan({dt, indicator, targets, detectedTargets});

    detectedTargets.forEach((target, i, targets) => {
        target.attenuate({dt, indicator});
        if (target.lifetime <= 0) {
            delete targets[i];
        }
    });
}

export {update};
