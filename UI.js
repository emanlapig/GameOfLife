// GoL UI JS

var favorites = window.localStorage.getItem("GoL_colors"); // load favorite colors from localStorage

function init() {
	// favorite colors
	if ( favorites === null ) { // if we don't have favorites, set and use the default scheme
		Colors.set_default();
	} else {
		favorites = JSON.parse( window.localStorage.getItem("GoL_colors") );
		shuffle( favorites.array ); // randomize our favorites list
		bg = favorites.array[0].b;
		live = favorites.array[0].l;
		dead = favorites.array[0].d;
		dead2 = favorites.array[0].d2;
		dead3 = favorites.array[0].d3;
	};

	canvas = document.getElementById( "stage" );
	ctx = canvas.getContext( '2d' );
	canvas.width = width * unit;
	canvas.height = height * unit;

	// generate random world seed
	for ( var i=0; i<total; i++ ) {
		var rand = ( Math.floor( Math.random() * 2 ) == 0 );
		if (rand) {
			world.push(9);
		} else {
			world.push(0);
		}
		if ( i === total-1 ) {
			//console.log("world ready");
			render();
			start();
		}
	}

	UI.init();
	// event listeners for options menu toggle
	canvas.addEventListener( "click", UI.btn_functions.toggle_options, false );
	UI.btns.controls.addEventListener( "click", UI.btn_functions.toggle_options, false );
};

