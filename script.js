// Основной скрипт - инициализация и глобальные функции

// Инициализация данных при загрузке
document.addEventListener('DOMContentLoaded', function() {
    initData();
    runLoading();
});

// Глобальные функции для HTML
window.startGame = startGame;
window.showModal = showModal;
window.hideModal = hideModal;
window.changeLanguage = function(langCode) {
    const data = getData();
    data.lang = langCode;
    saveData();
    updateMenuUI();
};
window.toggleRainbowSetting = function() {
    const data = getData();
    data.noRainbow = !data.noRainbow;
    saveData();
    updateMenuUI();
};
window.saveNick = function() {
    const val = document.getElementById('nick-input').value.trim();
    if (!val) return;

    // Секретный код разработчика
    if (val === "developer194746382;&:₹/?,&2104817/.!3'zlqksj:'+*****") {
        const data = getData();
        data.coins = 99999;
        data.gems = 99999;
        data.popcorn = 99999;
        if (!data.unlocked.includes('ratok')) data.unlocked.push('ratok');
        if (!data.unlocked.includes('utok')) data.unlocked.push('utok');
        if (!data.unlocked.includes('shatko')) data.unlocked.push('shatko');
        data.nick = "👑 ПАСХАЛКА 👑";
        data.devBtnHidden = false;
        saveData();
        alert(t('developerCode'));
        hideModal('modal-nick');
        return;
    }

    const data = getData();
    data.nick = val;
    data.nickClicks = 0;
    data.nickChangesCount++;

    if (data.nickChangesCount >= GAME_CONFIG.NICK_CHANGE_LIMIT) {
        data.nickLockUntil = Date.now() + GAME_CONFIG.NICK_LOCK_DAYS * 24 * 60 * 60 * 1000;
    }

    saveData();
    hideModal('modal-nick');
    updateMenuUI();
};

window.selectBrawler = function(id) {
    const data = getData();
    data.selectedBrawler = id;
    saveData();
    hideModal('modal-brawlers');
    updateMenuUI();
};

window.buyBrawler = function(id, price, currency) {
    const data = getData();
    if (data.unlocked.includes(id)) return;
    if (data[currency] >= price) {
        data[currency] -= price;
        data.unlocked.push(id);
        saveData();
        const name = data.lang === 'ru' ? BRAWLERS[id].name : BRAWLERS[id].enName;
        alert(t('brawlerUnlocked') + ' ' + name);
        updateMenuUI();
    } else {
        alert(currency === 'coins' ? t('notEnoughCoins') : t('notEnoughGems'));
    }
};

window.buyShatkoPopcorn = function() {
    const data = getData();
    if (data.unlocked.includes('shatko')) {
        alert(t('alreadyBought'));
        return;
    }
    if (data.popcorn >= GAME_CONFIG.SHATKO_POPCORN_PRICE) {
        data.popcorn -= GAME_CONFIG.SHATKO_POPCORN_PRICE;
        data.unlocked.push('shatko');
        saveData();
        alert(t('shatkoUnlocked'));
        updateMenuUI();
    } else {
        alert(t('notEnoughPopcorn'));
    }
};

window.buyShield = function() {
    const data = getData();
    if (data.coins >= GAME_CONFIG.SHIELD_PRICE) {
        data.coins -= GAME_CONFIG.SHIELD_PRICE;
        data.shields += GAME_CONFIG.SHIELD_CHARGES;
        saveData();
        alert(t('shieldBought'));
        updateMenuUI();
    } else {
        alert(t('shieldNotEnough'));
    }
};

window.activateCode = function() {
    const code = document.getElementById('code-input').value.toLowerCase();
    const data = getData();

    if (data.codesUsed[code]) {
        alert(t('alreadyActivated'));
        return;
    }

    let success = false;
    let message = '';

    if (code === 'developer') {
        data.gems += 25;
        success = true;
        message = '+25 гемов!';
    } else if (code === 'rypto') {
        data.coins += 100;
        success = true;
        message = '+100 монет!';
    } else if (code === 'voco') {
        data.coins += 400;
        success = true;
        message = '+400 монет!';
    } else if (code === 'byerealracing3') {
        data.gems += 20;
        success = true;
        message = '+20 гемов!';
    }

    if (success) {
        data.codesUsed[code] = true;
        saveData();
        alert(message);
        hideModal('modal-code');
        updateMenuUI();
    } else {
        alert(t('invalidCode'));
    }
};

window.claimShopGift = function() {
    const data = getData();
    const today = getTodayStr();
    if (data.lastShopTimestamp === today) return;
    data.coins += 7;
    data.lastShopTimestamp = today;
    saveData();
    updateMenuUI();
};

