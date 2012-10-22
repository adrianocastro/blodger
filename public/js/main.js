$(function(){

    var blodger = {

        // Set up socket.io and listen on key events
        socket: io.connect('http://localhost:3000'),

        map: null,
        // Read tours from cache
        tours: tourCache,
        gigs: [],
        markers: [],
        infoWindows: [],
        iterator: 0,
        openInfoWindowIndex: null,
        pinColor: '',
        pinShadow: null,
        pingImage: {},

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

            blodger.createCustomPinMarkers();

            blodger.showGigsMarkers();
        },

        createCustomPinMarkers: function() {
            this.pinShadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
                             new google.maps.Size(40, 37),
                             new google.maps.Point(0, 0),
                             new google.maps.Point(12, 35));

            var pinColors = [
                {
                    'name' : 'available',
                    'color' : '49afcd'
                },
                {
                    'name' : 'offered',
                    'color' : '5bb75b'
                },
                {
                    'name' : 'taken',
                    'color' : 'faa732'
                },
            ]

            for (var i = pinColors.length - 1; i >= 0; i--) {
                this.pingImage[pinColors[i].name]  = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColors[i].color,
                                 new google.maps.Size(21, 34),
                                 new google.maps.Point(0,0),
                                 new google.maps.Point(10, 34));

            };
        },

        showGigsMarkers: function() {
            console.log('showGigsMarkers()');

            // Build'em markers
            this.buildGigMarkers();

            // Drop'em like it's hot
            this.dropMarkers();
        },

        buildGigMarkers: function() {
            console.log('buildGigMarkers()');
            for (var i=0, j=this.tours.length; i<j; i++) {
                var band = this.tours[i];
                if (band.gigs) {
                    for (var k=0, l=band.gigs.length; k<l; k++) {
                        var gig = band.gigs[k];
                        if (gig.venue) {
                            this.gigs.push({
                                'pos': new google.maps.LatLng(gig.geocodeLat, gig.geocodeLng),
                                'name': band.name,
                                'id': band.id,
                                'gigId': band.id + '-' + gig.date,
                                'venue': gig.venue,
                                'location': gig.location,
                                'date': gig.date,
                                'title': band.name + ' @ ' + gig.venue + ', ' + gig.location
                            });
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

        addSingleMarker: function() {
            console.log('addSingleMarker()');
            var gig = this.gigs[this.iterator];

            // Create individual marker
            this.markers.push(new google.maps.Marker({
                position: gig.pos,
                map: this.map,
                title: gig.title,
                bandId: gig.id,
                gigId: gig.gigId,
                draggable: false,
                icon: this.pingImage['available'],
                shadow: this.pinShadow,
                animation: google.maps.Animation.DROP
            }));

            // Create individual info window
            // @TODO: consider using client-side dust templates instead of mixing markup with JS
            var infoWindowContent =  '<div class="info-window" data-title="' + gig.title + '" data-id="' + gig.gigId + '" data-markerid="' + this.iterator + '">'+
                '<p class="band">' + gig.name + '</p>'+
                '<p>' + gig.venue + '</p>'+
                '<p>' + gig.location + '</p>'+
                '<button type="button" class="offer-lodging btn btn-block btn-primary">Offer lodging</button>'+
                '</div>';

            this.infoWindows.push(new google.maps.InfoWindow({
                content: infoWindowContent
            }));

            var self = this;
            google.maps.event.addListener(
                this.markers[this.iterator],
                'click',
                (function(iterator) {
                    return function() {
                        // Close previously open info windows
                        if (null !== self.openInfoWindowIndex) {
                            self.infoWindows[self.openInfoWindowIndex].close();
                        }
                        // Open a new info window
                        self.infoWindows[iterator].open(self.map, self.markers[iterator]);
                        // Save a reference to its index to later close it
                        self.openInfoWindowIndex = iterator;
                    }
                }(this.iterator))
            );
            this.iterator++;
        },

        filterMarkers: function(bandId) {
            console.log('filterMarkers(' + bandId + ')');
            // Close any open info windows
            if (null !== this.openInfoWindowIndex) {
                this.infoWindows[this.openInfoWindowIndex].close();
            }

            // Go through markers and hide/show according to filter
            for (var i = this.markers.length - 1; i >= 0; i--) {
                // Hide markers for bands that don't match the current filter
                if (bandId !== 'all-bands' && this.markers[i].bandId !== bandId) {
                    this.markers[i].setVisible(false);
                } else {
                    this.markers[i].setVisible(true);
                }
            };
        },

        updateMarker: function(markerId, gigId) {
            console.log('updateMarker(' + markerId + ', ' + gigId + ')');
            // If updateMarker is called with markerId then it's
            // an active client making a lodging offer
            if (markerId) {
                this.markers[markerId].setIcon(this.pingImage['offered']);
            } else {
                // Otherwise it's being called as a consequence of an 'offer-made'
                // event and we mark it as taken

                // Go through markers and hide/show according to filter
                for (var i = this.markers.length - 1; i >= 0; i--) {
                    // Hide markers for bands that don't match the current filter
                    if (this.markers[i].gigId === gigId) {
                        this.markers[i].setIcon(this.pingImage['taken']);
                    }
                };
            }
        }
    }


    //
    // Google Maps API
    //

    // Expose Google Maps initialisation callback
    window.initializeGoogleMaps = blodger.initializeGoogleMaps;

    // Asynchronously load the Google Maps API script
    blodger.loadGoogleMapsApi();


    //
    // Socket.io
    //

    // Set up socket.io events
    blodger.socket.on('connection-on', function (data) {
        console.log('Socket.io is on. Message from server:', data.status);
    });
    blodger.socket.on('offer-made', function (data) {
        console.log('The server says:', data.status);

        console.log('Offer made for ' + data.gig.title + '(' + data.gig.id + ')');

        blodger.updateMarker(null, data.gig.id);

        // @TODO: consider using client-side dust templates instead of mixing markup with JS
        var alertMessage = '<div class="alert">' +
            '<button type="button" class="close" data-dismiss="alert">×</button>' +
            '<strong>Attention!</strong> An offer has been made on ' + data.gig.title +
            '</div>';
        $('.alerts').html(alertMessage + $('.alerts').html() );
    });


    //
    // Events
    //

    // Event delegation for clicks
    $("body").on("click", function (e){
        var target = e.target;

        // Handle lodging offers
        if ($(target).hasClass('offer-lodging')) {
            e.preventDefault();
            var gig      = $(target).parent(),
                gigId    = gig.attr('data-id');
                markerId = gig.attr('data-markerid');
                gigTitle = gig.attr('data-title');

            // Update the look of the button and the marker
            $(target).attr('disabled', 'disabled').addClass('disabled offered').text('Lodging offered');
            blodger.updateMarker(markerId, null);

            // Emit a 'client-offer' event
            blodger.socket.emit('client-offer', { status: 'An offer has been made', gig: { 'title': gigTitle, 'id': gigId} });
        };

        // Handle band filtering
        if ($(target).hasClass('band-filter') || $(target).parent().hasClass('band-filter')) {
            var bandId = $(target).attr('data-id') || $(target).parent().attr('data-id');
            blodger.filterMarkers(bandId);
        }

    });
});