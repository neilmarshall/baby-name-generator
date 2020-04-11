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

    const buildResultsTable = async function(tableId) {
        const table = document.getElementById(tableId);
        const username = table.getAttribute('data-user');
        document.querySelectorAll(`#${tableId} td`).forEach(e => e.parentNode.removeChild(e))
        const nameElements = username
            ? (await fetch(`/api/favouritenames/${username}`).then(response => response.json()))
            : null;
        if (nameElements) {
            nameElements.map(element => {
                const signedTotal = element.total > 0 ? `+${element.total}` : element.total < 0 ? `${element.total}` : '-';
                const html = `<tr><td>${element.name}</td><td align="right">${signedTotal}</td></tr>`;
                table.insertAdjacentHTML('beforeend', html);
            });
        }
    }

    const logFavouriteName = function(preferredName, unpreferredName) {
        const username = document.getElementById("results-table-1-A").getAttribute('data-user');
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
            resetNames(nameElement1A, nameElement2A);
            nameElement1B.innerText = nameElement1A.innerText;
            nameElement2B.innerText = nameElement2A.innerText;
            buildResultsTable("results-table-1-A");
            buildResultsTable("results-table-2-A");
            buildResultsTable("results-table-1-B");
            buildResultsTable("results-table-2-B");
        }, 1000);
    }

    const nameElement1A = document.getElementById('name1-A');
    const nameElement2A = document.getElementById('name2-A');
    const nameElement1B = document.getElementById('name1-B');
    const nameElement2B = document.getElementById('name2-B');

    nameElement1A.addEventListener('click', () => logFavouriteName(nameElement1A, nameElement2A));
    nameElement2A.addEventListener('click', () => logFavouriteName(nameElement2A, nameElement1A));
    nameElement1B.addEventListener('click', () => logFavouriteName(nameElement1B, nameElement2B));
    nameElement2B.addEventListener('click', () => logFavouriteName(nameElement2B, nameElement1B));

    resetNames(nameElement1A, nameElement2A);
    nameElement1B.innerText = nameElement1A.innerText;
    nameElement2B.innerText = nameElement2A.innerText;

    buildResultsTable("results-table-1-A");
    buildResultsTable("results-table-2-A");
    buildResultsTable("results-table-1-B");
    buildResultsTable("results-table-2-B");

    document.getElementById('otherNameFormControl-A').addEventListener('change', e => {
        document.getElementById("results-table-2-A").setAttribute('data-user', e.target.value);
        buildResultsTable("results-table-2-A");
        document.getElementById("results-table-2-B").setAttribute('data-user', e.target.value);
        buildResultsTable("results-table-2-B");
    });

    document.getElementById('addNameButton').addEventListener('click', () => {
        $('#addNameModal').modal();

        document.getElementById('addNameModalButton').addEventListener('click', e => {
            e.preventDefault();
            if (e.target.form.name.value) {
                fetch(`/api/names/${e.target.form.name.value}`, { method: 'POST' });
                names.push(e.target.form.name.value);
            }
            $('#addNameModal').modal('hide');
            e.target.form.reset();
        });
    });

    document.getElementById('deleteNameButton').addEventListener('click', async () => {
        const formElement = document.querySelector('#deleteNameModalBody');
        formElement.innerHTML = '';
        names.sort().forEach(name => {
            formElement.insertAdjacentHTML('beforeend',
                `<div class="form-check">>
                    <input class="form-check-input" type="checkbox" value=""
                        id="deleteCheckBoxId-${name}">
                    <label class="form-check-label" for="deleteCheckBoxId-${name}">
                        ${name}
                    </label>
                </div>`
            );
        });

        document.getElementById('deleteNameModalButton').addEventListener('click', async e => {
            e.preventDefault();
            $('#deleteNameModal').modal('hide');
            for (const name of names) {
                if ($(`#deleteCheckBoxId-${name}`).prop('checked')) {
                    await fetch(`/api/names/${name}`, { method: 'DELETE' });
                    names.splice(names.findIndex(n => n === name), 1);
                }
            };
        });

        $('#deleteNameModal').modal();
    });

    document.getElementById('changePasswordButton').addEventListener('click', () => {
        $('#changePasswordModal').modal();

        document.getElementById('changePasswordModalButton').addEventListener('click', e => {
            e.preventDefault();

            const currentPassword = e.target.form.elements.currentPassword.value;
            const newPassword = e.target.form.elements.newPassword.value;

            if (currentPassword && newPassword) {
                fetch('/api/users', {
                    method: 'PATCH',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ currentPassword, newPassword})
                });
            }

            $('#changePasswordModal').modal('hide');
            e.target.form.reset();
        });
    });

    document.getElementById('addUserButton').addEventListener('click', () => {
        $('#addUserModal').modal();

        document.getElementById('addUserModalButton').addEventListener('click', e => {
            e.preventDefault();

            const username = e.target.form.elements.username.value;
            const password = e.target.form.elements.password.value;
            const role = e.target.form.elements.roleRadios.value;

            if (username && password && role) {
                fetch('/api/users', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ username, password, role})
                });
            }

            $('#addUserModal').modal('hide');
            e.target.form.reset();
        });
    });
});
