const yaml = require("js-yaml");
const json = require('json2yaml')
const fs = require("fs");
const path = require('path');
const { exec } = require('child_process');

const removeFromYml = (NAME) => {
	const YML = "docker-compose.yml";
	const obj = yaml.load(fs.readFileSync(YML, { encoding: "utf-8" }));
	delete obj.services[NAME];
    console.log(obj);
	yml = json.stringify(obj);
	fs.writeFileSync(YML,yml); 
};

module.exports = removeFromYml;