// @TODO: namespace
var blodger;

$(function(){

    var blodger = {

        // Set up socket.io and listen on key events
        socket: io.connect('http://localhost:3000'),

        map: null,
        neighborhoods: [],
        markers: [],
        iterator: 0,

        loadGoogleMapsApi: function() {
            console.log('loadGoogleMapsApi()');
            var script = document.createElement('script');

            script.type = 'text/javascript';
            script.src  = 'http://maps.googleapis.com/maps/api/js?key=AIzaSyAGX9TMrtwhuQb2kTmYKRz_yAJCFlNcAKA&sensor=false&callback=initializeGoogleMaps';

            document.body.appendChild(script);
        },

        setGigs: function() {
            console.log('setGigs()');

            this.neighborhoods = [
                new google.maps.LatLng(52.511467, 13.447179),
                new google.maps.LatLng(52.549061, 13.422975),
                new google.maps.LatLng(52.497622, 13.396110),
                new google.maps.LatLng(52.517683, 13.394393)
            ];

            console.log('neighborhoods', this.neighborhoods);
        },

        initializeGoogleMaps: function() {
            console.log('initializeGoogleMaps()');
            // var sanFrancisco = new google.maps.LatLng(37.7750, 122.4183);
            var sanFrancisco = new google.maps.LatLng(52.520816, 13.410186);

            var mapOptions = {
                center: sanFrancisco,
                zoom: 10,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            // @TODO: rethink hardcoded self reference
            blodger.map = new google.maps.Map(document.getElementById('gmaps-canvas'), mapOptions);

            blodger.setGigs();
        },


        drop: function() {
            console.log('drop()');
            var self = this;
            for (var i = 0; i < this.neighborhoods.length; i++) {
                // $.proxy(setTimeout((function(){this.addMarker();}).call(this), i * 200), this);

                setTimeout(function() {
                    self.addMarker();
                }, i * 200);

                // (function(this) {
                //     return function (callback) {
                //         apiConfig.path = queryPath;
                //         io.fetch(apiConfig, callback);
                //     }
                // })(this))

                // setTimeout(function() {
                //     this.addMarker();
                // }, i * 200);
            }
        },

        addMarker: function(context) {
            console.log('addMarker()');
            // var that = this;
            console.log('this', this);
            // console.log('that', that);
            this.markers.push(new google.maps.Marker({
                position: this.neighborhoods[this.iterator],
                map: this.map,
                draggable: false,
                animation: google.maps.Animation.DROP
            }));
            this.iterator++;
        }

    }


    // Asynchronously load the Google Maps API script
    blodger.loadGoogleMapsApi();

    blodger.socket.on('connection-on', function (data) {
        console.log('Socket.io is on. Message from server:', data.status);
    });
    // socket.on('new-tweets', function (data) {
    //     console.log('We have new tweets. Message from server:', data.status);
    //     appendTweetsToFeed(data.tweets);
    // });

    // Expose Google Maps initialisation callback
    window.initializeGoogleMaps = blodger.initializeGoogleMaps;
    window.blodger = blodger;

    // /**
    //   *
    //   * Appends new tweets using the tweader.feed dust template
    //   *
    //  **/
    // var appendTweetsToFeed = function (tweets) {
    //     var existingFeed = $('#feed').html();
    //     dust.render('tweader.feed', { tweets : tweets }, function (err, output) {
    //         $('#feed').html(output + existingFeed);
    //     });
    // }

    // /**
    //   *
    //   * Appends terms to the list of terms using the tweader.terms dust template
    //   *
    //  **/
    // var appendTermsToList = function (terms) {
    //     var existingTerms = $('#topic-list').html();
    //     dust.render('tweader.terms', { terms : terms }, function (err, output) {
    //         $('#topic-list').html(output + existingTerms);
    //     });
    // }

    // /**
    //   *
    //   * Handle topic search form interactions
    //   *
    //  **/
    // $('#topic-search').submit(function handleTopicSearch(e) {
    //     // Prevent the form submit
    //     e.preventDefault();
    //     // Temporarily disable the submit button until the ajax call is complete
    //     var submitButton = $('input[type=submit]', this),
    //         query        = $('#q', this),
    //         savedTerms   = $('#savedTerms', this);

    //     // @TODO: validate for duplicate queries in addition to empty string validation.
    //     if ($.trim(query.val()) !== '') {
    //         submitButton.attr('disabled', 'disabled');

    //         $.ajax({
    //             url: "/.json",
    //             data: $(this).serialize(),
    //             success: function(data) {
    //                 console.log('Query results:', data);

    //                 // Append tweets and terms to feed and list respectively
    //                 appendTweetsToFeed(data.tweets);
    //                 appendTermsToList(data.terms);

    //                 // Append to the list of saved terms
    //                 var savedTermsVal = savedTerms.val(),
    //                     queryVal      = query.val() + ',';

    //                 savedTerms.val((savedTermsVal === '') ? queryVal : savedTermsVal + queryVal);
    //             }
    //         }).done(function() {
    //             // Re-enable the submit button and clear the old query
    //             submitButton.removeAttr('disabled');
    //             query.val('');
    //         });
    //     } else {
    //         alert('Please enter a non-empty query.\n\nYou can search for a hashtag (e.g. #weekend), an @ reference (e.g. @adrianocastro) or any string (e.g. "San Francisco").');
    //     }
    // });

    // /**
    //   *
    //   * Handle topic removing
    //   *
    //  **/
    // $("#topic-list").on("click", ".topic-remove", function handleTopicRemove(e){
    //     // Prevent for submit
    //     e.preventDefault();

    //     var topic       = $(this).parent(),
    //         topicId     = topic.attr('data-id'),
    //         topicTweets = $('#feed').find("[data-id='" + topicId + "']"),
    //         savedTopics = $('#savedTerms');

    //     // remove all tweets for topic from the feed
    //     topicTweets.remove();
    //     // remove topic itself from topic list
    //     topic.remove();
    //     // and remove topic from list of saved topics
    //     savedTopics.val(savedTopics.val().replace(topicId + ',', ''));

    //     $.ajax({
    //         url: "/.json",
    //         data: { remove: topicId }
    //     }).done(function() {
    //         console.log('savedTerms object updated');
    //     });
    // });
});