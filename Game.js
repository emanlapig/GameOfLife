// GAME of LIFE JS

var unit = 8;

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
	, pause = false;


// DUAL-STATE KEYS: Previously, we had to store 2 copies of the world--one to iterate over and one to output to.
// The dual-state key pattern allows us to read and act on a single array by preserving the previous state of keys we've already iterated over.
// This works with standard arrays only if there are a maximum of 10 possible dual-states, using 0-9 as our final keys.
// Works perfectly for us since we have 5 possible states (4:alive, 1-3:ghost, 0:dead) that can each move in only 2 directions:
// a.4->4, b.4->3, c.3->4, d.3->2, e.2->4, f.2->1, g.1->4, h.1->0, i.0->4, j.0->0
var keyTo = [ 4, 3, 4, 2, 4, 1, 4, 0, 4, 0 ];
var keyFrom = [ 4, 4, 3, 3, 2, 2, 1, 1, 0, 0 ];


// GAME CONTROLLER
function render() {
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
		window.requestAnimationFrame( parse_world );
	}
};

function parse_world() {
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

		var neighbors = [ i1, i2, i3, i4, i5, i6, i7, i8 ]
			, sum = 0; // total # of neighbors

		for ( var j=0; j<neighbors.length; j++ ) {
			// world vertical wrap
			if ( neighbors[j] >= 0 && neighbors[j] <= world.length ) {
				var look = neighbors[j];
			} else if ( neighbors[j] < 0 ) {
				var look = neighbors[j] + world.length;
			} else if ( neighbors[j] > world.length ) {
				var look = neighbors[j] - world.length;
			}
			// evaluate dual-state key of this neighbor (0 or 1, no ghosts)
			if ( j < 4 ) { // already iterated over these
				var cell = ( keyFrom[ world[look] ] === 4 )? 1 : 0; 
			} else { // haven't iterated over yet
				var cell = ( keyTo[ world[look] ] === 4 )? 1 : 0; 
			}
			// add up neighbors
			sum += cell;
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
	render();
};

function start() {
	if ( !fps ) {
		window.requestAnimationFrame( parse_world );
	} else {
		playing = setInterval( parse_world, (1000/fps) );
	}
};

function stop() {
	clearInterval( playing );
};

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

	if ( hatch.length > 0 ) {
		var mid = Math.floor( hatch.length / 2 );
			hRow = Math.floor( hatch[ mid ] / width ),
			hCol = Math.floor( hatch[ mid ] % width );
		for ( var j=0; j<world.length; j++ ) {
			var row = Math.floor( j/width )
				, col = Math.floor( j%width );
			if ( row === hRow || col === hCol ) { // generate a horizontal and vertical line of live cells
				world[j] = 0;
			}
		}
	}
};

// the end.