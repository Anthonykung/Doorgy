# Doorgy

A smart pet door for your smart home

Currently Under Development

## Prerequisite

This prerequisite assume you already have Doorgy installation package that comes with the specific components require for the installation. Schematics of these components are available should you choose to create your own. You will not be able to proceed without these components.

### Doorgy Installation Package

- 1x Doorgy Printed Circuit Board
- 1x Raspberry Pi Zero WH
- 1x 16GB Doorgy Service Micro SD Card
- 2x HC-SR501
- 1x Doorgy LED Assembly
- 2x Servo Motors
- 1x Battery Pack
- 1x Micro USB Power Supply
- 1x Doorgy Exterial Frame
- 1x Doorgy Interial Frame with Circuit Housing
- 4x 1 Inch Doorgy Frame Screw
- 2x 1/4 Inch Doorgy Housing Screw

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

```
git clone https://github.com/Anthonykung/Doorgy.git
npm install
```

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

### System Configuration

1. Install the Doorgy app on your smartphone
2. Open the Doorgy app and follow the guide to connect Doorgy to your phone