const fs = require('fs');
const path = require('path');
const replace = require('replace-in-file');
const chalk = require('chalk');

module.exports = {
	// name of the directory we'll be working in (as this util is global),
	// not where these files reside
	getCurrentDirectoryBase: () => {
		return path.basename(process.cwd());
	},

	// Checks whether a file or directory exists
	directoryExists: filePath => {
		try {
			return fs.statSync(filePath).isDirectory();
		} catch (err) {
			return false;
		}
	},
	// Checks is local file exists (my version)
	checkLocalExistance: fileToCheck => {
		const localPath = process.cwd();
		if (fs.existsSync(`${localPath}/${fileToCheck}`)) {
			console.log(chalk.yellow(`You already have a ${fileToCheck}!`));
			return true;
		} else {
			return false;
		}
	},
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
