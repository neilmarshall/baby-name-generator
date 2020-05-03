export function buildAddNameEventHandler(names: string[]) {
    document.getElementById('addNameButton')!.addEventListener('click', () => {
        $('#addNameModal').modal();

        document.getElementById('addNameModalButton')!.addEventListener('click', e => {
            e.preventDefault();
            const name = (<HTMLInputElement>e.target).form!["nameToAdd"].value;
            if (name) {
                fetch(`/api/names/${name}`, { method: 'POST' });
                names.push(name);
            }
            $('#addNameModal').modal('hide');
            (<HTMLInputElement>e.target).form!.reset();
        });
    });
}

export function buildDeleteNameEventHandler(names: string[]) {
    document.getElementById('deleteNameButton')!.addEventListener('click', async () => {
        const formElement = document.querySelector('#deleteNameModalBody');
        formElement!.innerHTML = '';
        names.sort().forEach(name => {
            formElement!.insertAdjacentHTML('beforeend',
                `<div class="form-check">>
                    <input class="form-check-input" type="checkbox" value=""
                        id="deleteCheckBoxId-${name}">
                    <label class="form-check-label" for="deleteCheckBoxId-${name}">
                        ${name}
                    </label>
                </div>`
            );
        });

        document.getElementById('deleteNameModalButton')!.addEventListener('click', async e => {
            e.preventDefault();
            $('#deleteNameModal').modal('hide');
            let namesToDelete = []
            for (const name of names) {
                if ($(`#deleteCheckBoxId-${name}`).prop('checked')) {
                    await fetch(`/api/names/${name}`, { method: 'DELETE' });
                    namesToDelete.push(name);
                }
            };
            for (const name of namesToDelete) {
                names.splice(names.findIndex(n => n === name), 1);
            }
        });

        $('#deleteNameModal').modal();
    });
}

export function buildChangePasswordEventHandler() {
    document.getElementById('changePasswordButton')!.addEventListener('click', () => {
        $('#changePasswordModal').modal();

        document.getElementById('changePasswordModalButton')!.addEventListener('click', e => {
            e.preventDefault();

            const currentPassword = (<HTMLInputElement>e.target).form!["currentPassword"].value;
            const newPassword = (<HTMLInputElement>e.target).form!["newPassword"].value;

            if (currentPassword && newPassword) {
                fetch('/api/users', {
                    method: 'PATCH',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ currentPassword, newPassword})
                });
            }

            $('#changePasswordModal').modal('hide');
            (<HTMLInputElement>e.target).form!.reset();
        });
    });

}

export function buildAddUserEventHandler() {
    if (document.getElementById('addUserButton')) {
        document.getElementById('addUserButton')!.addEventListener('click', () => {
            $('#addUserModal').modal();

            document.getElementById('addUserModalButton')!.addEventListener('click', e => {
                e.preventDefault();

                const username = (<HTMLInputElement>e.target).form!["username"].value;
                const password = (<HTMLInputElement>e.target).form!["password"].value;
                const role = (<HTMLInputElement>e.target).form!["roleRadios"].value;

                if (username && password && role) {
                    fetch('/api/users', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ username, password, role})
                    });
                }

                $('#addUserModal').modal('hide');
                (<HTMLInputElement>e.target).form!.reset();
            });
        });
    }
}