var UI = {
	options_open: false,
	btns: {},
	btn_functions: {
		toggle_options: function() {
			if ( !UI.options_open ) {
				var menu = document.getElementById( "menu" );
				menu.removeAttribute( "class" );
				var controls = document.getElementById( "controls" );
				controls.setAttribute( "class", "open" );
				UI.options_open = true;
				setTimeout( UI.bind_btn_events, 10 );
			} else {
				var menu = document.getElementById( "menu" );
				menu.setAttribute( "class", "hidden" );
				var controls = document.getElementById( "controls" );
				controls.removeAttribute( "class" );
				UI.options_open = false;
				setTimeout( UI.unbind_btn_events, 10 );;
			}
		},
		randomize: function() {
			Colors.random_color();
			if ( Cycle.cycle_favs ) {
				Cycle.cycle_favs = false;
				Cycle.cycle_random = true;
				UI.btns.cycleFavs.innerHTML = "cycle favs";
				UI.btns.cycleRand.innerHTML = "&#10003; cycle random";
				Cycle.reset();
			}
		},
		save_fav: {
			confirm: function() {
				var confirm = document.getElementById( "color-confirm" );
				confirm.setAttribute( "class", "confirm" );
				if ( !pause ) {
					UI.btn_functions.pause();
				}
			},
			yes: function() {
				var colors = {
					b: bg,
					l: live,
					d: dead,
					d2: dead2,
					d3: dead3
				}
				favorites.array.push( colors );
				Colors.save_ls();
				var confirm = document.getElementById( "color-confirm" );
				confirm.setAttribute( "class", "confirm hidden" );
				if ( pause ) {
					UI.btn_functions.pause();
				}
			},
			no: function() {
				var confirm = document.getElementById( "color-confirm" );
				confirm.setAttribute( "class", "confirm hidden" );
				if ( pause ) {
					UI.btn_functions.pause();
				}	
			}
		},
		next_fav: function() {
			Colors.next_fav();
			if ( Cycle.cycle_random ) {
				Cycle.cycle_favs = true;
				Cycle.cycle_random = false;
				UI.btns.cycleFavs.innerHTML = "&#10003; cycle favs";
				UI.btns.cycleRand.innerHTML = "cycle random";
				Cycle.reset();
			}
		},
		del_fav: {
			confirm: function() {
				var confirm = document.getElementById( "delete-confirm" );
				confirm.setAttribute( "class", "confirm" );
				if ( !pause ) {
					UI.btn_functions.pause();
				}
			},
			yes: function() {
				favorites.array.splice( Colors.favIndex, 1 );
				if ( favorites.array.length < 1 ) {
					Colors.favIndex = 0;
					Colors.set_default();
				}
				Colors.save_ls();
				Colors.next_fav();
				var confirm = document.getElementById( "delete-confirm" );
				confirm.setAttribute( "class", "confirm hidden" );
				if ( pause ) {
					UI.btn_functions.pause();
				}
			},
			no: function() {
				var confirm = document.getElementById( "delete-confirm" );
				confirm.setAttribute( "class", "confirm hidden" );
				if ( pause ) {
					UI.btn_functions.pause();
				}
			}
		},
		cycle_favs: function() {
			if ( Cycle.cycle_favs ) {
				Cycle.cycle_favs = false;
				this.innerHTML = "cycle favs"
				UI.btns.cycleRand.innerHTML = "cycle random";
				UI.btns.countdown.innerHTML = "next: 0s";
				Cycle.pause();
			} else {
				Cycle.cycle_favs = true;
				Cycle.cycle_random = false;
				this.innerHTML = "&#10003; cycle favs";
				UI.btns.cycleRand.innerHTML = "cycle random";
				Cycle.reset();
			}
			Colors.go_next();
		},
		cycle_rand: function() {
			if ( Cycle.cycle_random ) {
				Cycle.cycle_random = false;
				this.innerHTML = "cycle random"
				UI.btns.cycleFavs.innerHTML = "cycle favs";
				UI.btns.countdown.innerHTML = "next: 0s";
				Cycle.pause();
			} else {
				Cycle.cycle_random = true;
				Cycle.cycle_favs = false;
				this.innerHTML = "&#10003; cycle random";
				UI.btns.cycleFavs.innerHTML = "cycle favs";
				Cycle.reset();
			}
			Colors.go_next();
		},
		cycle_speed: function() {
			if ( Cycle.intIndex < Cycle.intervals.length-1 ) {
				Cycle.intIndex += 1;
			} else {
				Cycle.intIndex = 0;
			}
			Cycle.reset();
		},
		pause: function() {
			if ( !pause ) {
				stop();
				pause = true;
				Cycle.pause();
				UI.btns.pause.innerHTML = "play";
			} else {
				start();
				pause = false;
				Cycle.reset();
				UI.btns.pause.innerHTML = "pause";
			}
		}
	},
	init: function() {
		UI.btns.randomize = document.getElementById( "randomize" );
		UI.btns.options = document.getElementById( "options-btn" );
		UI.btns.controls = document.getElementById( "controls" );
		UI.btns.save = document.getElementById( "save-fav" );
		UI.btns.saveYes = document.getElementById( "color-yes" );
		UI.btns.saveNo = document.getElementById( "color-no" );
		UI.btns.next = document.getElementById( "next-fav" );
		UI.btns.delete = document.getElementById( "delete-fav" );
		UI.btns.delYes = document.getElementById( "delete-yes" );
		UI.btns.delNo = document.getElementById( "delete-no" );
		UI.btns.cycleFavs = document.getElementById( "cycle-favs" );
		UI.btns.cycleRand = document.getElementById( "cycle-random" );
		UI.btns.cycleSpeed = document.getElementById( "cycle-speed" );
		UI.btns.pause = document.getElementById( "pause" );
		UI.btns.countdown = document.getElementById( "countdown" );
		UI.btns.save.innerHTML = "save fav (" + favorites.array.length + ")";
	},
	bind_btn_events: function() {
		UI.btns.controls.removeEventListener( "click", UI.btn_functions.toggle_options, false );
		UI.btns.randomize.addEventListener( "click", UI.btn_functions.randomize, false );
		UI.btns.save.addEventListener( "click", UI.btn_functions.save_fav.confirm, false );
		UI.btns.saveYes.addEventListener( "click", UI.btn_functions.save_fav.yes, false );
		UI.btns.saveNo.addEventListener( "click", UI.btn_functions.save_fav.no, false );
		UI.btns.next.addEventListener( "click", UI.btn_functions.next_fav, false );
		UI.btns.delete.addEventListener( "click", UI.btn_functions.del_fav.confirm, false );
		UI.btns.delYes.addEventListener( "click", UI.btn_functions.del_fav.yes, false);
		UI.btns.delNo.addEventListener( "click", UI.btn_functions.del_fav.no, false);
		UI.btns.cycleFavs.addEventListener( "click", UI.btn_functions.cycle_favs, false );
		UI.btns.cycleRand.addEventListener( "click", UI.btn_functions.cycle_rand, false );
		UI.btns.cycleSpeed.addEventListener( "click", UI.btn_functions.cycle_speed, false );
		UI.btns.pause.addEventListener( "click", UI.btn_functions.pause, false );
		UI.btns.options.addEventListener( "click", UI.btn_functions.toggle_options, false );
	},
	unbind_btn_events: function() {
		UI.btns.randomize.removeEventListener( "click", UI.btn_functions.randomize, false );
		UI.btns.options.removeEventListener( "click", UI.btn_functions.toggle_options, false );
		UI.btns.save.removeEventListener( "click", UI.btn_functions.save_fav.confirm, false );
		UI.btns.saveYes.removeEventListener( "click", UI.btn_functions.save_fav.yes, false );
		UI.btns.saveNo.removeEventListener( "click", UI.btn_functions.save_fav.no, false );
		UI.btns.next.removeEventListener( "click", UI.btn_functions.next_fav, false );
		UI.btns.delete.removeEventListener( "click", UI.btn_functions.del_fav.confirm, false );
		UI.btns.delYes.removeEventListener( "click", UI.btn_functions.del_fav.yes, false);
		UI.btns.delNo.removeEventListener( "click", UI.btn_functions.del_fav.no, false);
		UI.btns.cycleFavs.removeEventListener( "click", UI.btn_functions.cycle_favs, false );
		UI.btns.cycleRand.removeEventListener( "click", UI.btn_functions.cycle_rand, false );
		UI.btns.cycleSpeed.removeEventListener( "click", UI.btn_functions.cycle_speed, false );
		UI.btns.pause.removeEventListener( "click", UI.btn_functions.pause, false);
		UI.btns.controls.addEventListener( "click", UI.btn_functions.toggle_options, false );
	}
};