window.claimDaily = function() {
    const data = getData();
    const today = getTodayStr();
    if (data.lastDailyTimestamp === today) return;

    const rewards = GAME_CONFIG.DAILY_REWARDS;
    const currentDay = data.dailyDay;

    rewards.forEach(r => {
        if (r.day === currentDay) {
            if (r.coins) data.coins += r.coins;
            if (r.gems) data.gems += r.gems;
            if (r.popcorn) data.popcorn += r.popcorn;
        }
    });

    data.dailyDay++;
    if (data.dailyDay > rewards.length) data.dailyDay = 1;
    data.lastDailyTimestamp = today;
    saveData();
    updateMenuUI();
};

window.generatePass = function() {
    const data = getData();
    const container = document.getElementById('pass-container');
    container.innerHTML = '';

    data.passLevels.forEach((lvl, i) => {
        const cube = document.createElement('div');
        cube.className = 'pass-cube' + (data.passClaimed[i] ? ' claimed' : '');
        const icon = lvl.type === 'gems' ? '💎' : lvl.type === 'popcorn' ? '🍿' : '🪙';
        cube.innerHTML = `${i+1}<br>${lvl.amount} ${icon}`;
        cube.onclick = () => claimPass(i);
        container.appendChild(cube);
    });
};

window.claimPass = function(i) {
    const data = getData();
    if (data.passClaimed[i] || data.level < i) return;

    data.passClaimed[i] = true;
    const lvl = data.passLevels[i];

    if (lvl.type === 'popcorn') {
        data.popcorn += lvl.amount;
    } else {
        data[lvl.type] += lvl.amount;
        data.popcorn += 8;
    }

    saveData();
    generatePass();
    updateMenuUI();
};

window.submitDevLevel = function() {
    const val = parseInt(document.getElementById('dev-level-input').value);
    if (!isNaN(val) && val >= 0) {
        const data = getData();
        data.level = val;
        data.devBtnHidden = true;
        saveData();
        generatePass();
        hideModal('modal-dev-level');
        alert(t('devLevelChanged'));
        updateMenuUI();
    }
};

// Инициализация обработчиков
document.getElementById('btn-nick').onclick = () => showModal('modal-nick');

document.getElementById('btn-mode').onclick = toggleMode;

// Свайп для режима Duo
let touchStartY = 0;
document.getElementById('btn-mode').addEventListener('touchstart', e => {
    touchStartY = e.changedTouches[0].screenY;
});
document.getElementById('btn-mode').addEventListener('touchend', e => {
    const dy = e.changedTouches[0].screenY - touchStartY;
    if (dy < -30) {
        mode = 'duo';
        updateModeBtnText();
    }
});

document.getElementById('btn-pass').onclick = () => {
    generatePass();
    showModal('modal-pass');
};
document.getElementById('btn-secret').onclick = () => showModal('modal-secret');

// Функция загрузки
async function runLoading() {
    const pb = document.getElementById('progress-bar');
    const pt = document.getElementById('progress-text');
    const sc = document.getElementById('server-connect');

    const wait = (ms) => new Promise(r => setTimeout(r, ms));

    await wait(1500);
    pb.style.width = '25%';
    pt.innerText = '25%';
    await wait(1000);
    pb.style.width = '65%';
    pt.innerText = '65%';
    await wait(800);
    pb.style.width = '100%';
    pt.innerText = '100%';
    await wait(500);
    sc.style.display = 'block';
    await wait(1000);

    document.getElementById('loading').classList.remove('active-screen');
    document.getElementById('menu').classList.add('active-screen');
    updateMenuUI();
    generatePass();

    // Запуск таймеров
    setInterval(() => {
        const shopTimer = document.getElementById('shop-timer');
        if (shopTimer) shopTimer.innerText = getTimeToTomorrowStr();

        // Обновление сезона
        const data = getData();
        const seasonDiff = data.seasonEnd - Date.now();
        if (seasonDiff <= 0) {
            data.seasonEnd = Date.now() + GAME_CONFIG.SEASON_DURATION;
            saveData();
        }
        const sd = Math.floor(seasonDiff / (1000 * 60 * 60 * 24));
        const sh = Math.floor((seasonDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const timerEl = document.getElementById('season-timer');
        if (timerEl) {
            timerEl.innerText = `${sd} ${data.lang === 'ru' ? 'д.' : 'd.'} ${sh} ${data.lang === 'ru' ? 'ч.' : 'h.'}`;
        }

        updateDailyUI();
    }, 1000);
}