// game of life js

var unit = 8

// cap at 1280 max width or height
if ( window.innerHeight > 1280 ) {
	unit = Math.floor( 8 * window.innerHeight / 1280 );
};
if ( window.innerWidth > 1280 ) {
	unit = Math.floor( 8 * window.innerWidth / 1280 );
};

var width = Math.floor( window.innerWidth/unit )
	, height = Math.floor( window.innerHeight/unit )
	, total = width * height
	, world = []
	, fps = 10
	, playing
	, canvas
	, ctx
	, counter = 0
	, eggs1 = []
	, eggs2 = []
	, eggs3 = []
	, eggs4 = []
	, eggs5 = []
	, bg
	, live
	, dead
	, dead2
	, dead3
	, cycle_favs = true
	, cycle_random = false
	, favIndex = 0
	, cInterval = 10000
	, cIntervals = [ 5000, 10000, 20000, 30000, 60000 ]
	, cIntLabels = [ "5s", "10s", "20s", "30s", "60s" ]
	, cIntIndex = 1
	, colorCycle = setInterval( cycle_colors, cIntervals[ cIntIndex ] )
	, pause = false;

// load favorite colors from localStorage
var favorites = window.localStorage.getItem("GoL_colors");
if ( favorites === null ) { // if we don't have favorites, set and use the default scheme
	set_default();
} else {
	favorites = JSON.parse( window.localStorage.getItem("GoL_colors") );
	shuffle( favorites.array ); // choose a random fav to start with
	bg = favorites.array[0].b;
	live = favorites.array[0].l;
	dead = favorites.array[0].d;
	dead2 = favorites.array[0].d2;
	dead3 = favorites.array[0].d3;
};


// DUAL-STATE KEYS: Previously, we had to store 2 copies of the world--one to iterate over and one to output to.
// The dual-state key pattern allows us to read and act on a single array by preserving the previous state of keys we've already iterated over.
// This works with standard arrays only if there are a maximum of 10 possible dual-states, using 0-9 as our final keys.
// Works perfectly for us since we have 5 possible states (4:alive, 1-3:ghost, 0:dead) that can each move in only 2 directions:
// a.4->4, b.4->3, c.3->4, d.3->2, e.2->4, f.2->1, g.1->4, h.1->0, i.0->4, j.0->0
var keyTo = [ 4, 3, 4, 2, 4, 1, 4, 0, 4, 0 ];
var keyFrom = [ 4, 4, 3, 3, 2, 2, 1, 1, 0, 0 ];


