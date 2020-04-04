const fetch = require('node-fetch');

async function getNames(username) {
    // TODO: Read from MondoDB resource here
    return JSON.stringify(
        username === 'Sam'
        ?  [
             {name: "Arthur", total: 12},
             {name: "Cillian", total: 11},
             {name: "Vincent", total: 10},
             {name: "Henry", total: 9},
             {name: "Emmett", total: 8},
             {name: "Jonathan", total: 7},
             {name: "Arlo", total: 6},
             {name: "Owen", total: 5},
             {name: "Jamie", total: 4},
             {name: "Warren", total: 3},
             {name: "Elias", total: 2},
             {name: "Emery", total: 1},
             {name: "Darcy", total: 0},
             {name: "Alaric", total: -1},
             {name: "Richard", total: -2},
             {name: "Fenton", total: -3},
             {name: "Rufus", total: -4},
             {name: "Ivor", total: -5},
             {name: "Eli", total: -6},
             {name: "Robin", total: -7},
             {name: "Connor", total: -8},
             {name: "Leon", total: -9},
             {name: "Jude", total: -10},
             {name: "Dacre", total: -11},
             {name: "Ethan", total: -12},
             {name: "Guy", total: -13}
        ]
        :  [
             {name: "Emmett", total: 8},
             {name: "Henry", total: 7},
             {name: "Arlo", total: 6},
             {name: "Jonathan", total: 5},
             {name: "Jamie", total: 4},
             {name: "Owen", total: 3},
             {name: "Elias", total: 2},
             {name: "Warren", total: 1},
             {name: "Arthur", total: 0},
        ]
    );
}

async function addNames(preferredName, unpreferredName) {
    // TODO: Write to MondoDB resource here
    await fetch('http://localhost:3004/posts', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            preferredName: preferredName,
            unpreferredName: unpreferredName})
    });
}

module.exports = { getNames, addNames }

