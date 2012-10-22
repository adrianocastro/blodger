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

This app runs on Express on top of node.js. It uses the [dust templating engine](http://linkedin.github.com/dustjs). For real-time communication it uses [Socket.io](http://socket.io/). For layout and simple behaviour it uses [Twitter Bootstrap](http://twitter.github.com/bootstrap/) which allowed for some faster development though the quality of the code (in terms of semantics, performance and maintainability) might have suffered. Results are displayed on Google Maps using the [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/).

I recycled a similar approach to the one used in [tweader](https://github.com/adrianocastro/tweader) in relation to the approach to real-time communication using Socket.io. Given more time I would also have relied on compiled dust templates instead of building markup directly on client-side JavaScript.

## TODO

- Disable the ability to make offers on gigs already under offer
- Better error handling
- Handle user disconnect by cleaning up after he’s left the building
- Use sessions to support multiple users

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
    - Google Maps JavaScript API v3: https://developers.google.com/maps/documentation/javascript/
    - Geocoding: https://developers.google.com/maps/documentation/geocoding/