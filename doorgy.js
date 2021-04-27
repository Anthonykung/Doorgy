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
const dns = require('dns');
const fs = require('fs');
const anth = require('./resources/anthonian.js');
const { exec, spawn } = require('child_process');

anth.anthdev();
anth.print('msg', 'Starting Doorgy Service');

// Define Global Constant
const server = 'doorgy.anth.dev';

// Define Global Variable
let ctrlSig = 1;

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
LED_PWR.writeSync(0);
LED_PWR.writeSync(0);
LED_PWR.writeSync(0);

// Turn on power indicator
LED_PWR.writeSync(1);

// Define Interial IR Function
IR_INT.watch((err, value) => {
  if (err) {
    throw err;
  }
  else if (value) {
    // Inform Servo Unit montion is detected
  }
  else {
    // Inform Servo Unit no motion is detected
  }
});

// Define Interial IR Function
IR_EXT.watch((err, value) => {
  if (err) {
    throw err;
  }
  else if (value) {
    // Inform Servo Unit montion is detected
  }
  else {
    // Inform Servo Unit no motion is detected
  }
});

// Define Shutdown Function
PSH_BTN1.watch((err, value) => {
  if (err) {
    throw err;
  }
  else if (value) {
    ctrlSig = 0;
    let cmd = spawn('shutdown -h now', [], { stdio: 'inherit' });
    cmd.on('error', (error) => {
      console.log(anth.red, 'ACLI Error:', error, anth.ori);
    });
    cmd.on('close', (code)=>{
      console.log(anth.blue, 'ACLI Return:', code, anth.ori);
    });
  }
  else {
    // Inform Servo Unit no motion is detected
  }
});

// Simulate Lock On
PSH_BTN2.watch((err, value) => {
  if (err) {
    throw err;
  }
  else if (value) {
    // Turn on Lock indicator
    LED_LCK.writeSync(1);
  }
  else {
    // Turn off Lock indicator
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

// Free Resources If Termination Requested
/*process.on('SIGINT', _ => {
  ctrlSig = 0;
  IR_INT.unexport();
  IR_EXT.unexport();
  LED_PWR.unexport();
  LED_NET.unexport();
  LED_LCK.unexport();
  LED_ERR.unexport();
  exit(0);
});*/

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

let printLog = 0;

// Begin Continuous Operation
while (ctrlSig) {
  if (!printLog) {
    anth.print('suc', 'Operation Started');
    printLog++;
  }

  // Listern for Locking Mechnism
  // Read File Method
  /*fs.readFile('doorgy.json', function(err, data) {
    let comm = JSON.parse(data);
    if (comm.Lock.status == 1) {
      // Turn on Lock indicator
      LED_LCK.writeSync(1);
    }
    else {
      // Turn off Lock indicator
      LED_LCK.writeSync(0);
    }
  });*/

  let  options = {
    host: 'doorgy.anth.dev',
    path: '/'
  };
  http.get(options, (res) => {
    anth.print('suc', 'Connection Established');
    LED_NET.writeSync(1);
  }).on('error', function(error) {
    console.error('Error Detected:', error);
    LED_NET.writeSync(0);
    LED_ERR.writeSync(1);
    anth.print('err', 'Unable to communicate with server');
  });
}