// clock.js

var time = new Date();

var clock = {
	hours: 0,
	minutes: 0,
	seconds: 0,
	interval: false,
	military: true,
	show_secs: true,
	init: function() {
		clock.update();
		clock.interval = setInterval( clock.update, 1000 );
	},
	update: function() {
		var hour_ctnr = document.getElementById( "hours" ),
			min_ctnr = document.getElementById( "minutes" ),
			sec_ctnr = document.getElementById( "seconds" );
		time = new Date();
		clock.hours = ( clock.military )? clock.zero_pad( time.getHours() ) : clock.zero_pad( clock.unmil( time.getHours() ) );
		clock.minutes = clock.zero_pad( time.getMinutes() );
		clock.seconds = clock.zero_pad( time.getSeconds() );
		hour_ctnr.innerHTML = clock.hours;
		min_ctnr.innerHTML = clock.minutes;
		if ( clock.show_secs ) {
			sec_ctnr.innerHTML = clock.seconds;
		}
	},
	unmil: function( val ) {

	},
	zero_pad: function( val ) {
		var pad = val.toString();
		if ( val < 10 ) {
			pad = "0" + val;
		}
		return pad;
	}
};