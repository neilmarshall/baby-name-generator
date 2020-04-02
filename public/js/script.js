document.addEventListener('DOMContentLoaded', async () => {

    const { names } = await fetch("../names.json")
        .then(response => response.json());

    const name1 = document.getElementById('name1');
    const name2 = document.getElementById('name2');
});
