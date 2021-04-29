# Doorgy

A smart pet door for your smart home

***APLHA RELEASE WARNING*** Currently Under Development - This is not production ready!

Estimated Time of Completion: May 28, 2021

This is an open source academic group project for ECE 342 Junior Design at Oregon State University.

# Contents
- [Doorgy](#doorgy)
- [Contents](#contents)
  - [Overview](#overview)
  - [Prerequisite](#prerequisite)
    - [Doorgy Installation Package](#doorgy-installation-package)
    - [Required Software](#required-software)
    - [Configuring Doorgy Service](#configuring-doorgy-service)
      - [From GitHub](#from-github)
      - [From NPM](#from-npm)
  - [Install](#install)
    - [Physical Installation](#physical-installation)
    - [System Configuration](#system-configuration)
  - [License](#license)

## Overview

Doorgy is a smart pet door for your smart home. Control your pet door with nothing but your phone! Automated pet detection and door opening, say open sesame. Plug and play, no code required!

## Prerequisite

This project requires the Doorgy Installation Package that comes with the specific components require for the installation. Schematics of these components are available should you choose to create your own. You will not be able to proceed without these components.

### Doorgy Installation Package

- 1x Doorgy Printed Circuit Board
- 1x Raspberry Pi Zero WH
- 1x 16GB Doorgy Service Micro SD Card
- 2x HC-SR501
- 1x Doorgy LED Assembly
- 2x Servo Motors with Extended Arms
- 1x Battery Pack
- 1x Micro USB Power Supply
- 1x Doorgy Exterial Frame
- 1x Doorgy Interial Frame with Circuit Housing
- 1x Doorgy Door
- 4x 1 Inch Doorgy Frame Screw
- 2x 1/4 Inch Doorgy Housing Screw
- 2x 1/4 Inch Doorgy Door Screw

### Required Software

If you have the Doorgy Service Micro SD Card, these has already been installed and configured.

If you do not have a Doorgy Service Micro SD Card, you will need a Micro SD Card with Raspbian Lite installed, more information available on [https://www.raspberrypi.org/documentation/installation/installing-images/](https://www.raspberrypi.org/documentation/installation/installing-images/). Once you have a Micro SD Card with Raspbian Lite installed, you can use the `doorgy-init.sh` located in `resources` folder of this repo to install the require softwares.

- UFW
- Fail2ban
- Git
- Node.js
- NPM
- Express.js
- mongoDB

Note: You should always secure your Raspberry Pi, Doorgy Service Micro SD Card will have security enabled by default. If you are using `doorgy-init.sh`, only firewall will be enabled. You will need to setup your Raspbian user and configure Fail2ban manually, more information available on [https://www.raspberrypi.org/documentation/configuration/security.md](https://www.raspberrypi.org/documentation/configuration/security.md)

### Configuring Doorgy Service

If you have the Doorgy Service Micro SD Card, these has already been installed and configured.

#### From GitHub

```
git clone https://github.com/Anthonykung/Doorgy.git
sudo npm install
sudo systemctl enable doorgy
```

If the installation fail, you can use `sudo npm run install` to try again. Sudo is required for all operations.

Once the service has been successfully configured, you can either start or reboot to start the service.

#### From NPM

```
mkdir ~/Doorgy
cd ~/Doorgy
sudo npm install doorgy
sudo systemctl enable doorgy
```

If the installation fail, you can use `sudo npm run install` to try again. Sudo is required for all operations.

Once the service has been successfully configured, you can either start or reboot to start the service.

## Install

This assume you have the Doorgy Installation Package and met all the prerequisites, if not please check that you have met the prerequisites before continuing.

### Physical Installation

1. Remove the door and place it on a table
2. Using the Doorgy Interial Frame, mark all 4 sides of the frame for cutting
3. Leave at least 3 inches of space on each side and 4 inches on the bottom
4. Cut the door on the marked location, this should give you a rectangular hole for the Doorgy Interial Frame
5. Place the Doorgy Interial Frame to the door (facing the inside), this should give you a tight fit
6. Place the Doorgy Exterial Frame on the other side overlapping the Doorgy Interial Frame
7. Using the 1 Inch Doorgy Screws, screw the Interial Fram to the Exterial Frame (the hole is located on the Interial Frame)
8. Using the 1/4 Inch Doorgy Screws, secure the circuit housing to the door (you will need to dril a 1/4 inch hole on the door)
9. On the exterial side, push the Doorgy Door in place with the hook on the top facing inside, secure it with the 1/4 inch screw to the frame
10. Attach the servo arm to the hook on top of the door, do not touch the servo arm on the left
11. Plugin the Micro USB power cable or attach 4x AAA batteries (not included) to the battery pack
12. Press the power up button and you are good to go! (Remember to tidy up the power cable so it doesn't get pulled out!)

### System Configuration

1. Install the Doorgy app on your smartphone
2. Open the Doorgy app and follow the display to connect Doorgy to your phone using Bluetooth
3. Follow the app display to setup WiFi connection
4. Finish configuring Doorgy with the app
5. Once configuration is complete, follow the display to restart Doorgy (this is only needed during initial system configuration)
6. Enjoy your awesome new smart pet door!

## License

Copyright 2021 Doorgy Project Group

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.