function getNorm(samples) {
    return Math.sqrt(samples.reduce((norm, sample) => {
        return norm + Math.pow(sample, 2);
    }, 0));
}

function angleInsideSector({minAngle, maxAngle, angle}) {
    return minAngle < maxAngle
        ? angle >= minAngle && angle < maxAngle
        : angle >= minAngle && angle < 2 * Math.PI || angle >= 0 && angle < maxAngle;
}

export {
    getNorm,
    angleInsideSector,
};
