var async = require('async'),
    // list of saved terms/queries
    savedTerms = {},
    // setInterval id
    newTweetChecker,
    // API config object
    apiConfig = {
        host: 'search.twitter.com',
        port: 80,
        basePath: '/search.json',
        defaultArgs: '?lang=en&rpp=5&q='
    };

// @TODO: clean up after the user disconnects
// // Listen for user-disconnect and clean things up.
// var sio = require('../lib/socket.io.js').sio();
// sio.sockets.on('user-disconnected', function () {
//     console.log('User disconnected. Cleaning up.');
//     clearInterval(newTweetChecker);
//     savedTerms = null;
// });

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

var fetchTweets = function (queryItem, cb) {
    console.log('fetchTweets()');

    var io = require('../lib/io.js'),
        queue  = [],
        tweets = [],
        termsToProcess = {};

    if (queryItem) {
        termsToProcess[queryItem] = {};
    } else {
        termsToProcess = savedTerms;
    }

    console.log('termsToProcess', termsToProcess);

    for (var term in termsToProcess) {
        if (termsToProcess.hasOwnProperty(term)) {
            var queryPath = apiConfig.basePath + apiConfig.defaultArgs + encodeURIComponent(term);
            if (!queryItem && termsToProcess[term].refreshUrl) {
                queryPath = apiConfig.basePath + termsToProcess[term].refreshUrl;
            }

            queue.push((function(queryPath) {
                return function (callback) {
                    apiConfig.path = queryPath;
                    io.fetch(apiConfig, callback);
                }
            })(queryPath));
        }
    }

    if (queue.length > 0) {
        async.parallel(
            queue,
            // Callback to handle the results
            function handleResults (err, results){
                results.forEach(function (result) {
                    var term = decodeURIComponent(result.query);

                    if (result.results.length > 0) {
                        result.results.forEach(function (t) {
                            t.origin = term;
                            tweets.push(t);
                        })
                        console.log('New tweets have been found.');
                    } else {
                        console.log('No results found.');
                        return false;
                    }

                    // Sort tweets by date
                    tweets = sortTweetsByDate(tweets);

                    // Store the id of the latest tweet
                    if (!savedTerms[term]) {
                        savedTerms[term] = {};
                    }
                    savedTerms[term].latestId   = tweets[0].id_str;
                    savedTerms[term].refreshUrl = result.refresh_url
                });

                // Perform callback
                cb(tweets);
            }
        );
    }
};

var sortTweetsByDate = function (list) {
    // Use a map for sorting to avoid overhead

    // Map and result are temporary holders
    var map    = [],
        result = [],
        i,
        length;

    // Build a map of values and positions based on the original list
    for (i=0, length = list.length; i < length; i++) {
        map.push({
            // Save the index
            index: i,
            // Save the value to sort (tweet's created_at)
            value: Date.parse(list[i].created_at)
        });
    }

    // Sort by date
    map.sort(function (date1, date2) {
        date1 = date1.value;
        date2 = date2.value;
        if (date1 < date2) return 1;
        if (date1 > date2) return -1;
        return 0;
    });

    // Copy values in right order
    for (i=0, length = map.length; i < length; i++) {
        result.push(list[map[i].index]);
    }

    // Return the sorted list
    return result;
};

var checkForNewTweets = function () {
    console.log('checkForNewTweets()');
    var sio = require('../lib/socket.io.js').sio();

    // Clear any previously existing intervals
    clearInterval(newTweetChecker);
    // Set a new interval listener for new tweets
    newTweetChecker = setInterval(function() {
        fetchTweets(null, function emitNewTweetsEvent(tweets) {
            if (tweets.length > 0) {
                sio.sockets.emit('new-tweets', { status: 'New tweets are in.', tweets: tweets });
            }
        });
    }, 10000);
}


// Exports
exports.index = handlePageRequest;
