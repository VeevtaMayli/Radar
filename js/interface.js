const Interface = {
    deleteAllTargets: function(targets) {
        targets.length = 0;
        delete localStorage['targets'];
    },
    addNewTarget: function(target) {

    },
    initialize: modal,
};

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
            el.addEventListener('click', () => {
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

    const firstFormElement = document.querySelector('.first').firstElementChild;
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
