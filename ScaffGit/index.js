#!/usr/bin/env node

const chalk = require('chalk');
const CLI = require('clui');
const Spinner = CLI.Spinner;
const inquirer = require('inquirer');
const Preferences = require('preferences');
const GitHubApi = require('github');
const _ = require('lodash');
const git = require('simple-git')();
const fs = require('fs');
const files = require('./lib/files');
const shell = require('shelljs');

// Checks if current folder isn't already a git repo
if (files.directoryExists('.git')) {
	console.log(chalk.yellow('Already a git repository!'));
	process.exit();
}

const github = new GitHubApi({
	version: '3.0.0'
});

// Main git logic
githubAuth((err, authed) => {
	if (err) {
		switch (err.code) {
			case 401:
				console.log(chalk.red("Couldn't log you in. Please try again."));
				break;
			case 422:
				console.log(chalk.red('You already have an access token'));
				break;
		}
	}
	if (authed) {
		console.log(chalk.green('Successfully authenticated!'));
		createGithubRepo((err, url) => {
			if (err) {
				console.error('An error has occured when creating repo', err);
			}
			if (url) {
				setupLocalRepo(url, err => {
					if (!err) {
						const remote = url.replace(
							/git@github.com:/i,
							'https://github.com/'
						);
						console.log(chalk.green(`Remote: ${remote}`));
						console.log(chalk.green('All done!'));
					}
				});
			}
		});
	}
});

/********* GITHUB FUNCS/PROMPTS ************/

// Prompts user for github username/password
function getGithubCredentials(callback) {
	const questions = [
		{
			name: 'username',
			type: 'input',
			message: 'Enter your Github username or e-mail address: ',
			validate: function(value) {
				if (value.length) {
					return true;
				} else {
					return 'Please enter your username or e-mail address: ';
				}
			}
		},
		{
			name: 'password',
			type: 'password',
			message: 'Enter your password: ',
			validate: function(value) {
				if (value.length) {
					return true;
				} else {
					return 'Please enter your password';
				}
			}
		}
	];
	inquirer.prompt(questions).then(callback);
}

// Fetches oauth token from github
// Stores in /Users/[YOUR-USERNAME]/.config/preferences/ScaffGit.pref
// If token already exists in config, no need to refetch
function getGithubToken(callback) {
	const prefs = new Preferences('ScaffGit');

	if (prefs.github && prefs.github.token) {
		return callback(null, prefs.github.token);
	}

	getGithubCredentials(credentials => {
		const status = new Spinner('Authenticating you, please wait...');
		status.start();

		github.authenticate(
			_.extend(
				{
					type: 'basic'
				},
				credentials
			)
		);

		github.authorization.create(
			{
				scopes: ['user', 'public_repo', 'repo', 'repo:status'],
				note: 'ScaffGit: initialize a project & create a remote repo'
			},
			function(err, res) {
				status.stop();
				if (err) {
					return callback(err);
				}
				if (res.data.token) {
					prefs.github = {
						token: res.data.token
					};
					return callback(null, res.data.token);
				}
				return callback();
			}
		);
	});
}

function createGithubRepo(callback) {
	// Grabs defaults for name and description [<working directory>, null]
	const argv = require('minimist')(process.argv.slice(2));

	const questions = [
		{
			type: 'input',
			name: 'name',
			message: 'Enter a name for the repository',
			default: argv._[0] || files.getCurrentDirectoryBase(),
			validate: function(value) {
				if (value.length) {
					return true;
				} else {
					return 'Please enter a name for the repository';
				}
			}
		},
		{
			type: 'input',
			name: 'description',
			default: argv._[1] || null,
			message: 'Optionally enter a description of the respository: '
		},
		{
			type: 'list',
			name: 'visibility',
			message: 'Public or private: ',
			choices: ['public', 'private'],
			default: 'public'
		},
		{
			type: 'checkbox',
			name: 'templates',
			message: 'Choose what you want to include: ',
			choices: ['README', 'LICENSE', 'gitignore']
		},
		{
			type: 'list',
			name: 'lang',
			message: 'Choose lang: ',
			choices: ['JS', 'Python', 'Go', 'Cpp', 'Rust'],
			when: ({ templates }) => {
				return templates.includes('gitignore');
			}
		},
		{
			type: 'list',
			name: 'license',
			message: 'Choose license: ',
			choices: ['MIT', 'Apache', 'GNU'],
			when: ({ templates }) => {
				return templates.includes('LICENSE');
			}
		}
	];

	inquirer
		.prompt(questions)
		.then(({ license, templates, lang, name, description, visibility }) => {
			const status = new Spinner('Creating respository...');
			status.start();

			if (license) {
				console.log('Creating License..');
				createLicense(license);
			}

			if (templates.includes('README')) {
				console.log('Creating README..');
				createReadMe();
			}

			// If user wants a gitignore, chooses js and already has a package.json,
			// THEN if choose a license or already have one, update the package.json "license"
			if (lang) {
				console.log('Creating gitignore...');
				createIgnore(lang);
				if (
					lang === 'JS' &&
					files.checkLocalExistance('package.json') &&
					(license || files.checkLocalExistance('LICENSE.txt'))
				) {
					files.formatPackageJson(license);
				}
			}

			const data = {
				name: name,
				description: description,
				private: visibility === 'private'
			};

			github.repos.create(data, function(err, res) {
				status.stop();
				if (err) {
					return callback(err);
				}
				return callback(null, res.data.ssh_url);
			});
		});
}

