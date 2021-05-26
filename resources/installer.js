#!/usr/bin/env node

/**
 *
 * @description Doorgy Installation Helper.
 * @file        installer.js
 * @link        https://doorgy.anth.dev
 * @license     Apache-2.0
 * @author      Anthony Kung <hi@anth.dev>
 * @since       1.0.0
 * @version     1.2.8
 *
 */

// Just to be nice
'use strict';

// Modules
const { exec, spawn } = require('child_process');
const anth = require('./anthonian.js');
const fs = require("fs");
const path = require('path');
const fse = require('fs-extra');

anth.print('msg', 'Checking Directory Location');

if (__dirname != '/usr/local/src/doorgy') {
  anth.print('msg', 'Relocation required, relocating...');
  try {
    fse.copySync(__dirname + '/../', '/usr/local/src/doorgy');
    anth.print('suc', 'Relocation Success');
  } catch (err) {
    anth.print('err', 'Unable to move directory');
  }
}
anth.print('suc', 'Directory Check Completed');

anth.print('msg', 'Checking Service Location');

if (!fs.existsSync('/etc/systemd/system/doorgy.service')) {
  anth.print('msg', 'Service not found, adding service...');
  try {
    fse.copySync(path.join(__dirname, 'doorgy.service'), '/etc/systemd/system/doorgy.service');
    anth.print('suc', 'Service Added Successfully');
  } catch (err) {
    anth.print('err', 'Unable to move file');
  }
}
anth.print('suc', 'Service Check Completed');

anth.print('suc', 'Doorgy Installation Completed');
anth.print('msg', ['Start the service using', anth.pink, 'sudo npm start', anth.blue, 'or', anth.pink, 'sudo systemctl start doorgy.service', anth.blue, 'sudo is required for system services']);
