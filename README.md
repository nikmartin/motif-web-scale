# Motif Web Scale

The [Motif Mentor Smart Scale](https://sidedeal.com/deals/motif-mentor-smart-perfect-coffee-drink-baking-scale-12)
is a neat Bluetooth based scale, that has crappy app support. This web app adds what everyone asks for when 
they get the scale: "I just want to weigh stuff!" The scale is a [Bluetooth Low Energy](https://en.wikipedia.org/wiki/Bluetooth_Low_Energy) device and Google Chrome has [Web Bluetooth](https://webbluetoothcg.github.io/web-bluetooth/) 
support, so I wrote this web app to connect to the Motif Perfect scale and just do one thing well: weigh things.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.0.0.

It relies on [Angular Web Bluetooth](https://github.com/manekinekko/angular-web-bluetooth) to connect to the 
Web Bbluetooth API in Chrome.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `docs/` directory. Use the `--prod` flag for a production build.

## Demo

You can run the app right from here: https://nikmartin.github.io/motif-web-scale/