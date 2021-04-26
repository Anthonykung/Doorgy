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

// Define Global Constant
const server = 'doorgy.anth.dev';

// Define Global Variable
let ctrlSig = 1;

// Check Status
if (gpio.accessible) {
  // Define IR gpio
  var IR_INT = new gpio(5, 'in', 'both');
  var IR_EXT = new gpio(6, 'in', 'both');

  // Define LED gpio
  var LED_PWR = new gpio(12, 'out');
  var LED_NET = new gpio(13, 'out');
  var LED_LCK = new gpio(16, 'out');
  var LED_ERR = new gpio(19, 'out');

  // var in JS has global scope

  // Turn on power indicator
  LED_PWR.writeSync(1);
} else {
  // If error occured turn on Error indicator
  LED_ERR.writeSync(1);
}

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

// Free Resources If Termination Requested
process.on('SIGINT', _ => {
  IR_INT.unexport();
  IR_EXT.unexport();
  LED_PWR.unexport();
  LED_NET.unexport();
  LED_LCK.unexport();
  LED_ERR.unexport();
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

// Listern for Locking Mechnism
// Read File Method
while (ctrlSig) {
  fs.readFile('doorgy.json', function(err, data) {
    let comm = JSON.parse(data);
    if (comm.Lock.status == 1) {
      // Turn on Lock indicator
      LED_LCK.writeSync(1);
    }
    else {
      // Turn off Lock indicator
      LED_LCK.writeSync(0);
    }
  });
}

// Begin Continuous Operation
while (ctrlSig) {

  // Check For Network Connection
  dns.resolve(server, function(err) {
    if (err) {
      // Turn off Network indicator
      LED_NET.writeSync(0);

      // Note: Doorgy is designed to operate even when network
      // connection has been disconnected, so there is no need
      // to turn on Error indicator
    } else {
      // Turn on Network indicator if connection to server
      // is established
      LED_NET.writeSync(1);
    }
  });
}