function init() {
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
			console.log("world ready");
			goL.render();
			goL.start();
		}
	}
	// button event listeners
	canvas.addEventListener( "click", function( event ) {
		var menu = document.getElementById( "menu" );
		menu.setAttribute( "class", "hidden" );
		var controls = document.getElementById( "controls" );
		controls.setAttribute( "class", "" );
	}, false );

	var randomizeBtn = document.getElementById( "randomize" );
	randomizeBtn.addEventListener( "click", function( event ) {
		random_color();
		if ( cycle_favs ) {
			cycle_favs = false;
			cycle_random = true;
			var cycleFavsBtn = document.getElementById( "cycle-favs" );
			var cycleRandomBtn = document.getElementById( "cycle-random" );
			cycleFavsBtn.innerHTML = "cycle favs";
			cycleRandomBtn.innerHTML = "&#10003; cycle random";
			reset_cycle();
		}
	}, false );

	var openOptionsBtn = document.getElementById( "controls" );
	openOptionsBtn.addEventListener( "click", function( event ) {
		var menu = document.getElementById( "menu" );
		menu.removeAttribute( "class" );
		var controls = document.getElementById( "controls" );
		controls.setAttribute( "class", "open" );
	}, false );

	var saveFavBtn = document.getElementById( "save-fav" );
	saveFavBtn.addEventListener( "click", function( event ) {
		var confirm = document.getElementById( "color-confirm" );
		confirm.setAttribute( "class", "confirm" );
	}, false );

	var saveYesBtn = document.getElementById( "color-yes" );
	saveYesBtn.addEventListener( "click", function( event ) {
		var colors = {
			b: bg,
			l: live,
			d: dead,
			d2: dead2,
			d3: dead3
		}
		favorites.array.push( colors );
		save_ls();
		var confirm = document.getElementById( "color-confirm" );
		confirm.setAttribute( "class", "confirm hidden" );
	}, false );

	var saveNoBtn = document.getElementById( "color-no" );
	saveNoBtn.addEventListener( "click", function( event ) {
		var confirm = document.getElementById( "color-confirm" );
		confirm.setAttribute( "class", "confirm hidden" );
	}, false );
	saveFavBtn.innerHTML = "save fav (" + favorites.array.length + ")";

	var nextFavBtn = document.getElementById( "next-fav" );
	nextFavBtn.addEventListener( "click", function( event ) {
		next_fav();
		if ( cycle_random ) {
			cycle_favs = true;
			cycle_random = false;
			var cycleFavsBtn = document.getElementById( "cycle-favs" );
			var cycleRandomBtn = document.getElementById( "cycle-random" );
			cycleFavsBtn.innerHTML = "&#10003; cycle favs";
			cycleRandomBtn.innerHTML = "cycle random";
			reset_cycle();
		}
	}, false );

	var deleteFavBtn = document.getElementById( "delete-fav" );
	deleteFavBtn.addEventListener( "click", function( event ) {
		var confirm = document.getElementById( "delete-confirm" );
		confirm.setAttribute( "class", "confirm" );
	}, false );

	var deleteYesBtn = document.getElementById( "delete-yes" );
	deleteYesBtn.addEventListener( "click", function( event ) {
		favorites.array.splice( favIndex, 1 );
		if ( favorites.array.length < 1 ) {
			favIndex = 0;
			set_default();
		}
		save_ls();
		next_fav();
		var confirm = document.getElementById( "delete-confirm" );
		confirm.setAttribute( "class", "confirm hidden" );
	}, false);

	var deleteNoBtn = document.getElementById( "delete-no" );
	deleteNoBtn.addEventListener( "click", function( event ) {
		var confirm = document.getElementById( "delete-confirm" );
		confirm.setAttribute( "class", "confirm hidden" );
	}, false);

	var cycleFavsBtn = document.getElementById( "cycle-favs" );
	var cycleRandomBtn = document.getElementById( "cycle-random" );
	cycleFavsBtn.addEventListener( "click", function( event) {
		if ( cycle_favs ) {
			cycle_favs = false;
			this.innerHTML = "cycle favs"
			cycleRandomBtn.innerHTML = "cycle random";
		} else {
			cycle_favs = true;
			cycle_random = false;
			this.innerHTML = "&#10003; cycle favs"
			cycleRandomBtn.innerHTML = "cycle random";
		}
		cycle_colors();
	}, false );
	cycleRandomBtn.addEventListener( "click", function( event) {
		if ( cycle_random ) {
			cycle_random = false;
			this.innerHTML = "cycle random"
			cycleFavsBtn.innerHTML = "cycle favs";
		} else {
			cycle_random = true;
			cycle_favs = false;
			this.innerHTML = "&#10003; cycle random"
			cycleFavsBtn.innerHTML = "cycle favs";
		}
		cycle_colors();
	}, false );

	var cycleSpeedBtn = document.getElementById( "cycle-speed" );
	cycleSpeedBtn.addEventListener( "click", function( event ) {
		if ( cIntIndex < cIntervals.length-1 ) {
			cIntIndex += 1;
		} else {
			cIntIndex = 0;
		}
		reset_cycle();
	}, false );

	var pauseBtn = document.getElementById( "pause" );
	pauseBtn.addEventListener( "click", function( event ) {
		if ( !pause ) {
			goL.stop();
			pause = true;
			clearInterval( colorCycle );
			this.innerHTML = "play";
		} else {
			goL.start();
			pause = false;
			reset_cycle();
			this.innerHTML = "pause";
		}
	}, false);
};