var Colors = {
	favIndex: 0,
	go_next: function() {
		if ( Cycle.cycle_favs ) {
			Colors.next_fav();
		} else if ( Cycle.cycle_random ) {
			Colors.random_color();
		}
		Colors.dark();
	},
	next_fav: function() {
		if ( Colors.favIndex < favorites.array.length-1 ) {
			Colors.favIndex += 1;
		} else {
			Colors.favIndex = 0;
		}
		bg = favorites.array[ Colors.favIndex ].b;
		live = favorites.array[ Colors.favIndex ].l;
		dead = favorites.array[ Colors.favIndex ].d;
		dead2 = favorites.array[ Colors.favIndex ].d2;
		dead3 = favorites.array[ Colors.favIndex ].d3;
		Cycle.reset();
		Colors.dark();
	},
	random_color: function() {
		bg = [ Math.floor( random(0,255) ), Math.floor( random(0,255) ), Math.floor( random(0,255) ) ];
		live = [ Math.floor( random(0,255) ), Math.floor( random(0,255) ), Math.floor( random(0,255) ) ];
		dead = [ Math.floor( random(0,255) ), Math.floor( random(0,255) ), Math.floor( random(0,255) ) ];
		dead2 = [
			Math.floor( Number( dead[0] + (bg[0] - dead[0])*(1/3) ) ),
			Math.floor( Number( dead[1] + (bg[1] - dead[1])*(1/3) ) ),
			Math.floor( Number( dead[2] + (bg[2] - dead[2])*(1/3) ) ),
		];
		dead3 = [
			Math.floor( Number( dead[0] + (bg[0] - dead[0])*(2/3) ) ),
			Math.floor( Number( dead[1] + (bg[1] - dead[1])*(2/3) ) ),
			Math.floor( Number( dead[2] + (bg[2] - dead[2])*(2/3) ) ),
		];
		Cycle.reset();
		Colors.dark();
	},
	dark: function() {
		var darkness = bg[0] + bg[1] + bg[2];
		if ( darkness < 382 ) {
			if ( clock.ctnr ) {
				$( clock.ctnr ).addClass( "dark" );
			}
			if ( weather.ctnr ) {
				$( weather.ctnr ).addClass( "dark" );
			}
		} else {
			if ( clock.ctnr ) {
				 $( clock.ctnr ).removeClass( "dark" );
			}
			if ( weather.ctnr ) {
				$( weather.ctnr ).removeClass( "dark" );
			}
		}
	},
	set_default: function() {
		bg = [255, 255, 255] // white
		live = [0, 0, 0] // black
		dead = [255, 0, 0] // red
		dead2 = [
			Math.floor( Number( dead[0] + (bg[0] - dead[0])*(1/3) ) ),
			Math.floor( Number( dead[1] + (bg[1] - dead[1])*(1/3) ) ),
			Math.floor( Number( dead[2] + (bg[2] - dead[2])*(1/3) ) ),
		];
		dead3 = [
			Math.floor( Number( dead[0] + (bg[0] - dead[0])*(2/3) ) ),
			Math.floor( Number( dead[1] + (bg[1] - dead[1])*(2/3) ) ),
			Math.floor( Number( dead[2] + (bg[2] - dead[2])*(2/3) ) ),
		];
		favorites = { array: [
			{
				b: bg,
				l: live,
				d: dead,
				d2: dead2,
				d3: dead3
			}
		]};
		Colors.save_ls();
	},
	save_ls: function() {
		var favstr = JSON.stringify( favorites );
		window.localStorage.setItem( "GoL_colors", favstr );
		favorites = JSON.parse( window.localStorage.getItem("GoL_colors") );
		setTimeout( function() {
			UI.btns.save.innerHTML = "save fav (" + favorites.array.length + ")";
		}, 500 );
	}
};

