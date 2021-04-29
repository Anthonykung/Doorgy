/****************************************
 *                                      *
 * Name: doorgy.js                      *
 * Description: Doorgy - Smart Pet Door *
 * Date: April 16, 2021                 *
 * Created by: Anthony Kung             *
 * Author URL: https://anth.dev         *
 * License: Apache-2.0 (See LICENSE.md) *
 *                                      *
 ****************************************/

// Include Packages
const gpio = require('onoff').Gpio;
const fs = require('fs');
const anth = require('./resources/anthonian.js');
const { execSync, spawn } = require('child_process');
const http = require('http');

anth.anthdev();
anth.print('msg', 'Starting Doorgy Service');

// Define Global Constant
const server = 'doorgy.anth.dev';

// Define Global Variable
let ctrlSig = 1;
let printNum = 0;

// Define IR gpio
const IR_INT = new gpio(5, 'in', 'both');
const IR_EXT = new gpio(6, 'in', 'both');

// Define Buttons
const PSH_BTN1 = new gpio(20, 'in', 'rising', {debounceTimeout: 100});
const PSH_BTN2 = new gpio(21, 'in', 'rising', {debounceTimeout: 100});
const PSH_BTN3 = new gpio(26, 'in', 'rising', {debounceTimeout: 100});

// Define LED gpio
const LED_PWR = new gpio(12, 'out');
const LED_NET = new gpio(13, 'out');
const LED_LCK = new gpio(16, 'out');
const LED_ERR = new gpio(19, 'out');

anth.print('suc', 'GPIO Defined');
LED_PWR.writeSync(0);
LED_NET.writeSync(0);
LED_LCK.writeSync(0);
LED_ERR.writeSync(0);

// Turn on power indicator
LED_PWR.writeSync(1);

// Define Interial IR Function
IR_INT.watch((err, value) => {
  if (err) {
    throw err;
  }
  else if (value) {
    // Inform Servo Unit montion is detected
    console.log('IR_INT Sense', value);
    LED_ERR.writeSync(1);
  }
  else {
    // Inform Servo Unit no motion is detected
    console.log('IR_INT Not Sense', value);
    LED_ERR.writeSync(0);
  }
});

// Define Interial IR Function
IR_EXT.watch((err, value) => {
  if (err) {
    throw err;
  }
  else if (value) {
    // Inform Servo Unit montion is detected
    console.log('IR_EXT Sense', value);
    LED_ERR.writeSync(1);
  }
  else {
    // Inform Servo Unit no motion is detected
    console.log('IR_EXT Not Sense', value);
    LED_ERR.writeSync(0);
  }
});

// Simulate Lock On
PSH_BTN2.watch((err, value) => {
  if (err) {
    throw err;
  }
  else if (value) {
    // Turn on Lock indicator
    console.log('Lock Sense', value);
    LED_LCK.writeSync(1);
    setTimeout(() => {
      console.log('Lock Release');
      LED_LCK.writeSync(0);
    }, 2000);
  }
  else {
    // Turn off Lock indicator
    console.log('Lock Not Sense', value);
    LED_LCK.writeSync(0);
  }
});

// Simulate Error
PSH_BTN3.watch((err, value) => {
  if (err) {
    throw err;
  }
  else if (value) {
    // Turn on Lock indicator
    LED_ERR.writeSync(1);
  }
  else {
    // Turn off Lock indicator
    LED_ERR.writeSync(0);
  }
});

function clean() {
  clearInterval(netCheck);
  LED_PWR.writeSync(1);
  LED_NET.writeSync(0);
  LED_LCK.writeSync(0);
  LED_ERR.writeSync(0);
  IR_INT.unexport();
  IR_EXT.unexport();
  LED_PWR.unexport();
  LED_NET.unexport();
  LED_LCK.unexport();
  LED_ERR.unexport();
}

// Free Resources If Interrupted
process.on('SIGINT', () => {
  clean();
  process.exit(0);
});

// Free Resources If Termination Requested
process.on('SIGTERM', () => {
  clean();
  process.exit(0);
});

// Listern for Locking Mechnism
// Child Process Method
process.on('message', message => {
  let comm = JSON.parse(message);
  if (comm.Lock.status == 1) {
    // Turn on Lock indicator
    LED_LCK.writeSync(1);
  }
  else {
    // Turn off Lock indicator
    LED_LCK.writeSync(0);
  }
});

anth.print('msg', 'Starting Operation');

function checkNetwork() {
  let  options = {
    host: server,
    path: '/'
  };
  http.get(options, (res) => {
    if (!printNum) {
      anth.print('suc', 'Connection Established');
      printNum++;
    }
    LED_NET.writeSync(1);
  }).on('error', function(error) {
    console.error('Error Detected:', error);
    LED_NET.writeSync(0);
    LED_ERR.writeSync(1);
    anth.print('err', 'Unable to communicate with server');
  });
}

let netCheck = setInterval(checkNetwork, 100);

// Define Shutdown Function
PSH_BTN1.watch((err, value) => {
  if (err) {
    throw err;
  }
  else if (value) {
    clean();
    let cmd = execSync('shutdown -h now');
  }
  else {
    // Inform Servo Unit no motion is detected
  }
});