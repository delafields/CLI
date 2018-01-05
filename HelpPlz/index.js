#!/usr/bin/env node

'use strict';
const inquirer = require('inquirer');
const opn = require('opn');
const program = require('commander');
const chalk = require('chalk');
const {
	googleSearch,
	googleSynonyms,
	stackOverflowSearch,
	stackOverflowSynonyms,
	npmSearch,
	npmSynonyms,
	searchStates
} = require('./logic');

program
	.version('0.0.1')
	.description('Open docs, or search[Google, npm, Stack Overflow]');

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
		if (npmSynonyms.includes(where.toLowerCase())) {
			npmSearch(searchFor);
		}
	});

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
				console.log(test[answers.state]);
				process.exit();
			});
	});

program.on('--help', () => {
	console.log('');
	console.log(chalk.yellow.bold('  Examples:'));
	console.log(
		chalk.bold('    search:') +
			chalk.white.bgBlack(' <where>') +
			' is either google, npm, or stack overflow (synonyms included)'
	);
	console.log(
		chalk.red.bold('            Ex: helpplz search so python strings')
	);
	console.log(
		chalk.red('        (searches Stack Overflow for python strings)')
	);
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

/* A MUCH less ugly version of the help output above :D
console.log('');
console.log('  Examples:');
console.log(
	'    search: <where> is either google, npm, or stack overflow (synonyms included)'
);
console.log('            Ex: helpplz search so python strings');
console.log('        (searches Stack Overflow for python strings)');
console.log('');
console.log('    docs: Opens an autocompleter for various documentations');
console.log('          Best Practice: type a <language> then a <method>');
console.log('                     ex: Python3 strings');
console.log('');
*/
