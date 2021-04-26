#!/usr/bin/env node

/*******************************************
 *                                         *
 * Name: installer.js                      *
 * Description: Doorgy Installation Helper *
 * Date: April 26, 2021                    *
 * Created by: Anthony Kung                *
 * Author URL: https://anth.dev            *
 * License: Apache-2.0 (See LICENSE.md)    *
 *                                         *
 *******************************************/

// Just to be nice
'use strict';

// Modules
const { exec, spawn } = require('child_process');
const anth = require('./anthonian.js');
const mv = require('mv');
const cp = require('cp');
const fs = require("fs");
const path = require('path');

anth.print('msg', 'Checking Directory Location');

if (__dirname != '/usr/local/src/doorgy') {
  anth.print('msg', 'Relocation required, relocating...');
  mv(__dirname, '/usr/local/src/doorgy', {mkdirp: true}, function(err) {
    if (err) {
      anth.print('err', 'Unable to move directory');
      throw err;
    }
  });
  anth.print('suc', 'Relocation Completed');
}

anth.print('msg', 'Checking Service Location');

if (!fs.existsSync('/etc/systemd/system/doorgy.service')) {
  anth.print('msg', 'Service not found, adding service...');
  cp.sync(path.join(__dirname, '/doorgy.service'), '/usr/local/src/doorgy');
  anth.print('suc', 'Service Added Successfully');
}

anth.print('suc', 'Doorgy Installation Completed');
anth.print('msg', ['Start the service using', anth.pink, 'sudo npm start', anth.blue, 'or', anth.pink, 'sudo systemctl start doorgy.service', anth.blue, 'sudo is required for system services']);