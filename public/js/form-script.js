/* eslint-disable quotes */
const formTriggerBtn = document.querySelector(`.form-trigger`);
const bodyEl = document.querySelector(`body`);
const formEl = document.querySelector(`form`);
const closeFormBtn = document.querySelector(`#close-form`);

let touchstartY = 0;
let touchendY = 0;

// no href basically
formTriggerBtn.href = `javascript:void(0)`;

const toggleClass = () => {
    bodyEl.classList.toggle(`overlay`);
    formEl.classList.toggle(`form-active`);
};

const handleGesture = () => {
    if (touchendY > touchstartY) {
        console.log('swipe down!');
        toggleClass();
    }
};

formTriggerBtn.addEventListener(`click`, () => {
    toggleClass();
});

closeFormBtn.addEventListener(`click`, event => {
    event.preventDefault();

    toggleClass();
});

// BRON: https://stackoverflow.com/a/56663695
formEl.addEventListener("touchstart", e => {
    touchstartY = e.changedTouches[0].screenY;
});

formEl.addEventListener("touchend", e => {
    touchendY = e.changedTouches[0].screenY;
    handleGesture();
});