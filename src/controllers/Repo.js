const { exec } = require("child_process");
const User = require("../models/User");
const Service = require("../models/Service");
const updateYaml = require("../function/updateYaml");
const addEnv = require("../function/addEnv");
const fs = require("fs");
const path = require("path");
const removeDir = require("../function/removeDir");
const { pull } = require("../function/build");
const mongoose = require("mongoose");
const axios = require("axios");
const removeFromYml = require("../function/removeFromYml");

exports.cloneRepo = (req, res, next) => {
	User.findOne()
		.then((resp) => {
			let buff2 = new Buffer(resp.password, "base64");
			let PAT = buff2.toString("ascii");
			let URL = req.body.url.replace("https://", "");
			let NAME = /[^/]*$/
				.exec(URL)[0]
				.replace(".git", "")
				.toLowerCase()
				.trim();
			let DATA = {
				env_file: `${NAME}/.env`,
				build: `./${NAME}`,
				image: NAME,
				ports: [`${req.body.port}:${req.body.port}`],
				labels: [
					`traefik.backend=${NAME}`,
					`traefik.frontend.rule=Host:${req.body.subdomain}`,
					`traefik.docker.network=web`,
					`traefik.port=${req.body.port}`,
				],
				networks: req.body.network,
			};

			exec(
				`git clone https://${PAT}:x-oauth-basic@${URL} ${NAME}`,
				(error, _, stdout) => {
					if (error) {
						console.log(error);
						res.status(500).json({
							error: error.message,
							stack_trace: error.stack,
						});
					} else {
						// if docker file does not exist in the default location in the repp -> send error & removeDir(req.body.service_name);
						if (
							!fs.existsSync(
								path.join(__dirname, `../../${NAME}/Dockerfile`)
							)
						) {
							removeDir(NAME);
							res.status(500).json({
								error: `Dockerfile not found. If your docker file is named anything other than "Dockerfile" and is not in the root directory of your project please provide a path to it in your ".env" file. using 'DOCKER_PATH'`,
							});
						} else {
							
							// get last commit
							commit = require("child_process")
								.execSync("git rev-parse HEAD", {
									cwd: path.join(__dirname, `../../${NAME}`),
								})
								.toString()
								.trim();
							// add service details to mongo
							let services = new Service({
								_id: mongoose.Types.ObjectId(),
								name: NAME,
								commit,
								port: req.body.port,
							});
							services
								.save()
								.then((resp) => {
									console.log(resp)
									// build needs to be added;
								})
								.catch((e) => {
									console.log(e);
									res.send(e);
								});
							
							updateYaml(NAME, DATA); // update yml
							addEnv(req.body.env, NAME); // add env file to cloned repo
							res.send({message: 'done'})
						}
					}
				}
			);
		})
		.catch((err) => {
			console.log(err);
			res.status(400).json({
				error: err,
			});
		});
};

exports.removeService = (req, res, next) => {
	// find service from db, if found edit docker compose and call removeDir
	let NAME = /[^/]*$/
		.exec(req.body.url)[0]
		.replace(".git", "")
		.toLowerCase()
		.trim();
	if (NAME === "mongo")
		return res.status(400).json({
			error: "cannot delete mongo",
		});
	Service.deleteOne({ name: NAME })
		.then((resp) => {
			removeFromYml(NAME);
			removeDir(NAME);
			// build needs to be added;
			res.status(200).json({
				resp,
			});
		})
		.catch((e) => {
			res.send(e);
		});
};


// exports.deploy = async (req, res, next) => {
// 	try {
// 		const resp = await axios.post("http://52.66.4.150:9000/deploy");
// 		console.log(resp);
// 	} catch (e) {
// 		console.error(err);
// 	}
// };

// exports.configureCloudflare = (req, res, next) => {
// 	var data = JSON.stringify({
// 		type: "A",
// 		name: req.body.name,
// 		content: req.body.ip,
// 		ttl: 120,
// 		proxied: false,
// 	});

// 	var config = {
// 		method: "post",
// 		url: `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE}/dns_records`,
// 		headers: {
// 			"X-Auth-Email": process.env.CLOUDFLARE_EMAIL,
// 			"X-Auth-Key": process.env.CLOUDFLARE_API_KEY,
// 			"Content-Type": "application/json",
// 		},
// 		data: data,
// 	};

// 	axios(config)
// 		.then(function (response) {
// 			console.log(JSON.stringify(response.data));
// 			res.staus(200).json({ message: "Added Succesfully!" });
// 		})
// 		.catch(function (error) {
// 			console.log(error);
// 			res.staus(500).json({ message: "Error!" });
// 		});
// };

exports.cicd = (req, res, next) => {
	// // input -> req.body.url, req.body.pat
	let NAME = /[^/]*$/
		.exec(req.body.url)[0]
		.replace(".git", "")
		.toLowerCase()
		.trim();
	exec(`git pull https://${req.body.pat}:x-oauth-basic@${req.body.url}`,{cwd: `${NAME}`}, (error, _, stdout) => {
		if (error) {
			console.log(error);
			res.status(500).json({ error });
		}
		else {
			console.log(stdout);
			res.status(200).json({ message: "code up to date" });
		}
	});
};

//  create a route to update latest commit in service -> for cicd

exports.verifyPort = (req, res, next) => {
	if (req.body.port === 3000)
		return res.status(200).json({ avialable: false });
	Service.findOne({ port: req.body.port })
		.then((resp) => {
			if (!resp) res.status(200).json({ avialable: true });
			else res.status(200).json({ avialable: false });
		})
		.catch((e) => res.status(500).json(e));
};

exports.getServices = (req, res, next) => {
	Service.find()
		.then((resp) => {
			res.status(200).json(resp);
		})
		.catch((e) => {
			res.status(500).json(e);
		});
};

exports.mongo = (req, res, next) => {
	Service.findOne({ name: "mongo" }).then((resp) => {
		if (!resp) {
			Service.save({
				_id: mongoose.Types.ObjectId(),
				name: "mongo",
				commit: "",
				port: 27017,
			})
				.then((resp2) => {
					res.status(200).json(resp2);
				})
				.catch((e) => {
					res.status(500).json(e);
				});
		}
	});
};

exports.pipeDockerOut = (req, res, next) => {
	exec("docker ps -a", (error, _, stdout) => {
		if (error) {
			res.send(error);
		}
		console.log(`output: ${stdout}`);
		res.send(stdout);
	});
};
