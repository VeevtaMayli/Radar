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

function makeAnglePositive(angle) {
    return angle >= 0 ? angle : 2 * Math.PI + angle;
}

function dateInYYYYMMDDhhmmss() {
    const date = new Date();
    const Y = date.getFullYear();
    const M = date.getMonth() + 1; //Month from 0 to 11
    const D = date.getDate();
    const h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();

    return '' + Y + '-' + (M <= 9 ? '0' + M : M) +
        '-' + (D <= 9 ? '0' + D : D) + '_' + (h <= 9 ? '0' + h : h) +
        '-' + (m <= 9 ? '0' + m : m) + '_' + (s <= 9 ? '0' + s : s);
}

export {
    getNorm,
    angleInsideSector,
    makeAnglePositive,
    dateInYYYYMMDDhhmmss,
};
