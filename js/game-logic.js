// Игровая логика
let gameState = {
    player: null,
    bots: [],
    bullets: [],
    bushes: [],
    isPlaying: false,
    mode: 'showdown',
    joyLeft: { active: false, dx: 0, dy: 0, id: null },
    joyRight: { active: false, dx: 0, dy: 0, id: null, lastShoot: 0 },
    lastTime: 0
};

let mode = 'showdown';

function createEntity(x, y, headEmo, isBot, hp, nickName) {
    const el = document.createElement('div');
    el.className = 'entity';
    el.innerHTML = `
        <div style="position:absolute; top:-25px; left:50%; transform:translateX(-50%); color:white; font-size:11px; font-weight:bold; white-space:nowrap; background:rgba(0,0,0,0.6); padding:1px 5px; border:1px solid #000;">${nickName}</div>
        <div class="hp-bar"><div class="hp-fill"></div></div>
        <div style="font-size:44px; width:50px; height:50px; display:flex; align-items:center; justify-content:center; background: rgba(255,255,255,0.1); border-radius:50% !important; border:2px dashed rgba(255,255,255,0.3); position:relative;"><span class="emoji-txt">${headEmo}</span></div>
    `;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    document.getElementById('arena').appendChild(el);

    return {
        x,
        y,
        el,
        hp,
        maxHp: hp,
        isBot,
        vx: 0,
        vy: 0,
        lastShootTime: 0,
        shootCooldown: GAME_CONFIG.BOT_SHOOT_COOLDOWN,
        frozen: 0,
        searchBushTarget: null,
        dmg: 0,
        skin: null
    };
}

function updateEntity(ent) {
    ent.el.style.left = ent.x + 'px';
    ent.el.style.top = ent.y + 'px';
    const hpFill = ent.el.querySelector('.hp-fill');
    if (hpFill) {
        hpFill.style.width = Math.max(0, (ent.hp / ent.maxHp) * 100) + '%';
    }
}

function shoot(x, y, dx, dy, isBot) {
    const el = document.createElement('div');
    el.className = 'bullet ' + (isBot ? 'bullet-bot' : '');
    document.getElementById('arena').appendChild(el);
    gameState.bullets.push({ x, y, vx: dx, vy: dy, isBot, el });
}

function getNearestBush(x, y) {
    if (gameState.bushes.length === 0) return null;
    let minDst = Infinity,
        nearest = null;
    gameState.bushes.forEach(b => {
        const d = Math.hypot(x - b.x, y - b.y);
        if (d < minDst) { minDst = d;
            nearest = b; }
    });
    return nearest;
}

function setupJoystick(elId, joyObj) {
    const zone = document.getElementById(elId);
    const knob = zone.querySelector('.joy-knob');

    zone.addEventListener('touchstart', e => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i];
            if (!joyObj.active) {
                joyObj.active = true;
                joyObj.id = t.identifier;
                updateJoy(t, zone, knob, joyObj);
            }
        }
    });

    zone.addEventListener('touchmove', e => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === joyObj.id) {
                updateJoy(e.changedTouches[i], zone, knob, joyObj);
            }
        }
    });

    const end = e => {
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === joyObj.id) {
                joyObj.active = false;
                joyObj.id = null;
                joyObj.dx = 0;
                joyObj.dy = 0;
                knob.style.transform = `translate(-50%, -50%)`;
            }
        }
    };

    zone.addEventListener('touchend', end);
    zone.addEventListener('touchcancel', end);
}

function updateJoy(touch, zone, knob, joyObj) {
    const rect = zone.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = touch.clientX - cx;
    let dy = touch.clientY - cy;
    const max = rect.width / 2;
    const dist = Math.hypot(dx, dy);

    if (dist > max) { dx = (dx / dist) * max;
        dy = (dy / dist) * max; }
    knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

    joyObj.dx = dx / max;
    joyObj.dy = dy / max;
}

