import {scan} from './radar.js';

function update({dt, time, indicator, targets, detectedTargets}) {
    scan({dt, indicator, targets, detectedTargets, time});

    detectedTargets.forEach((target, i, targets) => {
        target.attenuate({dt, indicator});
        if (target.lifetime <= 0) {
            delete targets[i];
        }
    });

    targets.forEach((target) => {
        const targetPosition = target.motionLaw(time);
        target.radius = targetPosition.radius;
        target.angle = targetPosition.angle;
        //console.log(targetPosition);
    });
}

export {update};