// GAME CONTROLLER
var goL = {
	render: function() {
		ctx.restore(); // reset the canvas each frame
		ctx.clearRect( 0, 0, width * unit, height * unit );
		for ( var i=0; i<world.length; i++ ) {
			var col = Math.floor( i/width ) * unit;
			var row = Math.floor( i%width ) * unit;
			var to = keyTo[ world[i] ];
			switch ( to ) {
				case 0:
					ctx.fillStyle = "rgb("+bg[0]+","+bg[1]+","+bg[2]+")";
					break;
				case 1:
					ctx.fillStyle = "rgb("+dead3[0]+","+dead3[1]+","+dead3[2]+")";
					break;
				case 2:
					ctx.fillStyle = "rgb("+dead2[0]+","+dead2[1]+","+dead2[2]+")";
					break;
				case 3:
					ctx.fillStyle = "rgb("+dead[0]+","+dead[1]+","+dead[2]+")";
					break;
				case 4:
					ctx.fillStyle = "rgb("+live[0]+","+live[1]+","+live[2]+")";
					break;
			}
			ctx.fillRect( row, col, unit, unit );
		}
		if ( !fps ) {
			window.requestAnimationFrame( goL.parse_world );
		}
	},
	parse_world: function() {
		for ( var i=0; i<world.length; i++ ) {
			// find this cell's neighbors
			// 1 2 3
			// 4 i 5
			// 6 7 8
			var i1 = i-width-1
				, i2 = i-width
				, i3 = i-width+1
				, i4 = i-1
				, i5 = i+1
				, i6 = i+width-1
				, i7 = i+width
				, i8 = i+width+1;

			var indices = [ i1, i2, i3, i4, i5, i6, i7, i8 ]
				, cells = [ 0, 0, 0, 0, 0, 0, 0, 0 ]
				, sum = 0; // total # of neighbors

			for ( var j=0; j<indices.length; j++ ) {
				// world vertical wrap
				if ( indices[j] >= 0 && indices[j] <= world.length ) {
					var look = indices[j];
				} else if ( indices[j] < 0 ) {
					var look = indices[j] + world.length;
				} else if ( indices[j] > world.length ) {
					var look = indices[j] - world.length;
				}
				// evaluate dual-state key of this neighbor (0 or 1, no ghosts)
				if ( j < 4 ) { // already iterated over these
					cells[j] = ( keyFrom[ world[look] ] > 3 )? 1 : 0; 
				} else { // haven't iterated over yet
					cells[j] = ( keyTo[ world[look] ] > 3 )? 1 : 0; 
				}
				// add up neighbors
				sum += cells[j];
			}

			var to = keyTo[ world[i] ];
			var from = keyTo[ world[i] ];

			// CONWAY'S RULES
			if ( from < 4 ) { // DEAD
				if ( sum === 3 ) { // tri-sexual reproduction
					to = 4; // spawn new
				} else {
					if ( world[i] !== 0 ) { // ghost
						to -= 1; // more dead
					}
				}
			} else { // ALIVE
				if ( sum < 2 || sum > 3 ) { // too many or too few neighbors
					to = 3; // die
				}
			}

			// convert to dual-state key
			switch ( from ) {
				case 4:
					if ( to === 4 ) {
						world[i] = 0;
					} else if ( to === 3 ) {
						world[i] = 1;
					}
					break;
				case 3:
					if ( to === 4 ) {
						world[i] = 2;
					} else if ( to === 2 ) {
						world[i] = 3;
					}
					break;
				case 2:
					if ( to === 4 ) {
						world[i] = 4;
					} else if ( to === 1 ) {
						world[i] = 5;
					}
					break;
				case 1:
					if ( to === 4 ) {
						world[i] = 6;
					} else if ( to === 0 ) {
						world[i] = 7;
					}
					break;
				case 0:
					if ( to === 4 ) {
						world[i] = 8;
					} else if ( to === 0 ) {
						world[i] = 9;
					}
					break;
			}
		}
		// check for eggs once every 100 frames
		if ( counter < 100 ) {
			counter += 1;
		} else {
			hatch();
			counter = 0;
		}
		goL.render();
	},
	start: function() {
		if ( !fps ) {
			window.requestAnimationFrame( goL.parse_world );
		} else {
			playing = setInterval( goL.parse_world, (1000/fps) );
		}
	},
	stop: function() {
		clearInterval( playing );
	}
};

