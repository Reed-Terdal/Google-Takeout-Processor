/**
 * Google Takeout Activity parser.
 * This program takes in the android activity html file from a google take out and parses it into a JSON object.
 *
 * It has to look at a specific section of the HTML document to find the set of data needed so if you edit the HTML file
 *  the program may crash or not be able to find the events. It was tested and working with an original file as of
 *  April 5th 2018
 *
 * The proper use is: node parser.js <input file> <output file>
 *     it will not start if it does not have the two additional arguments and will ignore any others
 *
 *  Author: Reed Terdal
 *  Github: https://github.com/Reed-Terdal
 *
 MIT License

 Copyright (c) 2018 Reed-Terdal

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */


let htmlparser = require("htmlparser2");
let fs = require('fs');


if(process.argv.length < 4)
{
	console.error("Not enough arguments,\nUsage: node parser.js <input filepath> <output filepath>");
	process.exit(1);
}

let inputFile = process.argv[2];
let outputFile = process.argv[3];


fs.readFile(inputFile, (err, result)=>
{
	if(err)
	{
		console.error(err);
		process.exit(1);
	}
	let dom = htmlparser.parseDOM(result);


	//If you are having problems with the program finding the data the line below can be modified to point to the data,
	//I recommend JetBrains WebStorm to pause execution and examine the dom object. If it is not finding it with the
	// original download you can post an issue on GitHub
	// and I will check to see if Google has changed their format
	let objects = dom["0"].children["1"].children["0"].children;



	let Actions = {
		events: []
	};

	objects.forEach(obj=>
	{
		//This shouldn't makes sure that we are only checking the valid data containers but may change if Google updates
		//  their format
		if(obj.attribs.class ===  "outer-cell mdl-cell mdl-cell--12-col mdl-shadow--2dp" && obj['children'] !== undefined && obj['children'].length > 0 && obj.name === "div" && obj.type === "tag")
		{
			let inner1 = obj['children'][0]['children'];
			let newEvent = buildEvent(inner1);
			if(newEvent !== null) Actions.events.push(newEvent);
		}
	});

	let text = JSON.stringify(Actions);

	fs.writeFile(outputFile, text, 'utf8', (err)=>
	{
		if(err)
		{
			console.error(err);
			process.exit(1);
		}
		console.log('Found ' + Actions.events.length + ' Events in ' + inputFile + ' and wrote them to ' + outputFile);
	});
});

/**
 * parses a html node for data to build an event
 * @param node The html node to be parsed
 * @returns {*} returns either a new Event object or null if there was an issue scanning the node
 */
function buildEvent(node)
{
	//This should be fine regardless if you have made small changes to the file
	let name = node[0]['children'][0]['children'][0]['data'];
	//In testing I found that the time was stored in one of two places for some reason, this will make sure that it is
	//  found.
	let time =  (node[1]['children'][3] === undefined) ? node[1]['children'][2]['data'] : node[1]['children'][3]['data'];
	let result = null;

	if(name !== undefined && time !== 0)
	{
		result = new Event(name, time);
	}
	return result;
}

/**
 * Event object, used to store relevant information about Android activity
 * @param Application The name of the app opened
 * @param dateString The time that the app was opened in human readable format
 * @constructor builds the Event
 *
 * Object Properties:
 * application: The name of the app opened
 * timestamp:   The time that the app was opened in a JS Date object
 * dateString:  The original text from the html document
 * time:        The milliseconds in the day that the app was opened, from 0,12AM, to 86400000, 11:59PM
 * toString:    Prints the name of the application and the dateString from the html document
 *
 */
function Event(Application, dateString)
{
	this.application = Application;
	this.timestamp = new Date(dateString);
	this.dateString = dateString;
	this.time = this.timestamp.getTime() % 86400000;
	this.toString = ()=>{return ("" + this.application + " : " + this.dateString)};
}
