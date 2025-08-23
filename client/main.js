// Aquí irá la lógica del juego desde cero
function onAuthSuccess() {
    document.getElementById('auth-container').style.display = 'none';
    // Ocultar el corazón si existe
    const heartContainer = document.getElementById('heart-container');
    if (heartContainer) heartContainer.style.display = 'none';
    // Mostrar nombre de usuario
    const username = window.currentUsername || '';
    const userInfo = document.getElementById('user-info');
    userInfo.textContent = 'Usuario: ' + username;
    userInfo.style.display = 'block';
    // Mostrar puntos
    let points = window.currentPoints || 0;
    const userPoints = document.getElementById('user-points');
    userPoints.textContent = 'Puntos: ' + points;
    userPoints.style.display = 'block';
    // Mostrar ranking
    const rankingDiv = document.getElementById('ranking');
    const rankingList = document.getElementById('ranking-list');
    function updateRanking() {
        fetch('/api/ranking')
            .then(res => res.json())
            .then(data => {
                rankingList.innerHTML = '';
                data.forEach((user, i) => {
                    const li = document.createElement('li');
                    li.textContent = `${i+1}. ${user.username} - ${user.points} pts`;
                    rankingList.appendChild(li);
                });
                rankingDiv.style.display = 'block';
                // Si es móvil, mostrar el botón y ocultar el contenido por defecto
                if (window.innerWidth <= 600) {
                    document.getElementById('ranking-toggle').style.display = 'block';
                    rankingDiv.classList.remove('open');
                    document.getElementById('ranking-content').style.display = 'none';
                } else {
                    document.getElementById('ranking-toggle').style.display = 'none';
                    document.getElementById('ranking-content').style.display = 'block';
                }
            });
    }
    updateRanking();
    setInterval(updateRanking, 500);

    // Lógica para menú desplegable en móviles
    const rankingToggle = document.getElementById('ranking-toggle');
    if (rankingToggle) {
        rankingToggle.onclick = function() {
            rankingDiv.classList.toggle('open');
            const content = document.getElementById('ranking-content');
            if (rankingDiv.classList.contains('open')) {
                content.style.display = 'block';
            } else {
                content.style.display = 'none';
            }
        };
    }
    // Mostrar bloque
    document.getElementById('block-container').style.display = 'block';
    // Barra de vida y animación de rotura
    const block = document.getElementById('block');
    const healthBar = document.getElementById('block-health');
    let lastClick = 0;
    let health = 10;
    function updateHealthBar() {
        healthBar.style.width = (health * 10) + '%';
    }
    updateHealthBar();
    function breakAnimation() {
        block.style.transition = 'box-shadow 0.3s, filter 0.3s';
        block.style.boxShadow = '0 0 32px 8px #ff4b4b';
        block.style.filter = 'brightness(1.5)';
        setTimeout(() => {
            block.style.boxShadow = '';
            block.style.filter = '';
        }, 300);
    }
    function pulseBlock() {
        const now = Date.now();
        if (now - lastClick < 70) return;
        lastClick = now;
        block.style.transition = 'transform 0.15s';
        block.style.transform = 'scale(1.15)';
        setTimeout(() => {
            block.style.transform = 'scale(1)';
        }, 150);
        // Sonidos
        const soundFiles = [
            'assets/sounds/dirt_sound1.mp3',
            'assets/sounds/dirt_sound2.mp3',
            'assets/sounds/dirt_sound3.mp3'
        ];
        // Sonido aleatorio simultáneo
        const soundSrc = soundFiles[Math.floor(Math.random() * soundFiles.length)];
        const sound = new Audio(soundSrc);
        sound.play();
        // Barra de vida
        if (health > 0) {
            health--;
            updateHealthBar();
            if (health === 0) {
                breakAnimation();
                block.style.visibility = 'hidden';
                setTimeout(() => {
                    points++;
                    userPoints.textContent = 'Puntos: ' + points;
                    health = 10;
                    updateHealthBar();
                    block.style.visibility = 'visible';
                }, 500);
            }
        }
    }
    block.addEventListener('click', pulseBlock);
    block.addEventListener('touchstart', function(e) {
        e.preventDefault();
        pulseBlock();
    }, { passive: false });

    // Guardar puntos cada 5 segundos
    setInterval(() => {
        fetch('/api/points', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, points })
        });
    }, 500);
}
