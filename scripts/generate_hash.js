const bcrypt = require('bcryptjs');

const raw_password = process.argv[2]

if (raw_password) {
    bcrypt.hash(raw_password, 10)
        .then(hash => console.log(hash))
        .catch(err => console.error(err));
}
