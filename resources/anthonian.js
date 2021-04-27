/*****************************************
 *                                       *
 * Name: anthonian.js                    *
 * Description: Anthonian Helper Program *
 * Date: July 21, 2020                   *
 * Created by: Anthony Kung              *
 * Author URL: https://anth.dev          *
 * License: Apache-2.0 (See LICENSE.md)  *
 *                                       *
 *****************************************/

// Just to be nice
'use strict';

// Super Duper Pinkish Pink
let pink = '\x1b[38;2;255;20;147m';

// Colors
let ori = '\x1b[0m';
let red = '\x1b[91m';
let green = '\x1b[92m';
let yellow = '\x1b[93m';
let blue = '\x1b[94m';
let cyan = '\x1b[96m';

let prefix = '>_ ';

// Anth Dev
function anthdev() {
  console.log('\n\x1b[38;2;255;20;147m');
  console.log(' █████  ███    ██ ████████ ██   ██    ██████  ███████ ██    ██');
  console.log('██   ██ ████   ██    ██    ██   ██    ██   ██ ██      ██    ██');
  console.log('███████ ██ ██  ██    ██    ███████    ██   ██ █████   ██    ██');
  console.log('██   ██ ██  ██ ██    ██    ██   ██    ██   ██ ██       ██  ██ ');
  console.log('██   ██ ██   ████    ██    ██   ██ ██ ██████  ███████   ████  ');
  console.log('\n\x1b[0m');
}

/**
 * Name: Anthonian Print Function
 * Parameter: [string], [string/string array]
 * Return: Output to console
 */
function print(type, data) {
  let str = '';
  if (Array.isArray(data)) {
    data.forEach(function(element) {
      str.concat(' ' + element);
    });
  }
  else {
    str = data;
  }
  switch (type) {
    case 'err':
      console.error(red + prefix, 'ERROR:', str, ori);
      break;
    case 'warn':
      console.log(yellow + prefix, 'WARNING:', str, ori);
      break;
    case 'suc':
      console.log(green + prefix, 'SUCCESS:', str, ori);
      break;
    case 'prom':
      console.log(cyan + prefix, str, ori);
      break;
    case 'msg':
      console.log(blue + prefix, str, ori);
      break;
    case 'anth':
      console.log(pink + prefix, str, ori);
      break;
    default:
      console.log(type + prefix, str, ori);
  }
}

module.exports = {
  pink: pink,
  ori: ori,
  red: red,
  green: green,
  yellow: yellow,
  blue: blue,
  cyan: cyan,
  prefix: prefix,
  anthdev: anthdev,
  print: print
}