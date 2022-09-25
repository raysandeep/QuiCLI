const { exec } = require("child_process");

// const build = () => {
// 	exec("docker-compose up -d --build", (error, _, stdout) => {
// 		console.log("reaching here");
// 		if (error) {
// 			console.log(error);
// 			return false;
// 			// remove service from docker compose and build docker compose again
// 		} else {
// 			console.log(stdout);
// 			return true;
// 		}
// 	});
// };

const pull = (PAT, URL) => {
	exec(
		`git pull https://${PAT}:x-oauth-basic@${URL}`,
		(error, _, stdout) => {
			console.log("reaching here");
			if (error) {
				console.log(error);
				return false;
				// remove service from docker compose and build docker compose again
			} else {
				console.log(stdout);
				return true;
			}
		}
	);
};
module.exports = {pull};
