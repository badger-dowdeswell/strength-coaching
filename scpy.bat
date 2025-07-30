@echo off
:
: Deploy Strength Research
: ========================
: Deploys the latest version of Strength Research to the Rockweather host
:
:
title Deploy Strength Research to the Rockweather Server

scp -r front-end  badger@192.168.178.30:/home/badger/Sites/StrengthResearch/front-end

scp -r back-end  badger@192.168.178.30:/home/badger/Sites/StrengthResearch/back-end

echo Deployed code
pause