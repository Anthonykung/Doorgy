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
const bleno = require('bleno');
const path = require('path');

anth.anthdev();
anth.print('msg', 'Starting Doorgy Service');

// Define Global Constant
const server = 'doorgy.anth.dev';
const client = 'DoorgyService';
const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Define Global Variable
let ctrlSig = 1;
let printNum = 0;
let config = {};

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
  else if (value) {
    // Inform Servo Unit montion is detected
    console.log('IR_INT Sense', value);
    //LED_ERR.writeSync(1);
  }
  else {
    // Inform Servo Unit no motion is detected
    console.log('IR_INT Not Sense', value);
    //LED_ERR.writeSync(0);
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
    //LED_ERR.writeSync(1);
  }
  else {
    // Inform Servo Unit no motion is detected
    console.log('IR_EXT Not Sense', value);
    //LED_ERR.writeSync(0);
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
    port: 443,
    path: '/api/opt',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  https.request(options, (res) => {
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
      unlock(ctrl.unlock);
      open(ctrl.open);
      setTimeout(open(false), milliseconds);
    });
  })
  .write(JSON.stringify({
    username: config.username,
    authToken: config.token
  }))
  .on('error', function(err) {
    console.error('Error Detected:', err);
    LED_NET.writeSync(0);
    anth.print('err', 'Unable to communicate with server');
  })
  .end();
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

function unlock(bool) {
  if (bool) {
    // If true unlock
    SERVO2.servoWrite(1500);
  }
  else {
    // Else lock
    SERVO2.servoWrite(2000);
  }
}

function open(bool) {
  if (bool) {
    config.history.push({
      "event": "open",
      "time": Date.now()
    });
    SERVO1.servoWrite(2000);
  }
  else {
    if (config.history.length == 10) {
      config.history.slice(1, 9);
    }
    config.history.push({
      "event": "close",
      "time": Date.now()
    });
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
  if (!config.open && !config.unlock) {
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
}

let primaryOpt = setInterval(primary(config), 100);

/**
 * Bluetooth Function
 * 
 * Update WiFi configuration
 * 
 * @param {string} country 
 * @param {string} ssid 
 * @param {string} psk 
 * @param {string} id_str 
 */
function bluetooth(country, ssid, psk, id_str) {
  let wifiConfig = `
  ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
  update_config=1
  country=${country}
  network={
    ssid="${ssid}"
    psk="${psk}"
    id_str=${id_str}
  }
  `;
  fs.writeFile("/etc/wpa_supplicant/wpa_supplicant.conf", wifiConfig, function(err) {
    if (err) {
      anth.print(err);
    }
    else {
      console.log("Configuration updated, restarting...");
      clean();
      let cmd = execSync('shutdown -h now');
    }
  });
}

/**
 * Bluetooth Controller
 */
bleno.on('stateChange', function(state) {
  let msg = 'bleno state change' + state;
  anth.print('msg', msg);
  if (state === 'poweredOn') {
    bleno.startAdvertising(client, ['1803']);
  } else {
    bleno.stopAdvertising;
  }
});

/**
 * Bluetooth Service
 */
bleno.on('advertisingStart', function(err) {
  anth.print('msg', 'bleno advertising start');
  if (!err) {
    bleno.setServices([
      new bleno.PrimaryService({
        uuid: 'ade0',
        characteristics: [
          new bleno.Characteristic({
            uuid: 'ade1',
            properties: ['read', 'write'],
            secure: ['read', 'write'],
            value: null,
            onWriteRequest(data, offset, withoutResponse, callback) {
              let req = JSON.parse(data.toString());
              config = req;
              fs.writeFile(path.join(__dirname, 'config.json'), JSON.stringify(config), function(err) {
                if (err) {
                  anth.print(err);
                }
              });
              bluetooth(config.wifi.country, config.wifi.ssid, config.wifi.psk, config.wifi.id_str);
              callback(this.RESULT_SUCCESS);
            },
          }),
        ],
      }),
    ]);
  }
  else {
    anth.print('err', err);
  }
});