// Set up local repo, make initial commit
function setupLocalRepo(url, callback) {
	const status = new Spinner('Setting up the repository...');
	status.start();

	// issue w/ ssh
	const urlHack = url.replace(/git@github.com:/i, 'https://github.com/');

	git
		.init()
		.add('./*')
		.commit('Initial commit')
		.addRemote('origin', urlHack)
		.push('origin', 'master')
		.exec(function() {
			status.stop();
			return callback();
		});
}

// Grab token and authenticate
function githubAuth(callback) {
	getGithubToken(function(err, token) {
		if (err) {
			return callback(err);
		}
		github.authenticate({
			type: 'oauth',
			token: token
		});
		return callback(null, token);
	});
}

/********* GITHUB FUNCS/PROMPTS END ************/

// Checks if the template passed as templateToCheck exists in the templates folder
// If exists, shell.cp copies and moves the template to the working directory
function checkTemplateExistance(templateToCheck) {
	const localPath = process.cwd();
	const templatePath = `${__dirname}/templates/${templateToCheck}`;
	if (fs.existsSync(templatePath)) {
		shell.cp('-R', `${templatePath}`, localPath);
	} else {
		console.log(chalk.red(`There is no ${templateToCheck} template`));
	}
}

/********** CREATE FUNCTIONS *************/

// Chooses gitignore for chosen language
// Renames to .gitignore
function createIgnore(lang) {
	const localPath = process.cwd();
	const ignorePath = `/git_ignore/${lang}.txt`;

	if (!files.checkLocalExistance('.gitignore')) {
		checkTemplateExistance(ignorePath);
		shell.mv(`${lang}.txt`, '.gitignore');
	}
}

// Chooses license for chosen license
// Renames to LICENSE.txt
function createLicense(licenseType) {
	const localPath = process.cwd();
	const licensePath = `licenses/${licenseType}.txt`;

	if (!files.checkLocalExistance('LICENSE.txt')) {
		checkTemplateExistance(licensePath);
		shell.mv(`${licenseType}.txt`, 'LICENSE.txt');
		files.formatLicense();
		if (licenseType === 'GNU') {
			console.log(
				chalk.yellow(
					'Make sure you add the project name at the bottom of the license!'
				)
			);
		}
	}
}

function createReadMe() {
	const localPath = process.cwd();
	if (!files.checkLocalExistance('README.md')) {
		checkTemplateExistance('README.md');
	}
}

/* moved to ./files
function checkLocalExistance(fileToCheck) {
	const localPath = process.cwd();
	if (fs.existsSync(`${localPath}/${fileToCheck}`)) {
		console.log(`You already have a ${fileToCheck}!`);
		return true;
	} else {
		console.log('file doesnt exist');
		return false;
	}
}
*/

/* moved to files
function formatLicense() {
	const options = {
		files: './LICENSE.txt',
		from: /(<year>)/g,
		to: String(new Date().getFullYear())
	};
	replace(options, (err, changedFiles) => {
		if (err) {
			return console.error('Error occurred when formatting License.txt:', err);
		}
	});
}
// Ref for github stuff
https://www.sitepoint.com/javascript-command-line-interface-cli-node-js/
*/