// Инициализация джойстиков
setupJoystick('joy-left', gameState.joyLeft);
setupJoystick('joy-right', gameState.joyRight);

function startGame() {
    const data = getData();
    const arena = document.getElementById('arena');
    arena.innerHTML = '';
    gameState.bots = [];
    gameState.bullets = [];
    gameState.bushes = [];
    gameState.isPlaying = true;

    document.getElementById('menu').classList.remove('active-screen');
    document.getElementById('game').classList.add('active-screen');
    document.getElementById('ratok-overlay').style.display = 'none';
    document.getElementById('shatko-overlay').style.display = 'none';

    document.getElementById('btn-training-shop').style.display = (mode === 'training') ? 'block' : 'none';
    document.getElementById('btn-training-shop').innerText = t('trainingShopBtn');

    // Создание кустов
    for (let i = 0; i < GAME_CONFIG.BUSH_COUNT; i++) {
        const b = document.createElement('div');
        b.className = 'bush';
        const bx = Math.random() * 1700 + 50;
        const by = Math.random() * 1700 + 50;
        b.style.left = bx + 'px';
        b.style.top = by + 'px';
        arena.appendChild(b);
        gameState.bushes.push({ x: bx + 75, y: by + 75, r: 85 });
    }

    // Игрок
    const bInfo = BRAWLERS[data.selectedBrawler];
    const displayName = data.nick || (data.lang === 'ru' ? 'Игрок' : 'Player');
    gameState.player = createEntity(1000, 1000, bInfo.head, false, bInfo.hp, displayName);
    gameState.player.dmg = bInfo.dmg;
    gameState.player.bushTimer = 0;
    gameState.player.rageFaceTimer = 0;
    gameState.player.immortalTimer = 0;
    gameState.player.ratokTriggered = false;
    gameState.player.shatkoAbilityTriggered = false;
    gameState.player.shatkoAbilityTimer = 0;

    // Щит
    if (data.shields > 0) {
        const shieldBubble = document.createElement('div');
        shieldBubble.className = 'shield-bubble';
        shieldBubble.style.position = 'absolute';
        shieldBubble.style.top = '50%';
        shieldBubble.style.left = '50%';
        shieldBubble.style.transform = 'translate(-50%, -50%)';
        shieldBubble.style.width = '74px';
        shieldBubble.style.height = '74px';
        shieldBubble.style.borderRadius = '50%';
        shieldBubble.style.border = '4px solid #00c8ff';
        shieldBubble.style.background = 'rgba(0, 200, 255, 0.25)';
        shieldBubble.style.boxShadow = '0 0 15px #00c8ff, inset 0 0 10px #00c8ff';
        shieldBubble.style.pointerEvents = 'none';
        gameState.player.el.querySelector('div:last-child').appendChild(shieldBubble);
    }

    // Боты
    const totalBots = GAME_CONFIG.MAX_BOTS[mode] || 3;
    const availableSkins = Object.keys(BRAWLERS);

    for (let i = 0; i < totalBots; i++) {
        const randSkinKey = availableSkins[Math.floor(Math.random() * availableSkins.length)];
        const randSkin = BRAWLERS[randSkinKey];
        const randNick = GAME_CONFIG.BOT_NICKS[Math.floor(Math.random() * GAME_CONFIG.BOT_NICKS.length)];

        let bx = Math.random() * 1800 + 100;
        let by = Math.random() * 1800 + 100;
        if (Math.hypot(bx - 1000, by - 1000) < 300) { bx += 400;
            by += 400; }

        const bot = createEntity(bx, by, randSkin.head, true, randSkin.hp, randNick);
        bot.skin = randSkinKey;
        bot.dmg = randSkin.dmg;
        bot.shootCooldown = GAME_CONFIG.BOT_SHOOT_COOLDOWN;
        gameState.bots.push(bot);
    }

    gameState.lastTime = performance.now();
    requestAnimationFrame(updateGame);
}

