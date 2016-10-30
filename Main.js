// game of life js

var unit = 8

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
	//, bgColor = [random(0,50), random(0,50), random(0,50)]
	//, liveColor = [random(155,255), random(155,255), random(155,255)]
	//, deadColor = [random(50,155), random(50,155), random(50,155)]
	//, bgColor = [0, 0, 0]
	//, liveColor = [0, 255, 0]
	//, deadColor = [255, 0, 0]
	, counter = 0
	, eggs1 = []
	, eggs2 = []
	, eggs3 = []
	, eggs4 = []
	, eggs5 = [];

// DUAL-STATE KEYS: previously, we had to store 2 copies of the world--one to read and one to act on for the next iteration. the dual-state key pattern allows us to read and act on a single array by preserving the previous state of cells we've already iterated over. this works with a standard array only if the cells have a maximum of 10 possible states, so we can use keys 0-9.
// cases: cells can either go from alive (4) to dead (3), dead (0-3) to more dead (n-1), or dead (0-3) to alive (4)
// a.4->4, b.4->3, c.3->4, d.3->2, e.2->4, f.2->1, g.1->4, h.1->0, i.0->4, j.0->0
var key_to = [ 4, 3, 4, 2, 4, 1, 4, 0, 4, 0 ];
var key_from = [ 4, 4, 3, 3, 2, 2, 1, 1, 0, 0 ];

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

var goL = {
	init: function() {
		canvas = document.getElementById( "stage" )
		ctx = canvas.getContext( '2d' );
		canvas.width = width * unit;
		canvas.height = height * unit;
		for ( var i=0; i<total; i++ ) {
			var rand = ( Math.floor( Math.random() * 2 ) == 0 );
			if (rand) {
				world.push(9);
			} else {
				world.push(0);
			}
			if ( i === total-1 ) {
				console.log("ready");
				goL.render();
				goL.start();
			}
		}
	},
	render: function() {
		ctx.restore();
		ctx.clearRect( 0, 0, width * unit, height * unit );
		for ( var i=0; i<world.length; i++ ) {
			var col = Math.floor( i/width ) * unit;
			var row = Math.floor( i%width ) * unit;
			var to = key_to[ world[i] ];
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
			var i1 = i-1
				, i2 = i+1
				, i3 = i-width
				, i4 = i-width-1
				, i5 = i-width+1
				, i6 = i+width
				, i7 = i+width-1
				, i8 = i+width+1;

			var p1 = ( world[i1] >= 0 )? ( key_from[ world[i1] ] ) : 0
				, p2 = ( world[i2] >= 0 )? ( key_to[ world[i2] ] ) : 0
				, p3 = ( world[i3] >= 0 )? ( key_from[ world[i3] ] ) : 0
				, p4 = ( world[i4] >= 0 )? ( key_from[ world[i4] ] ) : 0
				, p5 = ( world[i5] >= 0 )? ( key_from[ world[i5] ] ) : 0
				, p6 = ( world[i6] >= 0 )? ( key_to[ world[i6] ] ) : 0
				, p7 = ( world[i7] >= 0 )? ( key_to[ world[i7] ] ) : 0
				, p8 = ( world[i8] >= 0 )? ( key_to[ world[i8] ] ) : 0;

			if ( p1>3 ) { p1 = 1; } else { p1 = 0; };
			if ( p2>3 ) { p2 = 1; } else { p2 = 0; };
			if ( p3>3 ) { p3 = 1; } else { p3 = 0; };
			if ( p4>3 ) { p4 = 1; } else { p4 = 0; };
			if ( p5>3 ) { p5 = 1; } else { p5 = 0; };
			if ( p6>3 ) { p6 = 1; } else { p6 = 0; };
			if ( p7>3 ) { p7 = 1; } else { p7 = 0; };
			if ( p8>3 ) { p8 = 1; } else { p8 = 0; };

			var sum = p1 + p2 + p3 + p4 + p5 + p6 + p7 + p8;

			var to = key_to[ world[i] ];
			var from = key_to[ world[i] ];

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

		if ( counter < 100 ) {
			counter += 1;
		} else {
			goL.hatch();
		}
		goL.render();
	},
	hatch: function() {
		var re = new RegExp( "00.{"+(width-2)+"}00", "g" ),
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
			if ( mature === 4 ) {
				hatch.push( eggs1[j] );
			}
		}

		var rand = random( 0, hatch.length ),
			rRow = Math.floor( hatch[rand] / width ),
			rCol = Math.floor( hatch[rand] % width );
		for ( var j=0; j<world.length; j++ ) {
			var row = Math.floor( j/width )
				, col = Math.floor( j%width );
			if ( row === rRow  || col === rCol ) {
				world[j] = 0;
			}
		}
		counter = 0;
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