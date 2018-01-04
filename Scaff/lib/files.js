const fs = require('fs');
const path = require('path');
const replace = require('replace-in-file');
const chalk = require('chalk');

module.exports = {
	// Checks if file exists in working directory (as this is global),
	// not *this* directory
	checkLocalExistance: fileToCheck => {
		const localPath = process.cwd();
		if (fs.existsSync(`${localPath}/${fileToCheck}`)) {
			console.log(chalk.yellow(`You already have a ${fileToCheck}!`));
			return true;
		} else {
			return false;
		}
	},
	// Add current year to License
	formatLicense: () => {
		const options = {
			files: './LICENSE.txt',
			from: /(<year>)/g,
			to: String(new Date().getFullYear())
		};
		replace(options, (err, changedFiles) => {
			if (err) {
				return console.error(
					'Error occurred when formatting License.txt:',
					err
				);
			}
		});
	},
	// Changes "license" in package.json to the type of license chosen through prompts
	formatPackageJson: licenseType => {
		const options = {
			files: './package.json',
			from: /("license": "[a-zA-Z]*")/g,
			to: `"license": "${licenseType}"`
		};
		replace(options, (err, changedFiles) => {
			if (err) {
				return console.error(
					'Error occurred when formatting package.json',
					err
				);
			}
		});
	}
};
