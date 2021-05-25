
#!/bin/sh

#####################################################
# Name: Doorgy Raspbian Installation Helper         #
# Description: Setup your Raspbian Lite image with  #
#              the prerequisites                    #
# Date: April 27, 2021                              #
# Created with <3 by Anthony Kung                   #
# Author URI: https://anth.dev                      #
# License: Apache 2.0 (See LICENSE.md for details)  #
#####################################################

# Note: You should run this file with sudo
# If you are copying the commands in this file add
# sudo in front of each command

apt-get update
apt-get install ufw fail2ban git nodejs npm mongodb bluetooth bluez libbluetooth-dev libudev-dev -y
ufw allow ssh
ufw limit ssh

# If you need Doorgy Service, uncomment the following
# npm install doorgy
