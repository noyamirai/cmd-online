console.log('CMS SCRIPT: ACTIVE');

const addBlokBtns = document.querySelectorAll('.add-blok');

const getClone = (toBeClonedItem) => {
    let nodeCopy = toBeClonedItem.cloneNode(true);
    nodeCopy.classList.add('clone');
    nodeCopy.querySelector('select').name = `in_blok_2`;
    nodeCopy.querySelector('select').id = `in_blok_2`;

    return nodeCopy;
};

addBlokBtns.forEach((button) => {

    button.addEventListener('click', (e) => {
        e.preventDefault();

        const parentContainer = e.target.closest('fieldset');

        if (e.target.classList.contains('remove-blok')) {
            console.log('remove!!');

            parentContainer.querySelector('.clone').remove();
            e.target.textContent = 'Nog een blok toevoegen';
            e.target.classList.remove('remove-blok');

        } else {
            const selectContainer = parentContainer.querySelector('.select-container');

            const clone = getClone(selectContainer);

            parentContainer.insertBefore(clone, e.target);
            e.target.classList.add('remove-blok');

            e.target.textContent = 'Blok verwijderen';
        }

    });

});