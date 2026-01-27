#!/bin/bash
#
# LAUNCH STRENGTH COACHING DEVELOPMENT ENVIRONMENT
# ================================================
# Kate provides the IDE used to develop Strength Coaching Online applications. These require
# a separate terminal process space to run the back-end Node.js process in.
#
# Revision History
# ================
# 13.01.2026 BRD Original version
# 22.01.2026 BRD Revised the terminal launching code.

# Launch a gnome terminal for the Strength Coaching Online back-end
gnome-terminal -- sh -c 'cd /home/badger/dev/strength-coaching/back-end; exec bash'

# launch Kate
cd /home/badger/dev/strength-coaching  
kate /home/badger/dev/strength-coaching








