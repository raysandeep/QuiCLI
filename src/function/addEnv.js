const fs = require("fs");
const path = require('path');

const updateENV = (DATA,NAME) => {
        const loc = path.join(__dirname, `../../${NAME}/.env`);
        fs.writeFileSync(loc,DATA);
}

module.exports = updateENV;
