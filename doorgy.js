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
const https = require('https');
const path = require('path');

anth.anthdev();
anth.print('msg', 'Starting Doorgy Service');

// Define Global Constant
const server = 'doorgy.anth.dev';
const client = 'DoorgyService';
const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Define Global Variable
let ctrlSig = 0;
let printNum = 0;
let config = {};
let unlockStatus = 0;
let openStatus = 0;
let netstat = 0;
let optStatus = 1;

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
open(false);
unlock(false);


/**
 * Local configuration sync
 * 
 * Obtain local configuration file
 * 
 * @param {object} config 
 */
fs.readFile(path.join(__dirname, 'config.json'), function(err, data) {
  if (!err) {
    LED_ERR.writeSync(0);
    config = JSON.parse(data);
  }
  else {
    anth.print('err', err);
    LED_ERR.writeSync(1);
  }
});

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
  else if (value && ctrlSig == 0) {
    // Inform Servo Unit montion is detected
    console.log('IR_INT Sense', value);
    //LED_ERR.writeSync(1);
    ctrlSig++;
  }
  else {
    // Inform Servo Unit no motion is detected
    console.log('IR_INT Not Sense', value);
    //LED_ERR.writeSync(0);
    if (ctrlSig == 1 || ctrlSig == 3) {
      ctrlSig--;
    }
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
  else if (value && ctrlSig == 0) {
    // Inform Servo Unit montion is detected
    console.log('IR_EXT Sense', value);
    //LED_ERR.writeSync(1);
    ctrlSig += 2;
  }
  else {
    // Inform Servo Unit no motion is detected
    console.log('IR_EXT Not Sense', value);
    //LED_ERR.writeSync(0);
    if (ctrlSig == 2 || config == 3) {
      ctrlSig -= 2;
    }
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
  clearInterval(primaryOpt);
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
    port: 443,
    path: '/api/opt',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  netstat = 1;
  let req = https.request(options, (res) => {
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
      try {
        LED_NET.writeSync(1);
        let ctrl = JSON.parse(data);
        // if updated config is received, update local config
        if (ctrl.version && ctrl.version > config.version) {
          config = ctrl;
          fs.writeFile(path.join(__dirname, 'config.json'), JSON.stringify(config), function(err) {
            if (err) {
              anth.print(err);
            }
          });
        }
        if (unlockStatus == 0) {
          unlock(ctrl.unlock);
        }
        if (openStatus == 0) {
          open(ctrl.open);
        }
      }
      catch (err) {
        console.error('JSON Error:', err);
      }
    });
  })
  req.write(JSON.stringify(config))
  req.on('error', function(err) {
    console.error('Error Detected:', err);
    LED_NET.writeSync(0);
    anth.print('err', 'Unable to communicate with server');
  })
  req.end(() => {netstat = 0});
}


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

function write() {
  let  options = {
    host: server,
    port: 443,
    path: '/api/config',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  let req = https.request(options, (res) => {
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
      LED_NET.writeSync(1);
      console.log('Config Uploaded');
    });
  })
  req.write(JSON.stringify(config))
  req.on('error', function(err) {
    console.error('Error Detected:', err);
    LED_NET.writeSync(0);
    anth.print('err', 'Unable to communicate with server');
  })
  req.end();
}

function unlock(bool) {
  if (!config.history) {
    config.history = [];
  }
  if (bool && unlockStatus == 0) {
    config.history.push({
      "event": "unlock",
      "time": Date.now()
    });
    write();
    unlockStatus = 1;
    // If true unlock
    SERVO2.servoWrite(1500);
  }
  else if (!bool && unlockStatus != 0) {
    config.history.push({
      "event": "lock",
      "time": Date.now()
    });
    write();
    unlockStatus = 0;
    // Else lock
    SERVO2.servoWrite(1000);
  }
}

function open(bool) {
  if (!config.history) {
    config.history = [];
  }
  if (bool && openStatus == 0 && unlockStatus == 0) {
    config.history.push({
      "event": "open",
      "time": Date.now()
    });
    write();
    openStatus = 1;
    SERVO1.servoWrite(2000);
  }
  else if (!bool&& openStatus != 0) {
    if (config.history.length == 10) {
      config.history.slice(1, 9);
    }
    config.history.push({
      "event": "close",
      "time": Date.now()
    });
    write();
    openStatus = 0;
    SERVO1.servoWrite(1500);
  }
}

/**
 * Doorgy Operation Function.
 *
 * Controls continuous operation.
 *
 * @name   checkNetwork
 * @access private
 * @param  {object} config
 */
function primary(config) {
  let timeNow = new Date();
  let day = weekday[timeNow.getDay()];
  let count = 0;
  if (config.schedule && !config.open && !config.unlock) {
    config.schedule.forEach(item => {
      if ((day == item.day) && (timeNow.getHours() > item.hour) && (timeNow.getMinutes() > item.minutes) && (timeNow.getHours() < item.endHour) && (timeNow.getMinutes() < item.endMinutes)) {
        unlock(true);
        count++;
      }
    });
    if (count == 0) {
      unlock(false);
    }
  }
  if (unlockStatus != 0 && ctrlSig != 0 && openStatus == 0) {
    console.log('Opening...', openStatus, 'ctrl:', ctrlSig, 'unlock:', unlockStatus);
    open(true);
  }
  if (openStatus != 0 && openStatus != 15) {
    console.log('Opened... Status', openStatus);
    openStatus++;
  }
  else if (openStatus != 0 && openStatus == 15) {
    console.log('Closing...');
    openStatus = 0;
    open(false);
  }
  if (netstat == 0) {
    checkNetwork(server);
  }
}

let primaryOpt = setInterval(() => primary(config), 1000);
