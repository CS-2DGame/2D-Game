const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const players = [
    { id: 1, x: 50, y: canvas.height / 2, width: 30, height: 30, color: "blue", speed: 5, bulletSpeed: 10, bullets: [] },
    { id: 2, x: canvas.width - 80, y: canvas.height / 2, width: 30, height: 30, color: "red", speed: 5, bulletSpeed: 10, bullets: [] },
];

// Define a set of wall obstacles
const walls = [
    { x: canvas.width / 4, y: 100, width: 20, height: canvas.height - 200 },
    { x: 2 * (canvas.width / 4) - 20, y: 100, width: 20, height: canvas.height - 200 },
    { x: 3 * (canvas.width / 4) - 20, y: 50, width: 20, height: canvas.height - 100 },
    { x: canvas.width / 4, y: canvas.height / 2, width: 20, height: 100 },
];

let gameActive = true;

document.addEventListener("keydown", function (event) {
    players.forEach(player => {
        if (player.id === 1) {
            // Player 1 controls
            if (event.key === "w" && player.y > 0) {
                player.y -= player.speed;
            } else if (event.key === "s" && player.y < canvas.height - player.height) {
                player.y += player.speed;
            } else if (event.key === "a" && player.x > 0) {
                player.x -= player.speed;
            } else if (event.key === "d" && player.x < canvas.width - player.width) {
                player.x += player.speed;
            } else if (event.key === " " && gameActive) {
                // Space bar to shoot for Player 1
                player.bullets.push({ x: player.x + player.width, y: player.y + player.height / 2, direction: 1 });
            }
            console.clear();
            console.log(`Player 1 position: x=${player.x}, y=${player.y}`);
        } else if (player.id === 2) {
            // Player 2 controls
            if (event.key === "ArrowUp" && player.y > 0) {
                player.y -= player.speed;
            } else if (event.key === "ArrowDown" && player.y < canvas.height - player.height) {
                player.y += player.speed;
            } else if (event.key === "ArrowLeft" && player.x > 0) {
                player.x -= player.speed;
            } else if (event.key === "ArrowRight" && player.x < canvas.width - player.width) {
                player.x += player.speed;
            } else if (event.key === "Enter" && gameActive) {
                // Enter key to shoot for Player 2
                player.bullets.push({ x: player.x - 5, y: player.y + player.height / 2, direction: -1 });
            }
            console.clear();
            console.log(`Player 2 position: x=${player.x}, y=${player.y}`);
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

function drawWall(wall) {
    ctx.fillStyle = "gray";
    ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
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

    // Check if bullet hits a wall
    walls.forEach(wall => {
        if (
            bullet.x < wall.x + wall.width &&
            bullet.x + 5 > wall.x &&
            bullet.y < wall.y + wall.height &&
            bullet.y + 5 > wall.y
        ) {
            // Bullet hits a wall, remove the bullet
            players.forEach(player => {
                player.bullets = player.bullets.filter(b => b !== bullet);
            });
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw walls
    walls.forEach(drawWall);

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
