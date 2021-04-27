
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
apt-get install ufw
ufw allow ssh
ufw limit ssh
apt-get install fail2ban
apt-get install git -y
apt-get install nodejs -y
apt-get install npm -y
apt-get install mongodb -y
git clone https://github.com/Anthonykung/Doorgy