function updateGame(time) {
    if (!gameState.isPlaying) return;

    let dt = (time - gameState.lastTime) / 1000;
    if (dt > 0.1) dt = 0.1;
    gameState.lastTime = time;

    const player = gameState.player;
    const data = getData();

    // Движение игрока
    const speed = (data.selectedBrawler === 'kiko') ? GAME_CONFIG.KIKO_SPEED : GAME_CONFIG.PLAYER_SPEED;
    player.x += gameState.joyLeft.dx * speed * dt;
    player.y += gameState.joyLeft.dy * speed * dt;
    player.x = Math.max(50, Math.min(GAME_CONFIG.ARENA_SIZE - 50, player.x));
    player.y = Math.max(50, Math.min(GAME_CONFIG.ARENA_SIZE - 50, player.y));

    // Кусты
    player.inBush = gameState.bushes.some(b => Math.hypot(player.x - b.x, player.y - b.y) < b.r);
    player.el.style.opacity = player.inBush ? 0.45 : 1;

    if (player.inBush) {
        player.bushTimer += dt;
        if (player.bushTimer >= GAME_CONFIG.HEAL_INTERVAL) {
            player.hp = Math.min(player.maxHp, player.hp + GAME_CONFIG.HEAL_AMOUNT);
            player.bushTimer = 0;
        }
    } else {
        player.bushTimer = 0;
    }

    // Раж
    if (player.rageFaceTimer > 0) {
        player.rageFaceTimer -= dt;
        if (player.rageFaceTimer <= 0) {
            const faceSpan = player.el.querySelector('.emoji-txt');
            if (faceSpan) faceSpan.innerText = BRAWLERS[data.selectedBrawler].head;
        }
    }

    // Бессмертие Ратока
    if (player.immortalTimer > 0) {
        player.immortalTimer -= dt;
        if (player.immortalTimer <= 0) {
            document.getElementById('ratok-overlay').style.display = 'none';
            const faceSpan = player.el.querySelector('.emoji-txt');
            if (faceSpan) faceSpan.innerText = BRAWLERS[data.selectedBrawler].head;
        }
    }

    // Способность Шатко
    if (player.shatkoAbilityTimer > 0) {
        player.shatkoAbilityTimer -= dt;
        if (player.shatkoAbilityTimer <= 0) {
            document.getElementById('shatko-overlay').style.display = 'none';
        }
    }

    if (data.selectedBrawler === 'shatko' && player.hp <= 300 && !player.shatkoAbilityTriggered && player.hp > 0) {
        player.shatkoAbilityTriggered = true;
        player.shatkoAbilityTimer = GAME_CONFIG.SHATKO_ABILITY_DURATION;
        document.getElementById('shatko-overlay').style.display = 'block';
        alert(t('shatkoAbility'));
    }

    // Стрельба
    if (gameState.joyRight.active && time - gameState.joyRight.lastShoot > GAME_CONFIG.SHOOT_COOLDOWN) {
        gameState.joyRight.lastShoot = time;
        shoot(player.x, player.y, gameState.joyRight.dx, gameState.joyRight.dy, false);
    }

    // Логика ботов
    gameState.bots.forEach(bot => {
        if (bot.hp <= 0) return;

        if (player.shatkoAbilityTimer > 0) {
            bot.frozen = 0.5;
        }

        const dist = Math.hypot(player.x - bot.x, player.y - bot.y);
        const playerVisible = !player.inBush || dist < 220;

        bot.inBush = gameState.bushes.some(b => Math.hypot(bot.x - b.x, bot.y - b.y) < b.r);
        bot.el.style.opacity = bot.inBush ? 0.45 : 1;

        let targetX = bot.x;
        let targetY = bot.y;
        let shouldShoot = false;

        if (bot.frozen > 0) {
            bot.frozen -= dt;
            updateEntity(bot);
            return;
        }

        // AI логика
        if (bot.hp < bot.maxHp * 0.35) {
            const nb = getNearestBush(bot.x, bot.y);
            if (nb) { targetX = nb.x;
                targetY = nb.y; }
            if (playerVisible && dist < 400) shouldShoot = true;
        } else if (playerVisible && dist < 700) {
            targetX = player.x;
            targetY = player.y;
            shouldShoot = true;
            bot.searchBushTarget = null;

            if (dist < 450) {
                const perpX = -(player.y - bot.y) / dist;
                const perpY = (player.x - bot.x) / dist;
                const wave = Math.sin(time / 300) > 0 ? 1 : -1;
                targetX += perpX * 220 * wave;
                targetY += perpY * 220 * wave;
            }
        } else {
            if (!bot.searchBushTarget || Math.hypot(bot.x - bot.searchBushTarget.x, bot.y - bot.searchBushTarget.y) < 50) {
                if (gameState.bushes.length > 0) {
                    bot.searchBushTarget = gameState.bushes[Math.floor(Math.random() * gameState.bushes.length)];
                }
            }
            if (bot.searchBushTarget) {
                targetX = bot.searchBushTarget.x;
                targetY = bot.searchBushTarget.y;
            }
        }

        const dx = targetX - bot.x;
        const dy = targetY - bot.y;
        const dLen = Math.hypot(dx, dy);
        if (dLen > 5) {
            const bSpeed = (bot.skin === 'kiko') ? GAME_CONFIG.BOT_KIKO_SPEED : GAME_CONFIG.BOT_SPEED;
            bot.x += (dx / dLen) * bSpeed * dt;
            bot.y += (dy / dLen) * bSpeed * dt;
        }
        bot.x = Math.max(50, Math.min(GAME_CONFIG.ARENA_SIZE - 50, bot.x));
        bot.y = Math.max(50, Math.min(GAME_CONFIG.ARENA_SIZE - 50, bot.y));

        if (shouldShoot && time - bot.lastShootTime > bot.shootCooldown) {
            bot.lastShootTime = time;
            const leadFactor = 25;
            const predX = player.x + (gameState.joyLeft.dx * leadFactor);
            const predY = player.y + (gameState.joyLeft.dy * leadFactor);
            const sDx = predX - bot.x;
            const sDy = predY - bot.y;
            const sLen = Math.hypot(sDx, sDy);
            if (sLen > 0) {
                shoot(bot.x, bot.y, sDx / sLen, sDy / sLen, true);
            }
        }

        updateEntity(bot);
    });

    // Обновление пуль
    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
        const b = gameState.bullets[i];
        b.x += b.vx * GAME_CONFIG.BULLET_SPEED * dt;
        b.y += b.vy * GAME_CONFIG.BULLET_SPEED * dt;
        b.el.style.left = b.x + 'px';
        b.el.style.top = b.y + 'px';

        if (b.x < 0 || b.x > GAME_CONFIG.ARENA_SIZE || b.y < 0 || b.y > GAME_CONFIG.ARENA_SIZE) {
            b.el.remove();
            gameState.bullets.splice(i, 1);
            continue;
        }

        if (b.isBot) {
            if (Math.hypot(b.x - player.x, b.y - player.y) < 35) {
                b.el.remove();
                gameState.bullets.splice(i, 1);
                if (player.immortalTimer > 0) continue;

                let incomingDmg = 120;
                if (data.shields > 0) {
                    incomingDmg = Math.floor(incomingDmg * 0.5);
                }
                player.hp -= incomingDmg;
            }
        } else {
            gameState.bots.forEach(bot => {
                if (bot.hp > 0 && Math.hypot(b.x - bot.x, b.y - bot.y) < 35) {
                    bot.hp -= player.dmg;
                    if (data.selectedBrawler === 'ratok') bot.frozen = GAME_CONFIG.BOT_FROZEN_DURATION;
                    b.el.remove();
                    gameState.bullets.splice(i, 1);
                }
            });
        }
    }

    // Удаление мертвых ботов
    gameState.bots = gameState.bots.filter(bot => {
        if (bot.hp <= 0) { bot.el.remove(); return false; }
        return true;
    });

    updateEntity(player);

    // Камера
    const cx = window.innerWidth / 2 - player.x;
    const cy = window.innerHeight / 2 - player.y;
    document.getElementById('arena').style.transform = `translate(${cx}px, ${cy}px)`;

    // Проверка смерти
    if (player.hp <= 0) {
        let triggeredRage = false;
        let triggeredRatok = false;

        // Способность Коко
        if (data.selectedBrawler === 'kiko') {
            const currentBush = gameState.bushes.find(b => Math.hypot(player.x - b.x, player.y - b.y) < b.r);
            if (currentBush) {
                const botsInBush = gameState.bots.filter(bot =>
                    bot.hp > 0 && Math.hypot(bot.x - currentBush.x, bot.y - currentBush.y) < currentBush.r
                );
                if (botsInBush.length >= 2) {
                    triggeredRage = true;
                    const faceSpan = player.el.querySelector('.emoji-txt');
                    if (faceSpan) faceSpan.innerText = '👹';
                    player.rageFaceTimer = GAME_CONFIG.RAGE_DURATION;

                    botsInBush.forEach(bot => {
                        bot.hp = 0;
                        bot.el.remove();
                    });
                    gameState.bots = gameState.bots.filter(bot => bot.hp > 0);

                    player.hp = 500;
                    updateEntity(player);
                    alert(t('kikoRage'));
                }
            }
        }

        // Способность Ратока
        if (!triggeredRage && data.selectedBrawler === 'ratok' && !player.ratokTriggered) {
            triggeredRatok = true;
            player.ratokTriggered = true;
            player.immortalTimer = GAME_CONFIG.IMMORTAL_DURATION;
            player.hp = player.maxHp;
            updateEntity(player);

            document.getElementById('ratok-overlay').style.display = 'block';
            const faceSpan = player.el.querySelector('.emoji-txt');
            if (faceSpan) faceSpan.innerText = '👼';
            alert(t('ratokAngel'));
        }

        if (!triggeredRage && !triggeredRatok) {
            if (data.shields > 0) {
                data.shields = 0;
                player.hp = 400;
                const bubble = player.el.querySelector('.shield-bubble');
                if (bubble) bubble.remove();
                saveData();
                alert(t('shieldBreak'));
                requestAnimationFrame(updateGame);
            } else {
                endGame(false);
            }
        } else {
            requestAnimationFrame(updateGame);
        }
    } else if (mode !== 'training' && gameState.bots.length === 0) {
        endGame(true);
    } else {
        requestAnimationFrame(updateGame);
    }
}

function endGame(win) {
    gameState.isPlaying = false;
    const data = getData();

    if (data.shields > 0) {
        data.shields--;
    }

    if (win) {
        alert(t('victory'));
        data.coins += 80;
        data.gems += 5;
        data.popcorn += 15;
        data.level += 1;
    } else {
        alert(t('defeat'));
        data.coins += 70;
        data.popcorn += 5;
    }

    saveData();

    document.getElementById('game').classList.remove('active-screen');
    document.getElementById('loading').classList.add('active-screen');
    document.getElementById('progress-bar').style.width = '0%';

    setTimeout(() => {
        document.getElementById('progress-bar').style.width = '100%';
        setTimeout(() => {
            document.getElementById('loading').classList.remove('active-screen');
            document.getElementById('menu').classList.add('active-screen');
        }, 400);
    }, 400);
}

// Функция для обработки смены режима
function toggleMode() {
    if (mode === 'showdown') mode = 'training';
    else if (mode === 'training') mode = 'duo';
    else mode = 'showdown';
    updateModeBtnText();
}