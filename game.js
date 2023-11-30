const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

var firebaseConfig = {
    apiKey: "AIzaSyBzjcMqWZGbxv6BnXNAkJJtwYCezvDKU7I",
    authDomain: "stone-58408.firebaseapp.com",
    databaseURL: "https://stone-58408-default-rtdb.firebaseio.com",
    projectId: "stone-58408",
    storageBucket: "stone-58408.appspot.com",
    messagingSenderId: "34073462745",
    appId: "1:34073462745:web:ae8015931df3e5b6c7fbc8",
    measurementId: "G-491Y00XCN5"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Set database variable
  var database = firebase.database();

  function saveToFirebase(player) {
    return new Promise((resolve, reject) => {
        // Assuming each player has a unique ID
        var playerRef = database.ref("players/" + player.id);

        playerRef.set({ x: player.x, y: player.y }, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve("Player data saved to Firebase successfully!");
            }
        });
    });
}

function save() {
    const savePromises = players.map(player => saveToFirebase(player));


}

function get() {
    var playerRef = database.ref("players");

    playerRef.on("value", function (snapshot) {
        var playersData = snapshot.val();
        console.log(playersData);
        // Handle the retrieved player data as needed
    });
}

 

const players = [
    { id: 1, x: 4, y: 5, width: 30, height: 30, color: "blue", speed: 5, bulletSpeed: 10, bullets: [] },
    { id: 2, x: 695, y: 465, width: 30, height: 30, color: "red", speed: 5, bulletSpeed: 10, bullets: [] },
];

const obstacles = [
    { x: canvas.width / 3, y: 50, width: 20, height: 150 },
    { x: 2 * (canvas.width / 3) - 20, y: 50, width: 20, height: 150 },
    { x: canvas.width / 3, y: canvas.height - 200, width: 20, height: 150 },
    { x: 2 * (canvas.width / 3) - 20, y: canvas.height - 200, width: 20, height: 150 },
    { x: canvas.width / 2 - 50, y: canvas.height / 3, width: 100, height: 20 },
    { x: canvas.width / 2 - 50, y: 2 * (canvas.height / 3) - 20, width: 100, height: 20 },
];

let gameActive = true;
document.addEventListener("keydown", function (event) {
    let positionChanged = false;

    players.forEach(player => {
        if (player.id === 1) {
            // Player 1 controls
            if (event.key === "ArrowUp" && player.y > 0) {
                player.y -= player.speed;
                positionChanged = true;
            } else if (event.key === "ArrowDown" && player.y < canvas.height - player.height) {
                player.y += player.speed;
                positionChanged = true;
            } else if (event.key === "ArrowLeft" && player.x > 0) {
                player.x -= player.speed;
                positionChanged = true;
            } else if (event.key === "ArrowRight" && player.x < canvas.width - player.width) {
                player.x += player.speed;
                positionChanged = true;
            } else if (event.key === " " && gameActive) {
                // Space bar to shoot for Player 1
                player.bullets.push({ x: player.x + player.width, y: player.y + player.height / 2, direction: 1 });
            }
            
            console.clear(); 
            console.log(`Player 1 position: x=${player.x}, y=${player.y}`);
        }
    

    if (positionChanged) {
        save();
    }

 else if (player.id === 2) {
            // Player 2 controls
            if (event.key === "w" && player.y > 0) {
                player.y -= player.speed;
                positionChanged = true;
            } else if (event.key === "s" && player.y < canvas.height - player.height) {
                player.y += player.speed;
                positionChanged = true;
            } else if (event.key === "a" && player.x > 0) {
                player.x -= player.speed;
                positionChanged = true;
            } else if (event.key === "d" && player.x < canvas.width - player.width) {
                player.x += player.speed;
                positionChanged = true;
            } else if (event.key === "Enter" && gameActive) {
                // Enter key to shoot for Player 2 (opposite direction)
                player.bullets.push({ x: player.x - 5, y: player.y + player.height / 2, direction: -1 });
            }
             console.log(`Player 2 position: x=${player.x}, y=${player.y}`);
        }
        if (positionChanged) {
            save();
        }
  });
  
});

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
