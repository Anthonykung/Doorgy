/**************************************************
 *                                                *
 * Name: config.js                                *
 * Description: Anthonian Config Utility          *
 * Date: July 19, 2020                            *
 * Created by: Anthony Kung                       *
 * Business URL: https://hailiga.org/anthonykung  *
 * Author URL: https://anth.dev                   *
 * License: Apache-2.0 (See /docs/LICENSE.md)     *
 *                                                *
 **************************************************/

// Just to be nice
'use strict';

// Node.js Modules
const anth = require('./anthonian.js');
const fs = require('fs');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Variables
var config = {
  "version": 0
};

// Intro
function intro() {
  anth.anthdev();
  console.log('\n' + anth.blue + '');
  console.log(anth.prefix + 'Welcome to Anthonian Config Utility!');
  console.log(anth.prefix + 'Find up to date information on Anthonian.dev!');
  console.log(anth.prefix + 'Let\'s get you familiarize with this');
};

// Basic Commands
function cmd() {
  console.log('\n>_ Basic Commands & Scripts\n');
  console.log(anth.prefix + 'npm install -- Display man page');
  console.log(anth.prefix + 'npm start -- Starts the program');
  console.log(anth.prefix + 'npm test -- Starts the in test mode, displaying logs on terminal');
  console.log(anth.prefix + 'npm stop -- Stops the program');
  console.log(anth.prefix + 'npm run config -- Starts configuration process');
};

// Color Coding
function colors() {
  console.log('\n>_ Color Coding\n' + anth.ori + '');
  console.log(anth.prefix + '' + anth.red + 'RED' + anth.ori + ' -- Error, user action required');
  console.log(anth.prefix + '' + anth.yellow + 'YELLOW' + anth.ori + ' -- Warning, user action not required');
  console.log(anth.prefix + '' + anth.green + 'GREEN' + anth.ori + ' -- Success, no further action required');
  console.log(anth.prefix + '' + anth.cyan + 'CYAN' + anth.ori + ' -- Prompt, user input required');
  console.log(anth.prefix + '' + anth.blue + 'BLUE' + anth.ori + ' -- Information, no action required');
  console.log(anth.prefix + '' + anth.pink + 'PINK' + anth.ori + ' -- Anthonian Message, action maybe required');
  console.log(anth.prefix + '' + anth.ori + 'WHITE' + anth.ori + ' -- All Others, messages from Node.js or NPM or uncategorized');
  console.log('\n' + anth.blue + anth.prefix + 'Alright, that\'t all for now. If you need more help, try ' + anth.pink + 'npm run man\n' + anth.ori + '');
};

// Setting Username
const getUsername = () => {
  return new Promise((resolve, reject) => {
    readline.question(`\n` + anth.cyan + `>_ Username: (Strawberry) ` + anth.ori, ans => {
      if (ans != '') {
        config.username = ans;
      }
      else {
        config.username = 'Strawberry';
      }
      console.log('' + anth.blue + anth.prefix + 'Username set to:', config.username, '' + anth.ori + '\n');
      resolve();
    });
  });
};

// Setting Password
const getPassword = () => {
  return new Promise((resolve, reject) => {
    readline.question(anth.cyan + `>_ Password: (Doorgy) ` + anth.ori, ans => {
      if (ans != '') {
        config.password = ans;
      }
      else {
        config.password = 'Doorgy';
      }
      console.log('' + anth.blue + anth.prefix + 'Password set to:', config.password, '' + anth.ori + '\n');
      resolve();
    });
  });
};

// Primary Control Function
const control = async () => {

  // Wait for user inputs
  await getUsername();
  await getPassword();

  // Close user I/O
  readline.close();

  // Write results to file - overwrite any existing contents
  fs.writeFile(__dirname + '/../config.json', JSON.stringify(config, null, 2), function (err) {
    if (err) {
      console.log('\n\x1b[91m>_ ANTHONIAN ERROR: Unable to write config.json' + anth.ori + '\n');
      throw err;
    }
    console.log('\n' + anth.green + anth.prefix + 'Configuration file successfully written!' + anth.ori + '\n');
    console.log('\n' + anth.blue + anth.prefix + 'Dont forget to run ' + anth.pink + 'sudo npm install' + anth.blue + 'to install service' + anth.ori + '\n');
    console.log(anth.blue + anth.prefix + 'And ' + anth.pink + 'sudo systemctl enable doorgy' + anth.blue + 'to enable service' + anth.ori + '\n');
    console.log(anth.blue + anth.prefix + 'Restart or use ' + anth.pink + 'sudo systemctl start doorgy' + anth.blue + 'to start service' + anth.ori + '\n');
  });
};

// Operations
intro();
setTimeout(cmd, 5000);
setTimeout(colors, 10000);
setTimeout(control, 15000);
