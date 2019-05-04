const Interface = {
    deleteAllTargets: deleteAll,
    getNewTarget: get,
    generateTargetsFile: generateFile,
    initialize: () => {
        modal();
        showTargetOptions();
    },
};

function get() {
    const form = document['add'];
    return {
        type: form.type.value.toLowerCase(),
        radius: parseInt(form.radius.value),
        angle: parseInt(form.angle.value) * Math.PI / 180,
        xSpeed: parseInt(form.xSpeed.value),
        ySpeed: parseInt(form.ySpeed.value),
        xAcceleration: parseInt(form.xAcceleration.value),
        yAcceleration: parseInt(form.yAcceleration.value),
    };
}

function deleteAll(targets) {
    targets.length = 0;
    localStorage['targets'] = JSON.stringify([]);
}

function generateFile() {
    const targets = localStorage['targets'];
    const file = new Blob([targets], {type: 'text/plain'});
    return URL.createObjectURL(file);
}

function showTargetOptions() {
    document['add'][0].addEventListener('change', function() {
        const value = this.value.toLowerCase();
        const option = getAll('.target-option');
        const button = document.getElementById('add');

        if (value === '---') {
            option.forEach((el) => {
                el.style.display = 'none';
            });
            button.setAttribute('disabled', 'disabled');
        } else {
            option.forEach((el) => {
                el.style.display = 'block';
            });
            button.removeAttribute('disabled');
            if (value !== 'linear') {
                getAll('.linear').forEach((el) => {
                    el.style.display = 'none';
                });
            }
        }
    });
}

function modal() {
    const root = document.documentElement;
    const modals = getAll('.modal');
    const modalButtons = getAll('.modal-button');
    const modalCloses = getAll('.modal-background, .modal-close, .modal .button');

    if (modalButtons.length > 0) {
        modalButtons.forEach((el) => {
            el.addEventListener('click', () => {
                const target = el.dataset.target;
                openModal(target, root);
            });
        });
    }

    if (modalCloses.length > 0) {
        modalCloses.forEach((el) => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                closeModals(root, modals);
            });
        });
    }

    document.addEventListener('keydown', (event) => {
        const e = event || window.event;
        if (e.keyCode === 27) {
            closeModals(root, modals);
            //closeDropdowns();
        }
    });
}

function getAll(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector), 0);
}

function openModal(target, root) {
    const modal = document.getElementById(target);
    root.classList.add('is-clipped');
    modal.classList.add('is-active');

    const firstFormElement = document.forms[0][0];
    if (firstFormElement) {
        firstFormElement.focus();
    }
}

function closeModals(root, modals) {
    root.classList.remove('is-clipped');
    modals.forEach((el) => {
        el.classList.remove('is-active');
    });
}

export {Interface};
