console.log(`TEAM DETAILS SCRIPT ACTIVE`);

const teamListEl = document.querySelectorAll(`.grid--list__team-members`);
const teamHeadingEl = document.querySelectorAll(`.teamHeading`);

const nextItemBtn = document.querySelector(`#next-item`);
const skipBtn = document.querySelector(`#skip-all`);

const amountOfTeams = teamListEl.length;

let counter = 0;

teamListEl[0].classList.toggle(`hide`);
teamHeadingEl[0].classList.toggle(`hide`);

// BRON: https://stackoverflow.com/a/16750711
const RemoveLastDirectoryPartOf = (url) => {
    let array = url.split(`/`);
    array.pop();
    return (array.join(`/`));
};

nextItemBtn.addEventListener(`click`, () => {
    // when it's the last team, give button a href
    if ((counter + 1) === amountOfTeams) {
        nextItemBtn.href = RemoveLastDirectoryPartOf(window.location.pathname);
    } else {
        // hide everything
        teamListEl.forEach(el => {
            if (!el.classList.contains(`hide`)) {
                el.classList.add(`hide`);
            }
        });

        teamHeadingEl.forEach(el => {
            if (!el.classList.contains(`hide`)) {
                el.classList.add(`hide`);
            }
        });

        counter++;

        // show specific item
        teamListEl[counter].classList.toggle(`hide`);
        teamHeadingEl[counter].classList.toggle(`hide`);
    }
});

skipBtn.href = RemoveLastDirectoryPartOf(window.location.pathname);