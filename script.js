// Get canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game variables
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;
const paddleSpeed = 6;
const ballSpeedBase = 5;

let gameRunning = false;
let gameStarted = false;

// Paddle objects
const playerPaddle = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

const computerPaddle = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

// Ball object
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: ballSpeedBase,
    dy: ballSpeedBase,
    radius: ballSize
};

// Score
let playerScore = 0;
let computerScore = 0;

// Keyboard input
const keys = {
    up: false,
    down: false
};

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') keys.up = true;
    if (e.key === 'ArrowDown') keys.down = true;
    if (e.key === ' ') {
        e.preventDefault();
        gameRunning = !gameRunning;
        if (gameRunning && !gameStarted) {
            gameStarted = true;
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') keys.up = false;
    if (e.key === 'ArrowDown') keys.down = false;
});

// Mouse movement
document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    
    // Move player paddle to mouse Y position
    const paddleCenter = playerPaddle.height / 2;
    let targetY = mouseY - paddleCenter;
    
    // Smooth movement
    targetY = Math.max(0, Math.min(canvas.height - playerPaddle.height, targetY));
    playerPaddle.y = targetY;
});

// Update game state
function update() {
    if (!gameRunning) return;

    // Update player paddle with arrow keys (also works alongside mouse)
    if (keys.up && playerPaddle.y > 0) {
        playerPaddle.y -= paddleSpeed;
    }
    if (keys.down && playerPaddle.y < canvas.height - playerPaddle.height) {
        playerPaddle.y += paddleSpeed;
    }

    // Keep player paddle within bounds
    playerPaddle.y = Math.max(0, Math.min(canvas.height - playerPaddle.height, playerPaddle.y));

    // Computer AI
    const computerCenter = computerPaddle.y + computerPaddle.height / 2;
    const difficulty = 3.5;
    
    if (computerCenter < ball.y - 35) {
        computerPaddle.y += difficulty;
    } else if (computerCenter > ball.y + 35) {
        computerPaddle.y -= difficulty;
    }
    
    computerPaddle.y = Math.max(0, Math.min(canvas.height - computerPaddle.height, computerPaddle.y));

    // Ball movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }

    // Ball collision with paddles
    if (
        ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
        ball.y > playerPaddle.y &&
        ball.y < playerPaddle.y + playerPaddle.height
    ) {
        ball.dx = -ball.dx;
        ball.x = playerPaddle.x + playerPaddle.width + ball.radius;
        
        // Add spin based on paddle movement
        const deltaY = ball.y - (playerPaddle.y + playerPaddle.height / 2);
        ball.dy = (deltaY / (playerPaddle.height / 2)) * ballSpeedBase;
        
        // Increase ball speed slightly
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        if (speed < ballSpeedBase * 1.5) {
            ball.dx *= 1.05;
            ball.dy *= 1.05;
        }
    }

    if (
        ball.x + ball.radius > computerPaddle.x &&
        ball.y > computerPaddle.y &&
        ball.y < computerPaddle.y + computerPaddle.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computerPaddle.x - ball.radius;
        
        // Add spin based on paddle movement
        const deltaY = ball.y - (computerPaddle.y + computerPaddle.height / 2);
        ball.dy = (deltaY / (computerPaddle.height / 2)) * ballSpeedBase;
    }

    // Ball out of bounds - scoring
    if (ball.x - ball.radius < 0) {
        computerScore++;
        resetBall();
        updateScore();
    } else if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        resetBall();
        updateScore();
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = ballSpeedBase * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = ballSpeedBase * (Math.random() > 0.5 ? 1 : -1);
}

// Update score display
function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Ball glow effect
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawCenter() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw elements
    drawCenter();
    drawPaddle(playerPaddle);
    drawPaddle(computerPaddle);
    drawBall();

    // Draw game status
    if (!gameStarted) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00ff00';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE to Start', canvas.width / 2, canvas.height / 2);
    } else if (!gameRunning && gameStarted) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ffff00';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED - Press SPACE to Resume', canvas.width / 2, canvas.height / 2);
    }
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
