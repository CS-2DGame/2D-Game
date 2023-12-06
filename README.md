# 2D-Game
Counter Strike 2D Game
# This is the start of the code 
we have got the base code from a dev online eg: yt,github etc.
His solution is only for offline game 2 players on one PC 
# Challange 
we have to make it online 2 players on 2 laptops over internet

# Technologies 
* HTML
* CSS
* JS
* Firebase

#Diection fix 
in game.js file line 121 in function ```
    document.addEventListener("keydown", function (event) {``` i have made changes to change direction of bullet
    `players[1].bullets.push({ x: players[1].x + players[1].width , y: players[1].y + players[1].height / 2, direction: -1});` to `players[1].bullets.push({ x: players[1].x + players[1].width , y: players[1].y + players[1].height / 2, direction: 1});`

