export function buildAddNameEventHandler(names) {
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
}

export function buildDeleteNameEventHandler(names) {
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
}

export function buildChangePasswordEventHandler() {
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

}

export function buildAddUserEventHandler() {
    if (document.getElementById('addUserButton')) {
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
    }
}
