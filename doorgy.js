/**
 *
 * @description Doorgy - Smart Pet Door.
 * @file        doorgy.js
 * @link        https://doorgy.anth.dev
 * @license     Apache-2.0
 * @author      Anthony Kung <hi@anth.dev>
 * @since       1.0.0
 * @version     1.2.8
 *
 */

// Include Packages
const gpio = require('onoff').Gpio;
const pwm = require('pigpio').Gpio;
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
const KILL = new gpio(20, 'in', 'rising', {debounceTimeout: 100});
const PSH_BTN2 = new gpio(21, 'in', 'rising', {debounceTimeout: 100});
const PSH_BTN3 = new gpio(26, 'in', 'rising', {debounceTimeout: 100});

// Define LED gpio
const LED_PWR = new gpio(12, 'out');
const LED_NET = new gpio(13, 'out');
const LED_LCK = new gpio(16, 'out');
const LED_ERR = new gpio(19, 'out');

// Define Servo gpio
const SERVO1 = new pwm(4, {mode: pwm.OUTPUT});
const SERVO2 = new pwm(17, {mode: pwm.OUTPUT});

// Define Electromagnetic Components gpio
const MNG1 = new gpio(21, 'out');
const MNG2 = new gpio(26, 'out');

anth.print('suc', 'GPIO Defined');
LED_PWR.writeSync(0);
LED_NET.writeSync(0);
LED_LCK.writeSync(0);
LED_ERR.writeSync(0);

// Turn on power indicator
LED_PWR.writeSync(1);

/**
 * Interial IR Function.
 *
 * @access private
 * @param  {*} err
 * @param  {*} value
 *
 * @memberof IR_INT
 */
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

/**
 * Exterial IR Function.
 *
 * @access private
 * @param  {*} err
 * @param  {*} value
 *
 * @memberof IR_EXT
 */
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

/**
 * LED_LCK Test Function.
 *
 * @access private
 * @param  {*} err
 * @param  {*} value
 *
 * @memberof PSH_BTN2
 */
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

/**
 * LED_ERR Test Function.
 *
 * @access private
 * @param  {*} err
 * @param  {*} value
 *
 * @memberof PSH_BTN3
 */
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

/**
 * Termination Cleanup Function.
 *
 * @name   clean
 * @access private
 * @param  {*} err
 * @param  {*} value
 */
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

/**
 * Interruption Control.
 *
 * Free resources and exit if interrupted.
 *
 * @listens SIGINT
 * @access private
 * @memberof process
 */
process.on('SIGINT', () => {
  clean();
  process.exit(0);
});

/**
 * Termination Control.
 *
 * Free resources and exit if terminated.
 *
 * @listens SIGTERM
 * @access private
 * @memberof process
 */
process.on('SIGTERM', () => {
  clean();
  process.exit(0);
});

/**
 * Locking Control.
 *
 * Listern for Locking Mechnism.
 *
 * @listens message
 * @access private
 * @memberof process
 */
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

/**
 * Network Check Function.
 *
 * Check for network connection.
 *
 * @name   checkNetwork
 * @access private
 * @param  {string} server
 */
function checkNetwork(server) {
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

let netCheck = setInterval(checkNetwork(server), 100);

/**
 * Kill Function.
 *
 * Initiate graceful shutdown
 *
 * @access private
 * @param  {*} err
 * @param  {*} value
 *
 * @memberof KILL
 */
KILL.watch((err, value) => {
  if (err) {
    throw err;
  }
  else if (value) {
    clean();
    let cmd = execSync('shutdown -h now');
  }
  else {
    console.error('Error Detected:', error);
    LED_ERR.writeSync(1);
    anth.print('err', 'Unable to shutdown the server');
  }
});

/**
 * Doorgy Operation Function.
 *
 * Controls continuous operation.
 *
 * @name   checkNetwork
 * @access private
 * @param  {string} server
 */
function primary(server) {
  let  options = {
    host: server,
    path: '/opt',
    method: 'POST'
  };
  http.get(options, (res) => {
    /**
     * Communication Function.
     *
     * Get data from server
     *
     * @access private
     * @param  {*} err
     * @param  {*} value
     *
     * @memberof KILL
     */
    res.on('data', function (data) {
      let ctrl = JSON.parse(data);
      if (ctrl.open) {
        SERVO1.servoWrite(2000);
      }
      else {
        SERVO1.servoWrite(1500);
      }
      if (!ctrl.lock) {
        SERVO2.servoWrite(1500);
      }
      else {
        SERVO2.servoWrite(1500);
      }
    });
  })
  .write(JSON.stringify({
    username: 'Anthonykung',
    authToken: 'Te3i6Mjy8~lT3uJenKqI0I&dj1cIe53z%1thZPFn*W'
  }))
  .on('error', function(error) {
    console.error('Error Detected:', error);
    LED_NET.writeSync(0);
    LED_ERR.writeSync(1);
    anth.print('err', 'Unable to communicate with server');
  })
  .end();
}

let primaryOpt = setInterval(primary(server), 100);