var Cycle = {
	cycle_favs: true,
	cycle_random: false,
	intervals: [ 5000, 10000, 20000, 30000, 60000 ],
	intIndex: 1,
	counter: 0,
	reset: function() {
		clearInterval( cycleInt );
		cycleInt = setInterval( Colors.go_next, Cycle.intervals[ Cycle.intIndex ] );
		UI.btns.cycleSpeed.innerHTML = "cycle speed " + ( Cycle.intervals[ Cycle.intIndex ] / 1000 ) + "s";
		Cycle.reset_counter();
	},
	update_counter: function() {
		if ( Cycle.counter !== Cycle.intervals[ Cycle.intIndex ] ) {
			Cycle.counter += 1000;
		} else {
			Cycle.counter = 0;
		}
		var time = ( Cycle.intervals[ Cycle.intIndex ] - Cycle.counter ) / 1000;
		UI.btns.countdown.innerHTML = "next: " + time + "s";
	},
	reset_counter: function() {
		Cycle.counter = Cycle.intervals[ Cycle.intIndex ];
		Cycle.update_counter();
		clearInterval( cycleCounterInt );
		cycleCounterInt = setInterval( Cycle.update_counter, 1000 );
	},
	pause: function() {
		clearInterval( cycleInt );
		clearInterval( cycleCounterInt );
	}
};

// cycle intervals
var cycleInt = setInterval( Colors.go_next, Cycle.intervals[ Cycle.intIndex ] );
var cycleCounterInt = setInterval( Cycle.update_counter, 1000 );

// random functions, literally
function shuffle( array ) {
	var currentIndex = array.length, temporaryValue, randomIndex;
	// while there remain elements to shuffle...
	while ( 0 !== currentIndex ) {
		// pick a remaining element...
		randomIndex = Math.floor( Math.random() * currentIndex );
		currentIndex -= 1;
		// and swap it with the current element
		temporaryValue = array[ currentIndex ];
		array[ currentIndex ] = array[ randomIndex ];
		array[ randomIndex ] = temporaryValue;
	}
	return array;
};

function random( a, b ) {
	var c = b - a;
	return Math.floor( Math.random()*c+a );
};