// game of life js

var unit = 8

// cap at 1280 max width or height
if ( window.innerHeight > 1280 ) {
	unit = Math.floor( 8 * window.innerHeight / 1280 );
}
if ( window.innerWidth > 1280 ) {
	unit = Math.floor( 8 * window.innerWidth / 1280 );
} 

var width = Math.floor( window.innerWidth/unit )
	, height = Math.floor( window.innerHeight/unit )
	, total = width * height
	, world = []
	, fps = 12
	, playing
	, canvas
	, ctx
	, bgColor = [random(0,255), random(0,255), random(0,255)]
	, liveColor = [random(0,255), random(0,255), random(0,255)]
	, deadColor = [random(0,255), random(0,255), random(0,255)]
	, counter = 0
	, eggs1 = []
	, eggs2 = []
	, eggs3 = []
	, eggs4 = []
	, eggs5 = [];

// ghost color gradient
var deadColor2 = [
	Math.floor( Number( deadColor[0] + (bgColor[0] - deadColor[0])*(1/3) ) ),
	Math.floor( Number( deadColor[1] + (bgColor[1] - deadColor[1])*(1/3) ) ),
	Math.floor( Number( deadColor[2] + (bgColor[2] - deadColor[2])*(1/3) ) ),
];
var deadColor3 = [
	Math.floor( Number( deadColor[0] + (bgColor[0] - deadColor[0])*(2/3) ) ),
	Math.floor( Number( deadColor[1] + (bgColor[1] - deadColor[1])*(2/3) ) ),
	Math.floor( Number( deadColor[2] + (bgColor[2] - deadColor[2])*(2/3) ) ),
];


// DUAL-STATE KEYS: Previously, we had to store 2 copies of the world--one to iterate over and one to output to.
// The dual-state key pattern allows us to read and act on a single array by preserving the previous state of keys we've already iterated over.
// This works with standard arrays only if there are a maximum of 10 possible dual-states, using 0-9 as our final keys.
// Works perfectly for us since we have 5 possible states (4:alive, 1-3:ghost, 0:dead) that can each move in only 2 directions:
// a.4->4, b.4->3, c.3->4, d.3->2, e.2->4, f.2->1, g.1->4, h.1->0, i.0->4, j.0->0
var keyTo = [ 4, 3, 4, 2, 4, 1, 4, 0, 4, 0 ];
var keyFrom = [ 4, 4, 3, 3, 2, 2, 1, 1, 0, 0 ];


var goL = {
	init: function() {
		canvas = document.getElementById( "stage" )
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
	},
	render: function() {
		ctx.restore(); // reset the canvas each frame
		ctx.clearRect( 0, 0, width * unit, height * unit );
		for ( var i=0; i<world.length; i++ ) {
			var col = Math.floor( i/width ) * unit;
			var row = Math.floor( i%width ) * unit;
			var to = keyTo[ world[i] ];
			switch ( to ) {
				case 0:
					ctx.fillStyle = "rgb("+bgColor[0]+","+bgColor[1]+","+bgColor[2]+")";
					break;
				case 1:
					ctx.fillStyle = "rgb("+deadColor3[0]+","+deadColor3[1]+","+deadColor3[2]+")";
					break;
				case 2:
					ctx.fillStyle = "rgb("+deadColor2[0]+","+deadColor2[1]+","+deadColor2[2]+")";
					break;
				case 3:
					ctx.fillStyle = "rgb("+deadColor[0]+","+deadColor[1]+","+deadColor[2]+")";
					break;
				case 4:
					ctx.fillStyle = "rgb("+liveColor[0]+","+liveColor[1]+","+liveColor[2]+")";
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
			goL.hatch();
			counter = 0;
		}
		goL.render();
	},
	hatch: function() {
		var re = new RegExp( "00.{"+(width-2)+"}00", "g" ), // "egg" search
		    str = world.join(""),
		    matches = [];
		while ((match = re.exec(str)) != null) {
		    matches.push( match.index );
		}
		str = "";
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
			rRow = Math.floor( hatch[rand] / width ),
			rCol = Math.floor( hatch[rand] % width );
		for ( var j=0; j<world.length; j++ ) {
			var row = Math.floor( j/width )
				, col = Math.floor( j%width );
			if ( row === rRow  || col === rCol ) { // generate a horizontal and vertical line
				world[j] = 0;
			}
		}
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

// the end.