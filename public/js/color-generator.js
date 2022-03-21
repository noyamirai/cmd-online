console.log(`COLOR GENERATOR SCRIPT UP & RUNNING :D`);

const boxShadowItems = document.querySelectorAll(`.box-shadow`);
const colorOptions = [`orange`, `blue`, `pink`, `green`, `yellow`];

let counter = 0;

let listItems = [];
let pickFromMe = [];

// Only get the list items (profile pic has box-shadow class too)
boxShadowItems.forEach(element => {
    if (element.parentNode.nodeName.toLowerCase() == `li`) {
        listItems.push(element);
    }
});

const randomizer = () => {
    return Math.floor(Math.random() * 5);
};

// Generates x amount of random numbers based on a set length and adds these to provided array
const generator = (array, maxLength, amount) => {

    // check if items can be added to array in the first place
    if (array.length < maxLength) {
        const randomNumber = randomizer();

        // only add random number if it isnt in the array yet
        if (!array.includes(randomNumber)) {
            array.push(randomNumber);
        } else {
            // try again until success
            generator(array, maxLength, amount);
        }
    } else {
        // grab items from first array batch based on amount of remainders
        // example: [1,3,0,4,2] -> 2 remainders, so first two items (1 and 3) will be added
        counter++;
        array.push(array[counter - 1]);
    }
};

// Assign a color to provided element based on provided randomized index
const assignColor = (item, chosenOption) => {
    const randomOption = colorOptions[chosenOption];

    colorOptions.forEach(color => {
        if (randomOption == color) {
            item.classList.add(`${randomOption}-item`);
        }
    });
};

for (let i = 0; i < listItems.length; i++) {
    generator(pickFromMe, colorOptions.length, listItems.length);
    assignColor(listItems[i], pickFromMe[i]);
}