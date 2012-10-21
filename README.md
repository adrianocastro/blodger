# Blodger

## Description

A simple application that allows music fans to offer lodging to touring bands. Different bands’ tour schedules are available to consult, as a list and on a map, and fans can offer lodging. A lodging offer for a given tour date is visible to all users in real-time.

Along with [tweader](https://github.com/adrianocastro/tweader) this is another experiment with working on the node.js stack and playing with real-time web applications and third-party APIs.

This app runs on node.js using Express and the dust templating engine. For the real-time piece it uses socket.io.


## Installation

1. `npm clone https://github.com/adrianocastro/blodger.git`
1. `cd blodger`
1. `npm install`
1. `node app.js`
1. open `http://localhost:3000` on your browser

## Notes

This app runs on Express on top of node.js. It uses the [dust templating engine](http://linkedin.github.com/dustjs) and shares the templates on the client via [dustbuster](https://github.com/diffsky/dustbuster/). For real-time communication it uses [Socket.io](http://socket.io/). Additionally, [Async](https://github.com/caolan/async) is used as a helper utility.

Most of the time spent on building this was around familiarising myself with Socket.io and learning how to best integrate it with Express. Figuring out the best way to share templates between the server and the client was also a key concern and, after some investigating, I chose to go with dust/dustbuster. Lastly, understanding the ins and outs of the Twitter API was also necessary for making this work.

My original approach (please refer to the first commits against this repository) was aiming to have an app that worked fully without any client side JavaScript and then building on top of that. Though I managed to get this working (without real-time, obviously), keeping the original approach started to take too much time as I built up the full rich, one-page interaction. It should be perfectly doable and the app has mostly all it needs for it to happen but it needed more time and I was trying to get to a point where it fit a minimum set of requirements from the brief.

## TODO

Today:
    - integrate Google Maps

Tomorrow:
    - implement lodging offer
    - implement real-time publishing of lodging offer events

Eventually:
    - use sessions to support multiple users
    - better error handling
    - handle user disconnect by cleaning up after he’s left the building
    - better namespacing

## References

- Express
    - http://expressjs.com/
- Socket.io
    - http://socket.io/
    - https://github.com/LearnBoost/socket.io/wiki/Exposed-events
- Dust
    - http://linkedin.github.com/dustjs/
    - http://akdubya.github.com/dustjs/
    - https://github.com/diffsky/dustbuster/
- Async
    - https://github.com/caolan/async
- Twitter Bootstrap
    - http://twitter.github.com/bootstrap/
- Google Maps API
    - https://developers.google.com/maps/documentation/javascript/
    - Geocoding: https://developers.google.com/maps/documentation/geocoding/