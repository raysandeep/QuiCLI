const yaml = require("js-yaml");
const json = require('json2yaml')
const fs = require("fs");
const path = require('path');
const { exec } = require('child_process');

// function getRandomInt(min, max) {
// 	min = Math.ceil(min);
// 	max = Math.floor(max);
// 	return Math.floor(Math.random() * (max - min + 1)) + min;
// }

const updateYaml = (NAME,DATA) => {
	const loc = path.join(__dirname, `../../${NAME}/docker-compose.yml`);
	
	if(fs.existsSync(loc)) {
		// const YML = "docker-compose.yml";
		// const obj = yaml.load(fs.readFileSync(YML, { encoding: "utf-8" }));
		// const obj_sub = yaml.load(fs.readFileSync(loc, { encoding: "utf-8" }));
		// let service_list = Object.keys(obj_sub.services)
		// obj.services[NAME] = {
		// 	extends: {
		// 		file: `./${NAME}/docker-compose.yml`,
		// 		services: service_list
		// 	}
		// };
		// yml = json.stringify(obj);
		// fs.writeFileSync(YML,yml);
	}
	else {
		const YML = "docker-compose.yml";
		const obj = yaml.load(fs.readFileSync(YML, { encoding: "utf-8" }));
		obj.services[NAME] = DATA;
		yml = json.stringify(obj);
		fs.writeFileSync(YML,yml); // update docker-compose.yml
	}
};

module.exports = updateYaml;
