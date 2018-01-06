#!/usr/bin/env node

'use strict';
const inquirer = require('inquirer');
const opn = require('opn');
const program = require('commander');
const chalk = require('chalk');
const docs = require('./lib/docs');
const {
	googleSearch,
	googleSynonyms,
	stackOverflowSearch,
	stackOverflowSynonyms,
	npmSearch,
	npmSearchSynonyms,
	npmPackage,
	searchStates
} = require('./lib/helpers');

program
	.version('0.0.1')
	.description('Open docs, or search[Google, npm, Stack Overflow]');

/**
   Search functionality for google, npm, stack overflow
**/
program
	.command('search <where> [searchFor...]')
	.alias('s')
	.description('Opens a search in Google Chrome')
	.action((where, searchFor) => {
		if (googleSynonyms.includes(where.toLowerCase())) {
			googleSearch(searchFor);
		}
		if (stackOverflowSynonyms.includes(where.toLowerCase())) {
			stackOverflowSearch(searchFor);
		}
		if (npmSearchSynonyms.includes(where.toLowerCase())) {
			npmSearch(searchFor);
		}
	});

/**
   Open npm package functionality
**/
program
	.command('npm-package <packageName>')
	.alias('npm')
	.description('Open a npm package in Chrome')
	.action(packageName => {
		npmPackage(packageName);
	});

/**
   Open docs autocompleter
**/
program
	.command('docs')
	.alias('d')
	.description('Opens documentation')
	.action(() => {
		inquirer.registerPrompt(
			'autocomplete',
			require('inquirer-autocomplete-prompt')
		);
		inquirer
			.prompt([
				{
					type: 'autocomplete',
					name: 'state',
					message: 'Select a state to travel from',
					source: searchStates
				}
			])
			.then(answers => {
				console.log(JSON.stringify(answers, null, 2));
				console.log(docs[answers.state]);
				process.exit();
			});
	});

/**
   Custom help flag
**/
program.on('--help', () => {
	console.log('');
	console.log(chalk.yellow.bold('  Argument synonyms:'));
	console.log(chalk.bold('    search:') + chalk.white.bgBlack(' <where>'));
	console.log(chalk.red.bold('    Google: ') + googleSynonyms.join(', '));
	console.log(
		chalk.red.bold('    Stack Overflow: ') + stackOverflowSynonyms.join(', ')
	);
	console.log(chalk.red.bold('    NPM: ') + npmSearchSynonyms.join(', '));
	console.log('');
	console.log(chalk.yellow.bold('  Examples:'));
	console.log(
		chalk.bold('    search:') +
			chalk.white.bgBlack(' <where>') +
			' is either google, npm, or stack overflow'
	);
	console.log(
		chalk.red.bold('            Ex: helpplz search so python strings')
	);
	console.log(
		chalk.red('        (searches Stack Overflow for python strings)')
	);
	console.log('');
	console.log(
		chalk.bold('    npm-package:') +
			chalk.white.bgBlack(' <packageName>') +
			' is the correct name of an existing package'
	);
	console.log(chalk.red.bold('            Ex: helpplz npm chalk'));
	console.log(chalk.red('        (opens package in npmjs.com)'));
	console.log('');
	console.log(
		chalk.bold('    docs:') +
			' Opens an autocompleter for various documentations'
	);
	console.log(chalk.bold.red('          Ex: Python3 strings'));
	console.log(
		chalk.red('    (Best Practice: type a <language> then a <method>)')
	);

	console.log('');
});

program.parse(process.argv);
