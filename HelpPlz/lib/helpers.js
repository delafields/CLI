const opn = require('opn');
const docs = require('./docs');
const _ = require('lodash');
const fuzzy = require('fuzzy');
const Promise = require('promise');

// Fuzzy autocompleter for docs
function searchDocs(answers, input) {
	input = input || '';
	return new Promise(resolve => {
		setTimeout(() => {
			const fuzzyResult = fuzzy.filter(input, Object.keys(docs));
			resolve(
				fuzzyResult.map(el => {
					return el.original;
				})
			);
		}, _.random(30, 500));
	});
}

// Takes args, formats & opens a google search
function googleSearch(searchFor) {
	const query = searchFor.join('+');
	const url = `https://www.google.com/search?q=${query}`;
	opn(url, { app: ['google chrome'] });
	console.log('Google search opened');
	process.exit();
}

// Takes args, formats & opens a stack overflow search
function stackOverflowSearch(searchFor) {
	const query = searchFor.join('+');
	const url = `https://stackoverflow.com/questions/tagged/${query}`;
	opn(url, { app: ['google chrome'] });
	console.log('Stackoverflow search opened');
	process.exit();
}

// Takes args, formats & opens a npm search
function npmSearch(searchFor) {
	const query = searchFor.join('%20');
	const url = `https://www.npmjs.com/search?q=%20${query}&page=1&ranking=optimal`;
	opn(url, { app: ['google chrome'] });
	console.log('NPM search opened');
	process.exit();
}

// Takes args, opens in npm
function npmPackage(packageName) {
	const url = `https://www.npmjs.com/package/${packageName}`;
	opn(url, { app: ['google chrome'] });
	console.log('NPM package opened');
	process.exit();
}

// Various synonyms for the search comand
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

const npmSearchSynonyms = [
	'npm',
	'npm-module',
	'npm package',
	'-npm package',
	'--npm package',
	'npm -p',
	'-npm-p',
	'--npm-p'
];

module.exports = {
	googleSearch,
	googleSynonyms,
	stackOverflowSearch,
	stackOverflowSynonyms,
	npmSearch,
	npmSearchSynonyms,
	npmPackage,
	searchDocs
};
