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
#
# launch Kate
cd /home/dev/strength-coaching
kate /home/dev/strength-coaching

# Launch the back-end terminal window used for Strength Coaching Online 
cd /home/dev/strength-coaching/back-end
gnome-terminal -- sh -c 'echo "Strength Coaching Online Back-End"; exec bash '
# cd /home/dev/strength-coaching/back-end' ' 