function random( a, b ) {
	var c = b - a;
	return Math.floor( Math.random()*c+a );
}

function hatch() {
	var re = new RegExp( "00.{"+(width-2)+"}00", "g" ), // "egg" search
	    str = world.join(""),
	    matches = [];
	while ((match = re.exec(str)) != null) {
	    matches.push( match.index );
	}
	str = null;
	// remember 5 checks
	eggs5 = eggs4.slice();
	eggs4 = eggs3.slice();
	eggs3 = eggs2.slice();
	eggs2 = eggs1.slice();
	eggs1 = matches.slice();

	var hatch = [];

	for ( var j=0; j<eggs1.length; j++ ) {
		var match2 = ( eggs2.indexOf( eggs1[j] ) > -1 )? 1 : 0
			, match3 = ( eggs3.indexOf( eggs1[j] ) > -1 )? 1 : 0
			, match4 = ( eggs4.indexOf( eggs1[j] ) > -1 )? 1 : 0
			, match5 = ( eggs5.indexOf( eggs1[j] ) > -1 )? 1 : 0
			, mature =  match2 + match3 + match4 + match5; 
		if ( mature === 4 ) { // egg must survive 5 checks
			hatch.push( eggs1[j] );
		}
	}

	var rand = random( 0, hatch.length ), // choose one egg at random, if we have any
		hRow = Math.floor( hatch[rand] / width ),
		hCol = Math.floor( hatch[rand] % width );
	for ( var j=0; j<world.length; j++ ) {
		var row = Math.floor( j/width )
			, col = Math.floor( j%width );
		if ( row === hRow  || col === hCol ) { // generate a horizontal and vertical line of live cells
			world[j] = 0;
		}
	}
};

function cycle_colors() {
	if ( cycle_favs ) {
		next_fav();
	} else if ( cycle_random ) {
		random_color();
	}
};

function random_color() {
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
	reset_cycle();
};

function next_fav() {
	if ( favIndex < favorites.array.length-1 ) {
		favIndex += 1;
	} else {
		favIndex = 0;
	}
	bg = favorites.array[ favIndex ].b;
	live = favorites.array[ favIndex ].l;
	dead = favorites.array[ favIndex ].d;
	dead2 = favorites.array[ favIndex ].d2;
	dead3 = favorites.array[ favIndex ].d3;
	reset_cycle();
};

function shuffle( array ) {
	var currentIndex = array.length, temporaryValue, randomIndex;
	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	return array;
};

function reset_cycle() {
	clearInterval( colorCycle );
	colorCycle = setInterval( cycle_colors, cIntervals[ cIntIndex ] );
	var cycleSpeedBtn = document.getElementById( "cycle-speed" );
	cycleSpeedBtn.innerHTML = "cycle speed " + cIntLabels[ cIntIndex ];
};

function set_default() {
	bg = [255, 255, 255]
	live = [0, 0, 0]
	dead = [255, 0, 0]
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
	save_ls();
}

function save_ls() {
	var favstr = JSON.stringify( favorites );
	window.localStorage.setItem( "GoL_colors", favstr );
	var saveFavBtn = document.getElementById( "save-fav" );
	saveFavBtn.innerHTML = "save fav (" + favorites.array.length + ")";
}

// the end.