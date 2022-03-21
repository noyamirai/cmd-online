const toggleContainer = document.querySelector(`#toggle-container`);
const toggleYesBtn = document.querySelector(`#toggle-yes`);
const toggleNoBtn = document.querySelector(`#toggle-no`);

toggleContainer.classList.add(`toggle`);

toggleYesBtn.addEventListener(`click`, event => {
    if (event.target && event.target.matches(`input[type='radio']`)) {
        toggleContainer.classList.toggle(`toggled`);

        if (!toggleYesBtn.classList.contains(`toggle--active`)) {
            toggleYesBtn.classList.add(`toggle--active`);
            toggleNoBtn.classList.remove(`toggle--active`);
        }
    }
});

toggleNoBtn.addEventListener(`click`, event => {
    if (event.target && event.target.matches(`input[type='radio']`)) {
        toggleContainer.classList.toggle(`toggled`);

        if (!toggleNoBtn.classList.contains(`toggle--active`)) {
            toggleNoBtn.classList.add(`toggle--active`);
            toggleYesBtn.classList.remove(`toggle--active`);
        }
    }
});