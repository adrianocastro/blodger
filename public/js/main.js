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

            // Build'em markers
            this.buildGigMarkers();

            // Drop'em like it's hot
            this.dropMarkers();
        },

        buildGigMarkers: function() {
            console.log('buildGigMarkers()');
            for (var i=0, j=this.tours.length; i<j; i++) {
                var band = this.tours[i];
                // console.log('band name:', tours[i].name);
                if (band.gigs) {
                    for (var k=0, l=band.gigs.length; k<l; k++) {
                        var gig = band.gigs[k];
                        if (gig.venue) {
                            this.gigs.push({
                                'pos': new google.maps.LatLng(gig.geocodeLat, gig.geocodeLng),
                                'name': band.name,
                                'venue': gig.venue,
                                'location': gig.location,
                                'date': gig.date,
                                'title': band.name + ': ' + gig.venue + ', ' + gig.location
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

        addSingleMarker: function(context) {
            console.log('addSingleMarker()');
            var gig = this.gigs[this.iterator];

            // Create individual marker
            this.markers.push(new google.maps.Marker({
                position: gig.pos,
                map: this.map,
                title: gig.title,
                draggable: false,
                animation: google.maps.Animation.DROP
            }));

            // Create individual info window
            // @TODO: consider using client-side dust templates instead of mixing markup with JS
            var infoWindowContent =  '<div class="info-window" data-id="' + gig.name + '-' + gig.date + '">'+
                '<p class="band">' + gig.name + '</p>'+
                '<p>' + gig.venue + '</p>'+
                '<p>' + gig.location + '</p>'+
                '<button class="offer-lodging btn btn-block btn-primary">Offer lodging</button>'+
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
        }
    }


    // Asynchronously load the Google Maps API script
    blodger.loadGoogleMapsApi();

    blodger.socket.on('connection-on', function (data) {
        console.log('Socket.io is on. Message from server:', data.status);
    });
    blodger.socket.on('offer-made', function (data) {
        console.log('The server says:', data.status);
    });

    // Expose Google Maps initialisation callback
    window.initializeGoogleMaps = blodger.initializeGoogleMaps;
    window.blodger = blodger;

    /**
      *
      * Event delegation for clicks
      *
     **/
    $("body").on("click", function (e){
        var target = e.target;

        if ($(target).hasClass('offer-lodging')) {
            e.preventDefault();
            var gig = $(target).parent(),
                gigId = gig.attr('data-id');
            console.log('offer button for ' + gigId);
            blodger.socket.emit('client-offer', { status: 'An offer has been made', gig: gigId });
        };
    });
});