var handlePageRequest = function (req, res) {

    var tours = require('../data/tours.json');

    // If it hits the json endpoint then it's an Ajax request
    if (req.params.json) {
        if (req.query.action) {
            console.log('JSON request for ' + req.query.action + ' action.');
            res.send({ bands: tours.bands });
        }

    } else {
        // If there are no params defined in the request then it's a new page refresh
        var data = JSON.stringify(tours.bands)
        res.render('index', { title: 'Blodger', bands: tours.bands, data: data });
    }
};

// Exports
exports.index = handlePageRequest;
