## Eric's Conway's Game of Life

This is a JavaScript/canvas emulation of <a href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life" target=_blank>Conway's Game of Life</a>, with one addition: 2x2 cluters of cells are counted as "eggs" and have the potential to "hatch" into lines of cells if they survive for longer than 40 seconds (this is based on a fixed rule so that the game remains deterministic). Also, cells that have died are marked with a "ghost" color for 3 generations after dying. This is just a visual marker that has no effect on the game logic.

#### Objectives
+ ~~Create an in-browser GoL emulation that can run indefinitely without crashing (desktop and mobile)~~
+ ~~Generate random colors~~
+ ~~Store favorite color schemes~~
+ Add menu for managing color schemes
+ Eliminate memory leaks