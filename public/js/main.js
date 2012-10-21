$(function(){

    var blodger = {

        // Set up socket.io and listen on key events
        socket: io.connect('http://localhost:3000'),

        map: null,
        tours: {},
        gigs: [],
        markers: [],
        iterator: 0,

        loadGoogleMapsApi: function() {
            console.log('loadGoogleMapsApi()');
            var script = document.createElement('script');

            script.type = 'text/javascript';
            script.src  = 'http://maps.googleapis.com/maps/api/js?key=AIzaSyAGX9TMrtwhuQb2kTmYKRz_yAJCFlNcAKA&sensor=false&callback=initializeGoogleMaps';

            document.body.appendChild(script);
        },

        initializeGoogleMaps: function() {
            console.log('initializeGoogleMaps()');
            var sanFrancisco = new google.maps.LatLng(37.781415, -122.393015);

            var mapOptions = {
                center: sanFrancisco,
                zoom: 6,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            // @TODO: rethink hardcoded self reference
            blodger.map = new google.maps.Map(document.getElementById('gmaps-canvas'), mapOptions);

            blodger.showGigsMarkers();
        },

        showGigsMarkers: function() {
            console.log('showGigsMarkers()');

            // Read from cached data
            tours = tourCache;

            // Build'em markers
            this.buildGigMarkers();

            // Drop'em like it's hot
            this.dropMarkers();
        },

        buildGigMarkers: function() {
            console.log('buildGigMarkers()');
            for (var i=0, j=tours.length; i<j; i++) {
                // console.log('band name:', tours[i].name);
                if (tours[i].gigs) {
                    for (var k=0, l=tours[i].gigs.length; k<l; k++) {
                        if (tours[i].gigs[k].venue) {
                            this.gigs.push(new google.maps.LatLng(tours[i].gigs[k].geocodeLat, tours[i].gigs[k].geocodeLng));
                        }
                    }
                }
            }
        },

        dropMarkers: function() {
            console.log('dropMarkers()');
            var self = this;
            for (var i = 0; i < this.gigs.length; i++) {
                setTimeout(function() {
                    self.addSingleMarker();
                }, i * 200);
            }
        },

        addSingleMarker: function(context) {
            console.log('addSingleMarker()');
            this.markers.push(new google.maps.Marker({
                position: this.gigs[this.iterator],
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