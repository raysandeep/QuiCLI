const fs = require("fs")
const Path = require("path")

const removeDir = function(NAME) {
  const path = Path.join(__dirname, `../../${NAME}`);
  fs.rmdirSync(path, { recursive: true });
}

module.exports = removeDir;
