import * as eventHandlers from './modalEventHandlers.js';

interface NameElement {
    name: string;
    total: number;
}

document.addEventListener('DOMContentLoaded', async () => {

    // define variables
    const names: Set<string> = await fetch('/api/names')
        .then(response => response.json())
        .then(json => new Set(json.names));
    const nameElement1A = document.getElementById('name1-A')!;
    const nameElement2A = document.getElementById('name2-A')!;
    const nameElement1B = document.getElementById('name1-B')!;
    const nameElement2B = document.getElementById('name2-B')!;


    // define locally-scoped functions
    const getRandomName = function(firstName: string | undefined = undefined): string {
        if (firstName) {
            const secondName = getRandomName();
            return secondName !== firstName ? secondName : getRandomName(firstName);
        }
        return Array.from(names)[Math.floor(Math.random() * names.size)];
    }

    const resetNames = () => {
        const surname = 'Marshall';
        const firstName = getRandomName();
        const secondName = getRandomName(firstName);
        nameElement1A.innerText = `${firstName} ${surname}`
        nameElement1B.innerText = `${firstName} ${surname}`
        nameElement2A.innerText = `${secondName} ${surname}`
        nameElement2B.innerText = `${secondName} ${surname}`
    }

    const buildResultsTables = async function() {
        const tableId1A = "results-table-1-A";
        const tableId2A = "results-table-2-A";
        const tableId1B = "results-table-1-B";
        const tableId2B = "results-table-2-B";

        const table1A = document.getElementById(tableId1A)!;
        const table2A = document.getElementById(tableId2A)!;
        const table1B = document.getElementById(tableId1B)!;
        const table2B = document.getElementById(tableId2B)!;

        const primaryUsername = table1A.getAttribute('data-user');
        const secondaryUsername = table2A.getAttribute('data-user');
        const primaryNameElements = primaryUsername
            ? (await fetch(`/api/favouritenames/${primaryUsername}`).then(response => response.json()))
            : null;
        const secondaryNameElements = secondaryUsername
            ? (await fetch(`/api/favouritenames/${secondaryUsername}`).then(response => response.json()))
            : null;

        const buildResultsTable = async function(table: HTMLElement, tableId: string, nameElements: NameElement[]) {
            document.querySelectorAll(`#${tableId} td`).forEach(e => e.parentNode!.removeChild(e))
            if (nameElements) {
                nameElements.map(element => {
                    const signedTotal = element.total > 0 ? `+${element.total}` : element.total < 0 ? `${element.total}` : '-';
                    const html = `<tr><td>${element.name}</td><td align="right">${signedTotal}</td></tr>`;
                    table.insertAdjacentHTML('beforeend', html);
                });
            }
        }

        await Promise.all([
            buildResultsTable(table1A, tableId1A, primaryNameElements),
            buildResultsTable(table2A, tableId2A, secondaryNameElements),
            buildResultsTable(table1B, tableId1B, primaryNameElements),
            buildResultsTable(table2B, tableId2B, secondaryNameElements)
        ]);
    }

    const logFavouriteName = async function(preferredName: HTMLElement, unpreferredName: HTMLElement) {
        preferredName.style.opacity = '0';
        unpreferredName.style.opacity = '0';
        window.setTimeout(() => {
            preferredName.style.opacity = '1';
            unpreferredName.style.opacity = '1';
            resetNames();
        }, 1000);

        const username = document.getElementById("results-table-1-A")!.getAttribute('data-user');
        await fetch('/api/favouritenames', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                preferredName: preferredName.innerText.split(' ')[0],
                unpreferredName: unpreferredName.innerText.split(' ')[0],
                username: username})
        });
        buildResultsTables();
    }


    // add event listeners
    nameElement1A.addEventListener('click', () => logFavouriteName(nameElement1A, nameElement2A));
    nameElement2A.addEventListener('click', () => logFavouriteName(nameElement2A, nameElement1A));
    nameElement1B.addEventListener('click', () => logFavouriteName(nameElement1B, nameElement2B));
    nameElement2B.addEventListener('click', () => logFavouriteName(nameElement2B, nameElement1B));

    document.querySelectorAll('.otherUserSelectButton').forEach(element => {
        element.addEventListener('change', e => {
            document.querySelectorAll('.otherUserSelectButton').forEach(element => {
                (<HTMLInputElement>element).value = (<HTMLInputElement>e.target)!.value;
            });
            document.getElementById("results-table-2-A")!.setAttribute('data-user', (<HTMLInputElement>e.target)!.value);
            document.getElementById("results-table-2-B")!.setAttribute('data-user', (<HTMLInputElement>e.target)!.value);
            buildResultsTables();
        });
    });

    eventHandlers.buildAddNameEventHandler(names);
    eventHandlers.buildDeleteNameEventHandler(names);
    eventHandlers.buildChangePasswordEventHandler();
    eventHandlers.buildAddUserEventHandler();


    // initial page setup
    resetNames();
    buildResultsTables();

});
