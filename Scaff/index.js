#!/usr/bin/env node

'use strict';

const chalk = require('chalk');
const clear = require('clear');
const CLI = require('clui');
const Spinner = CLI.Spinner;
const inquirer = require('inquirer');
const fs = require('fs');
const shell = require('shelljs');
const files = require('./lib/files');

clear();

// Choose lang and what to include
function start(callback) {
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
	inquirer.prompt(questions).then(answers => {
		console.log(answers);
		if (answers.license) {
			console.log('Creating License...');
			createLicense(answers.license);
		}
		if (answers.templates.includes('README')) {
			console.log('Creating README...');
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
	});
}

start('yo');

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
