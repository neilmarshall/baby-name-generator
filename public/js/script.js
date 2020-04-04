document.addEventListener('DOMContentLoaded', async () => {

    const { names } = await fetch('/api/names')
        .then(response => response.json());

    const getRandomName = function(firstName) {
        if (firstName) {
            const secondName = getRandomName();
            return secondName !== firstName ? secondName : getRandomName(firstName);
        }
        return names[Math.floor(Math.random() * names.length)];
    }

    const resetNames = (nameElement1, nameElement2) => {
        const surname = 'Marshall';
        const firstName = getRandomName();
        const secondName = getRandomName(firstName);
        nameElement1.innerText = `${firstName} ${surname}`
        nameElement2.innerText = `${secondName} ${surname}`
    }

    const buildResultsTable = async function(tableId, tableHeader, username) {
        const table = document.getElementById(tableId);
        table.innerHTML = '';
        const nameElements = await fetch(`/api/favouritenames/${username}`)
            .then(response => response.json());
        table.insertAdjacentHTML('beforeend', `<tr class="border-bottom"><th colspan="2">${tableHeader}</th></tr>`);
        nameElements.map(element => {
            const signedTotal = element.total > 0 ? `+${element.total}` : element.total < 0 ? `${element.total}` : '-';
            const html = `<tr><td>${element.name}</td><td align="right">${signedTotal}</td></tr>`;
            table.insertAdjacentHTML('beforeend', html);
        });
    }

    const logFavouriteName = function(preferredName, unpreferredName, username) {
        preferredName.style.opacity = '0';
        unpreferredName.style.opacity = '0';
        window.setTimeout(async () => {
            preferredName.style.opacity = '1';
            unpreferredName.style.opacity = '1';
            await fetch('/api/favouritenames', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    preferredName: preferredName.innerText.split(' ')[0],
                    unpreferredName: unpreferredName.innerText.split(' ')[0],
                    username: username})
            });
            resetNames(nameElement1, nameElement2);
            buildResultsTable("results-table-1", "Sam's choices", "Sam");
            buildResultsTable("results-table-2", "Neil's choices", "Neil");
        }, 1000);
    }

    const nameElement1 = document.getElementById('name1');
    const nameElement2 = document.getElementById('name2');

    nameElement1.addEventListener('click', () => logFavouriteName(nameElement1, nameElement2, "Sam"));
    nameElement2.addEventListener('click', () => logFavouriteName(nameElement2, nameElement1, "Neil"));

    resetNames(nameElement1, nameElement2);

    buildResultsTable("results-table-1", "Sam's choices", "Sam");
    buildResultsTable("results-table-2", "Neil's choices", "Neil");
});
