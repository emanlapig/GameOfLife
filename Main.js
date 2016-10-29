// game of life js

var unit = 6

if ( window.innerHeight > 1280 ) {
	unit = Math.floor( 6 * window.innerHeight / 1280 );
}
if ( window.innerWidth > 1280 ) {
	unit = Math.floor( 6 * window.innerWidth / 1280 );
} 

var width = Math.floor( window.innerWidth/unit )
	, height = Math.floor( window.innerHeight/unit )
	, total = width * height
	, world = []
	, world2 = []
	, fps = 9
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
				world.push(4);
			} else {
				world.push(0);
			}
			if ( i === total-1 ) {
				console.log("ready");
				world2 = world.slice();
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
			switch ( world[i] ) {
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
		world2 = [];
	},
	parse_world: function() {
		world2 = [];
		world2 = world.slice();
		for ( var i=0; i<world.length; i++ ) {
			var i1 = i-1
				, i2 = i+1
				, i3 = i-width
				, i4 = i-width-1
				, i5 = i-width+1
				, i6 = i+width
				, i7 = i+width-1
				, i8 = i+width+1;

			var p1 = ( world[i1] >= 0 )? ( world[i1] ) : 0
				, p2 = ( world[i2] >= 0 )? ( world[i2] ) : 0
				, p3 = ( world[i3] >= 0 )? ( world[i3] ) : 0
				, p4 = ( world[i4] >= 0 )? ( world[i4] ) : 0
				, p5 = ( world[i5] >= 0 )? ( world[i5] ) : 0
				, p6 = ( world[i6] >= 0 )? ( world[i6] ) : 0
				, p7 = ( world[i7] >= 0 )? ( world[i7] ) : 0
				, p8 = ( world[i8] >= 0 )? ( world[i8] ) : 0;

			if ( p1>3 ) { p1 = 1; } else { p1 = 0; };
			if ( p2>3 ) { p2 = 1; } else { p2 = 0; };
			if ( p3>3 ) { p3 = 1; } else { p3 = 0; };
			if ( p4>3 ) { p4 = 1; } else { p4 = 0; };
			if ( p5>3 ) { p5 = 1; } else { p5 = 0; };
			if ( p6>3 ) { p6 = 1; } else { p6 = 0; };
			if ( p7>3 ) { p7 = 1; } else { p7 = 0; };
			if ( p8>3 ) { p8 = 1; } else { p8 = 0; };

			var sum = p1 + p2 + p3 + p4 + p5 + p6 + p7 + p8;

			if ( world[i] < 4 ) {
				if ( sum === 3 ) {
					world2[i] = 4;
				} else {
					if ( world[i] !== 0 ) {
						world2[i] -= 1;
					}
				}
			} else {
				if ( sum < 2 || sum > 3 ) {
					world2[i] = 3;
				}
			}
		}

		if ( counter < 100 ) {
			counter += 1;
		} else {
			goL.hatch();
		}
		world = world2.slice();
		world2 = [];
		goL.render();
	},
	hatch: function() {
		var re = new RegExp( "044.{"+(width-2)+"}440", "g" ),
		    str = world2.join(""),
		    matches = [];
		while ((match = re.exec(str)) != null) {
		    matches.push( match.index );
		}
		str = "";
		//console.log(matches);
		eggs5 = eggs4.slice();
		eggs4 = eggs3.slice();
		eggs3 = eggs2.slice();
		eggs2 = eggs1.slice();
		eggs1 = matches.slice();
		//eggs1 = matches.slice();

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

		/*for ( var j=0; j<hatch.length; j++ ) {
			var mRow = Math.floor( hatch[j] / width )
				, mCol = Math.floor( hatch[j] % width );
			for ( var k=0; k<world2.length; k++ ) {
				var row = Math.floor( k/width )
					, col = Math.floor( k%width );
				if ( row === mRow  || col === mCol ) {
					world2[k] = 4;
				}
			}
		}*/

		//console.log(matches);

		var rand = random( 0, hatch.length ),
			rRow = Math.floor( hatch[rand] / width ),
			rCol = Math.floor( hatch[rand] % width );
		for ( var j=0; j<world2.length; j++ ) {
			var row = Math.floor( j/width )
				, col = Math.floor( j%width );
			if ( row === rRow  || col === rCol ) {
				world2[j] = 4;
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