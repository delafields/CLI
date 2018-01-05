const opn = require('opn');
const test = require('./test');
const _ = require('lodash');
const fuzzy = require('fuzzy');
const Promise = require('promise');

function searchStates(answers, input) {
	input = input || '';
	return new Promise(resolve => {
		setTimeout(() => {
			const fuzzyResult = fuzzy.filter(input, Object.keys(test));
			resolve(
				fuzzyResult.map(el => {
					return el.original;
				})
			);
		}, _.random(30, 500));
	});
}

function googleSearch(searchFor) {
	const query = searchFor.join('+');
	const url = `https://www.google.com/search?q=${query}`;
	opn(url, { app: ['google chrome'] });
	console.log('Google search opened');
	process.exit();
}

function stackOverflowSearch(searchFor) {
	const query = searchFor.join('+');
	const url = `https://stackoverflow.com/questions/tagged/${query}`;
	opn(url, { app: ['google chrome'] });
	console.log('Stackoverflow search opened');
	process.exit();
}

function npmSearch(packageName) {
	const url = `https://www.npmjs.com/package/${packageName}`;
	opn(url, { app: ['google chrome'] });
	console.log('NPM search opened');
	process.exit();
}

const googleSynonyms = ['google', '-g', '-google', '--g', 'goog'];

const stackOverflowSynonyms = [
	'stack',
	'-stack',
	'--stack',
	'stackoverflow',
	'-stackoverflow',
	'--stackoverflow',
	'stack overflow',
	'-stack overflow',
	'--stack overflow'
];

const npmSynonyms = ['npm', '-npm', '--npm'];

module.exports = {
	googleSearch,
	googleSynonyms,
	stackOverflowSearch,
	stackOverflowSynonyms,
	npmSearch,
	npmSynonyms,
	searchStates
};
