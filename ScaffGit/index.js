#!/usr/bin/env node

const chalk = require('chalk');
const clear = require('clear');
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

clear();

// Checks if current folder isn't already a git repo
if (files.directoryExists('.git')) {
	console.log(chalk.yellow('Already a git repository!'));
	processs.exit();
}

const github = new GitHubApi({
	version: '3.0.0'
});

// Prompts user for github credentials
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

// Github oauth token
function getGithubToken(callback) {
	const prefs = new Preferences('ScaffGit');

	if (prefs.github && prefs.github.token) {
		return callback(null, prefs.github.token);
	}

	// Fetch token
	getGithubCredentials(function(credentials) {
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
				note: 'Scaff: initialize a project & create a remote repo'
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

function createRepo(callback) {
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

	inquirer.prompt(questions).then(function(answers) {
		const status = new Spinner('Creating respository...');
		status.start();

		if (answers.license) {
			console.log('Creating License..');
			createLicense(answers.license);
		}
		if (answers.templates.includes('README')) {
			console.log('Creating README..');
			createReadMe(answers.readMe);
		}
		if (answers.lang) {
			console.log('Creating gitignore...');
			createIgnore(answers.lang);
			if (
				answers.lang === 'JS' &&
				files.checkLocalExistance('package.json') &&
				(answers.license || files.checkLocalExistance('LICENSE.txt'))
			) {
				files.formatPackageJson(answers.license);
			}
		}

		const data = {
			name: answers.name,
			description: answers.description,
			private: answers.visibility === 'private'
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

// Set up the git repo
function setupRepo(url, callback) {
	const status = new Spinner('Setting up the repository...');
	status.start();

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

// Obtain token and authenticate user
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

// Main logic
githubAuth(function(err, authed) {
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
		createRepo(function(err, url) {
			if (err) {
				console.error('An error has occured when creating repo', err);
			}
			if (url) {
				setupRepo(url, function(err) {
					if (!err) {
						console.log(chalk.green('All done!'));
					}
				});
			}
		});
	}
});

function checkTemplateExistance(templateToCheck) {
	const localPath = process.cwd();
	const templatePath = `${__dirname}/templates/${templateToCheck}`;
	if (fs.existsSync(templatePath)) {
		shell.cp('-R', `${templatePath}`, localPath);
	} else {
		console.log(chalk.red(`There is no ${templateToCheck} template`));
	}
}

function createIgnore(lang) {
	const localPath = process.cwd();
	const ignorePath = `/git_ignore/${lang}.txt`;

	if (!files.checkLocalExistance('.gitignore')) {
		checkTemplateExistance(ignorePath);
		shell.mv(`${lang}.txt`, '.gitignore');
	}
}

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
	const licensePath = './templates/README.md';
	if (!files.checkLocalExistance('README.md')) {
		checkTemplateExistance('README.md');
	}
}

/* moved to files
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
