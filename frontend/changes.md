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

10.03.2023
- Added Input Component.
- Added Login Page and Login Functionality.
- Changed name in Header and Sidedrawer.
- Added Logout to Header and Sidedrawer and Logout Functionality.

14.03.2023
- Added Register Page and Register Functionality.
- Changed Rooms, Logout, Login, Register visibility in header/sidedrawer according to login status.
- Changed paths in API calls.
- Added error status handling on API calls.

21.03.2023
- Changed toggleDeviceSwitch to use a payload with deviceId and newValue instead of only deviceId.
- Added WebSocket-Client for instant updates on iobroker state changes.

22.03.2023
- Added Sensor component.