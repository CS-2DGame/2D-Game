const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const firebaseConfig = {
    apiKey: "AIzaSyDshdHOODBKR6sMZRNqFtVRfUOzAPHZVgM",
    authDomain: "cs2d-a14b7.firebaseapp.com",
    projectId: "cs2d-a14b7",
    storageBucket: "cs2d-a14b7.appspot.com",
    messagingSenderId: "530961865099",
    appId: "1:530961865099:web:1843772f205f5bcb2cb78e",
    measurementId: "G-335M4CSBJR"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Set database variable
  var database = firebase.database();
  
  const players = [
    { id: 0, x: 4, y: 5, width: 30, height: 30, color: "blue", speed: 5, bulletSpeed: 10, bullets: [] },
    { id: 1, x: 695, y: 465, width: 30, height: 30, color: "red", speed: 5, bulletSpeed: 10, bullets: [] },
];

const obstacles = [
    { x: canvas.width / 3, y: 50, width: 20, height: 150 },
    { x: 2 * (canvas.width / 3) - 20, y: 50, width: 20, height: 150 },
    { x: canvas.width / 3, y: canvas.height - 200, width: 20, height: 150 },
    { x: 2 * (canvas.width / 3) - 20, y: canvas.height - 200, width: 20, height: 150 },
    { x: canvas.width / 2 - 50, y: canvas.height / 3, width: 100, height: 20 },
    { x: canvas.width / 2 - 50, y: 2 * (canvas.height / 3) - 20, width: 100, height: 20 },
];

function saveToFirebase(player) {
    return new Promise((resolve, reject) => {
        var playerRef = database.ref("players/" + player.id);

        playerRef.set({ x: player.x, y: player.y }, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve(`Player ${player.id} data saved to Firebase successfully!`);
            }
        });
    });
}

function save() {
    const savePromises = players.map(player => saveToFirebase(player));
    Promise.all(savePromises)
        .then(results => {
            console.log(results.join('\n'));
        })
        .catch(error => {
            console.error("Error saving player data:", error);
        });
}

function get(playerId, callback) {
    var playerRef = database.ref("players/" + playerId);

    playerRef.on("value", function (snapshot) {
        var playerData = snapshot.val();
        console.log(`Player ${playerId}'s coordinates:`, playerData.x, playerData.y);

        if (typeof callback === "function") {
            callback(playerData);
        }
    });
}

// Call the get function for both players
get(0, movePlayer1); // Call movePlayer1 for Player 1 (ID: 1)
get(1, movePlayer2); // Call movePlayer2 for Player 2 (ID: 2)

function movePlayer1(player2Data) {
    console.log("Received data for Player 2:", player2Data);
    players[0].x = player2Data.x;
    players[0].y = player2Data.y;

    console.log("Player 1's coordinates updated:", players[1].x, players[1].y);
}

function movePlayer2(player1Data) {
    console.log("Received data for Player 1:", player1Data);
    players[1].x = player1Data.x;
    players[1].y = player1Data.y;

    console.log("Player 2's coordinates updated:", players[1].x, players[1].y);
}






let gameActive = true;
// ... (previous code remains the same)

function startPlayer2() {
    get(1, movePlayer2);

    document.addEventListener("keydown", function (event) {
        // Player 2 controls
        if (players[1].id === 1) {
            let positionChanged = false;

            if (event.key === "w" && players[1].y > 0) {
                players[1].y -= players[1].speed;
                positionChanged = true;
            } else if (event.key === "s" && players[1].y < canvas.height - players[1].height) {
                players[1].y += players[1].speed;
                positionChanged = true;
            } else if (event.key === "a" && players[1].x > 0) {
                players[1].x -= players[1].speed;
                positionChanged = true;
            } else if (event.key === "d" && players[1].x < canvas.width - players[1].width) {
                players[1].x += players[1].speed;
                positionChanged = true;
            } else if (event.key === " " && gameActive) {
                // Enter key to shoot for Player 2
                players[1].bullets.push({ x: players[1].x - 5, y: players[1].y + players[1].height / 2, direction: -1 });
                save();  // Save the updated bullets to Firebase
            }

            if (positionChanged) {
                save();  // Save the updated position to Firebase
            }

            console.clear();
            console.log(`Player 2 position: x=${players[1].x}, y=${players[1].y}`);
        }
    });
}

// Call the startPlayer2 function to initiate Player 2 controls
startPlayer2();


function drawPlayer(player) {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawBullet(bullet) {
    ctx.fillStyle = "black";
    ctx.fillRect(bullet.x, bullet.y, 5, 5);
}

function drawObstacle(obstacle) {
    ctx.fillStyle = "gray";
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
}

function update() {
    players.forEach(player => {
        player.bullets.forEach(bullet => {
            bullet.x += player.bulletSpeed * bullet.direction;
            checkBulletCollision(bullet, player.id);
        });

        player.bullets = player.bullets.filter(bullet => bullet.x < canvas.width && bullet.x > 0);
    });
}

function checkBulletCollision(bullet, playerId) {
    players.forEach(player => {
        if (
            player.id !== playerId &&
            bullet.x < player.x + player.width &&
            bullet.x + 5 > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + 5 > player.y
        ) {
            // Bullet hit player
            alert(`Player ${playerId} hit Player ${player.id}!`);
            gameActive = false;
            document.getElementById("restartBtn").style.display = "block";

            // Automatically restart after 2 seconds (adjust as needed)
            setTimeout(function () {
                restartGame();
            }, 2000);
        }
    });

    // Check if bullet hits an obstacle
    obstacles.forEach(obstacle => {
        if (
            bullet.x < obstacle.x + obstacle.width &&
            bullet.x + 5 > obstacle.x &&
            bullet.y < obstacle.y + obstacle.height &&
            bullet.y + 5 > obstacle.y
        ) {
            // Bullet hits an obstacle, remove the bullet
            players.forEach(player => {
                player.bullets = player.bullets.filter(b => b !== bullet);
            });
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw obstacles
    obstacles.forEach(drawObstacle);

    // Draw players
    players.forEach(drawPlayer);

    // Draw bullets
    players.forEach(player => {
        player.bullets.forEach(drawBullet);
    });
}

function restartGame() {
    players.forEach(player => {
        player.y = canvas.height / 2;
        player.bullets = [];
    });

    gameActive = true;
    document.getElementById("restartBtn").style.display = "none";
}

function gameLoop() {
    if (!gameActive) {
        return;
    }

    update();
    draw();

    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
