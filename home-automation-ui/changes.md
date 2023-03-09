## This file keeps track of all made changes to the original repository

08.03.2023
- Removed the font import ```@import url("https://fonts.googleapis.com/css?family=Poppins:400,700&display=swap");``` with the intention to remove the ```fonts.gstatic.com``` tracker.
- Added the Encode Sans Font, served as files in ```fonts``` folder. Added a ```@font-face``` in style.scss accordingly and changed ```$FONT_FAMILY``` in _variables.scss.
- Changes to the api to establish connection with backend for devices.

09.03.2023
- Changes to the api to establish connection with backend for controls of the devices.
- Added ```Buzzer``` control.
- Added ```Guard``` hoc component to restrict access.
- Added ```auth``` store to handle authentification.