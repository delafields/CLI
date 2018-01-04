var states = require('./states');
var AutoComplete = require('prompt-autocompletion');
var autocomplete = new AutoComplete({
	type: 'autocomplete',
	name: 'from',
	message: 'Select a state to travel from',
	source: searchStates
});

// promise
autocomplete.run().then(function(answer) {
	console.log(answer);
});

// or async
autocomplete.ask(function(answer) {
	console.log(answer);
});

function searchStates(answers, input) {
	return new Promise(function(resolve) {
		resolve(states.filter(filter(input)));
	});
}

function filter(input) {
	return function(state) {
		return new RegExp(input, 'i').exec(state) !== null;
	};
}

