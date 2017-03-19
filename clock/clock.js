// clock.js

var time = new Date();

var clock = {
	hours: 0,
	minutes: 0,
	seconds: 0,
	interval: false,
	init: function() {
		clock.interval = setInterval( function() {
			time = new Date();
			clock.hours = time.getHours();
			clock.minutes = time.getMinutes();
			clock.seconds = time.getSeconds();
			var hour_ctnr = document.getElementById( "hours" ),
				min_ctnr = document.getElementById( "minutes" ),
				sec_ctnr = document.getElementById( "seconds" );
			hour_ctnr.innerHTML = clock.hours;
			min_ctnr.innerHTML = clock.minutes;
		}, 1000 );
	}
}