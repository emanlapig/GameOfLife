// clock.js

var time = new Date();

var clock = {
	hours: 0,
	minutes: 0,
	seconds: 0,
	month: "",
	day: "",
	date: 1,
	interval: false,
	military: false,
	show_secs: true,
	ctnr: "clock",
	days_arr: [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday"
	],
	months_arr: [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December"
	],
	ampm: "am",
	init: function() {
		clock.update();
		clock.interval = setInterval( clock.update, 1000 );
	},
	update: function() {
		var hour_ctnr = document.getElementById( "hours" ),
			min_ctnr = document.getElementById( "minutes" ),
			sec_ctnr = document.getElementById( "seconds" ),
			ampm_ctnr = document.getElementById( "ampm" ),
			month_ctnr = document.getElementById( "month" ),
			day_ctnr = document.getElementById( "day" ),
			date_ctnr = document.getElementById( "date" );
		time = new Date();
		clock.hours = ( clock.military )? clock.zero_pad( time.getHours() ) : clock.unmil( time.getHours() );
		clock.minutes = clock.zero_pad( time.getMinutes() );
		clock.seconds = clock.zero_pad( time.getSeconds() );
		hour_ctnr.innerHTML = clock.hours;
		min_ctnr.innerHTML = clock.minutes;
		if ( clock.show_secs ) {
			sec_ctnr.innerHTML = clock.seconds;
		}
		if ( !clock.military ) {
			ampm_ctnr.innerHTML = clock.ampm;
		}
		clock.month = time.getMonth();
		clock.day = time.getDay();
		clock.date = time.getDate();
		month_ctnr.innerHTML = clock.months_arr[ clock.month ];
		day_ctnr.innerHTML = clock.days_arr[ clock.day ];
		date_ctnr.innerHTML = clock.date;
	},
	unmil: function( val ) {
		var unmil = val;
		if ( val > 12 ) {
			unmil -= 12;
			clock.ampm = "pm";
		} else {
			if ( val < 1 ) {
				unmil = 12;
			}
			clock.ampm = "am";
		}
		return unmil.toString();
	},
	zero_pad: function( val ) {
		var pad = val.toString();
		if ( val < 10 ) {
			pad = "0" + val;
		}
		return pad;
	}
};

var weather = {
	interval: false,
	ctnr: "weather",
	init: function() {
		weather.update();
		weather.interval = setInterval( weather.update, 300000 );
	},
	update: function() {
		$.simpleWeather({
			location: 'New York, NY',
			woeid: '',
			unit: 'f',
			success: function( weather ) {
				$( "#weather" ).removeClass( "hidden" );
				var $icon_ctnr = $( "#weather #icon" ),
					$hi_ctnr = $( "#weather #hilo #hi" ),
					$lo_ctnr = $( "#weather #hilo #lo" ),
					$h2 = $( "#weather h2" );

				$icon_ctnr.html( '<i class="icon-' + weather.code + '"></i>' );
				$hi_ctnr.html( 'Hi ' + weather.high + '&deg;' );
				$lo_ctnr.html( 'Lo ' + weather.low + '&deg;' );
				$h2.html( weather.temp + '&deg;' + weather.units.temp );
			},
			error: function( error ) {
				$( "#weather" ).addClass( "hidden" );
				console.log( error );
			}
		});
	}
}