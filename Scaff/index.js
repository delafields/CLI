#!/usr/bin/env node

'use strict';

const chalk = require('chalk');
const clear = require('clear');
const inquirer = require('inquirer');
const fs = require('fs');
const shell = require('shelljs');
const files = require('./lib/files');

clear();

// Choose lang and what to include
function start() {
	const questions = [
		{
			type: 'checkbox',
			name: 'templates',
			message: 'Choose what you want to include: ',
			choices: ['README', 'LICENSE', 'git']
		},
		{
			type: 'list',
			name: 'license',
			message: 'Choose license: ',
			choices: ['MIT', 'Apache', 'GNU'],
			when: ({ templates }) => {
				return templates.includes('LICENSE');
			}
		},
		{
			type: 'list',
			name: 'lang',
			message: 'Choose lang: ',
			choices: ['JS', 'Python', 'Go', 'Cpp', 'Rust'],
			when: ({ templates }) => {
				return templates.includes('git');
			}
		}
	];
	inquirer.prompt(questions).then(({ templates, license, readMe, lang }) => {
		if (license) {
			console.log('Creating License...');
			createLicense(license);
		}
		if (templates.includes('README')) {
			console.log('Creating README...');
			createReadMe(readMe);
		}
		if (lang) {
			console.log('Creating gitignore...');
			createIgnore(lang);
			// If user wants a gitignore, chooses js and already has a package.json,
			// THEN if choose a license or already have one, update the package.json "license"
			if (
				lang === 'JS' &&
				files.checkLocalExistance('package.json') &&
				(license || files.checkLocalExistance('LICENSE.txt'))
			) {
				files.formatPackageJson(license);
			}
		}
	});
}

start();

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
