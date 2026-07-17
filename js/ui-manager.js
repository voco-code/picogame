// Управление интерфейсом
function updateMenuUI() {
    const data = getData();

    // Обновление радужных шрифтов
    if (data.noRainbow) {
        document.body.classList.add('no-rainbow');
    } else {
        document.body.classList.remove('no-rainbow');
    }

    // Фикс радужных шрифтов
    const seasonTitleEl = document.getElementById('ui-season-title');
    const passBtnEl = document.getElementById('btn-pass');
    if (seasonTitleEl && passBtnEl) {
        if (!data.noRainbow) {
            seasonTitleEl.style.animation = '';
            seasonTitleEl.style.color = '';
            passBtnEl.style.animation = '';
            passBtnEl.style.color = '';
        } else {
            seasonTitleEl.style.animation = 'none';
            seasonTitleEl.style.color = '#000';
            passBtnEl.style.animation = 'none';
            passBtnEl.style.color = '#fff';
        }
    }

    // Кнопка радуги
    const toggleBtn = document.getElementById('btn-toggle-rainbow');
    if (toggleBtn) {
        toggleBtn.innerText = data.noRainbow ? t('toggleOn') : t('toggleOff');
        toggleBtn.className = data.noRainbow ? 'btn-flat btn-green' : 'btn-flat btn-red';
    }

    // Язык
    const selectLang = document.getElementById('setting-lang');
    if (selectLang) selectLang.value = data.lang;

    // Баланс
    document.getElementById('ui-coins').innerText = data.coins;
    document.getElementById('ui-gems').innerText = data.gems;
    document.getElementById('ui-coins-lbl').childNodes[0].textContent = t('coins');
    document.getElementById('ui-gems-lbl').childNodes[0].textContent = t('gems');

    // Сезон
    document.getElementById('ui-season-num-text').innerText = t('seasonText');
    document.getElementById('ui-season-title').innerText = t('megaSummer');

    // Кнопки меню
    document.getElementById('btn-menu-shop').innerText = t('shop');
    document.getElementById('btn-menu-brawlers').innerText = t('brawlers');
    document.getElementById('btn-menu-daily').innerText = t('daily');
    document.getElementById('btn-play-text').innerText = t('play');

    // Настройки
    document.getElementById('sett-title').innerText = t('settTitle');
    document.getElementById('sett-lang-title').innerText = t('settLang');
    document.getElementById('sett-rainbow-title').innerText = t('settRainbow');

    // Ник
    document.getElementById('nick-modal-title').innerText = t('nickTitle');
    document.getElementById('nick-input').placeholder = t('nickPlaceholder');
    document.getElementById('nick-select-btn').innerText = t('nickSelectBtn');
    document.getElementById('nick-warning-lbl').innerText = t('nickWarning');

    // Бойцы
    document.getElementById('brawlers-modal-title').innerText = t('brawlersTitle');

    // Магазин
    document.getElementById('shop-modal-title').innerText = t('shopTitle');
    document.getElementById('shop-shield-heading').innerText = t('shopShieldTitle');
    document.getElementById('shop-shield-desc-lbl').innerHTML = t('shopShieldDesc');
    document.getElementById('shop-shield-btn-lbl').innerText = t('shopShieldCost');
    document.getElementById('shop-gift-heading').innerText = t('shopGiftTitle');
    document.getElementById('shop-gift-amt-lbl').innerText = t('shopGiftAmt');
    document.getElementById('shop-action-heading').innerText = t('shopActionTitle');
    document.getElementById('shop-action-desc-lbl').innerText = t('shopActionDesc');
    document.getElementById('shop-action-bonus-lbl').innerText = t('shopActionBonus');
    document.getElementById('shop-action-btn-lbl').innerText = t('shopActionCost');
    document.getElementById('shop-author-heading').innerText = t('shopAuthorCode');
    document.getElementById('shop-author-btn-lbl').innerText = t('shopActivate');

    // Ежедневные
    document.getElementById('daily-modal-title').innerText = t('dailyTitle');
    document.getElementById('daily-d1').innerText = t('dailyDay1');
    document.getElementById('daily-d2').innerText = t('dailyDay2');
    document.getElementById('daily-d3').innerText = t('dailyDay3');
    document.getElementById('daily-d4').innerText = t('dailyDay4');
    document.getElementById('daily-d5').innerText = t('dailyDay5');

    // Pass
    document.getElementById('pass-goto-curr-btn').innerText = t('passGotoCurr');
    document.getElementById('pass-goto-last-btn').innerText = t('passGotoLast');

    // Коды
    document.getElementById('code-modal-title').innerText = t('codeTitle');
    document.getElementById('code-modal-btn').innerText = t('codeBtn');

    // Секретный магазин
    document.getElementById('secret-modal-title').innerText = t('secretTitle');

    // Щиты
    const shieldsEl = document.getElementById('shop-shields-count');
    if (shieldsEl) shieldsEl.innerText = data.shields;

    // Попкорн в ивентах
    const popcornEl = document.getElementById('events-popcorn-count');
    if (popcornEl) popcornEl.innerText = `${data.popcorn} 🍿`;

    // Кнопка покупки Шатко за попкорн
    const buyShatkoBtn = document.getElementById('btn-buy-shatko-popcorn');
    if (buyShatkoBtn) {
        if (data.unlocked.includes('shatko')) {
            buyShatkoBtn.innerText = t('secretBought');
            buyShatkoBtn.style.background = "#888";
        } else {
            buyShatkoBtn.innerText = "КУПИТЬ ЗА 169 🍿";
            buyShatkoBtn.style.background = "#ff0000";
        }
    }

    // Персонаж в меню
    const b = BRAWLERS[data.selectedBrawler];
    document.getElementById('menu-character').innerHTML = `
        <div class="skin-wrapper">
            <div>${b.head}</div>
            <div>${b.body}</div>
            <div>${b.shorts || ''}</div>
            <div>${b.legs}</div>
        </div>
    `;

    // Кнопка ника
    const btnNick = document.getElementById('btn-nick');
    const isDev = data.nick === "👑 ПАСХАЛКА 👑";

    if (data.nickLockUntil && data.nickLockUntil > Date.now()) {
        const nickDiff = data.nickLockUntil - Date.now();
        const nd = Math.floor(nickDiff / (1000 * 60 * 60 * 24));
        const nh = Math.floor((nickDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        btnNick.className = 'btn-flat btn-gray';
        btnNick.innerText = `${nd} ${data.lang === 'ru' ? 'д.' : 'd.'} ${nh} ${data.lang === 'ru' ? 'ч.' : 'h.'}`;
        btnNick.style.pointerEvents = 'none';
    } else {
        btnNick.innerText = data.nick || t('chooseNick');
        btnNick.className = 'btn-flat btn-blue';
        btnNick.style.pointerEvents = 'auto';
        if (data.nickClicks >= 3 && data.nick) {
            btnNick.classList.add('rainbow-text');
        }
    }

    // Кнопка разработчика
    const devBox = document.getElementById('dev-level-btn-container');
    if (isDev && !data.devBtnHidden) {
        devBox.style.display = 'block';
    } else {
        devBox.style.display = 'none';
    }

    updateModeBtnText();
    updateSecretShop();
    updateDailyUI();
}

function updateModeBtnText() {
    const modeBtn = document.getElementById('btn-mode');
    if (!modeBtn) return;
    const modeText = {
        'showdown': t('modeShowdown'),
        'training': t('modeTraining'),
        'duo': t('modeDuo')
    };
    modeBtn.innerHTML = modeText[mode] + '<br><small></small>';
}

function updateSecretShop() {
    const container = document.getElementById('secret-shop-container');
    if (!container) return;

    const ratokBtn = data.unlocked.includes('ratok') ?
        `<div class="btn-flat btn-gray" style="color:#fff;">${t('secretBought')}</div>` :
        `<div class="btn-flat btn-green" onclick="buyBrawler('ratok', ${GAME_CONFIG.RATOK_GEMS_PRICE}, 'gems')" style="color:#000;">${t('secretBuyGems')}</div>`;

    const utokBtn = data.unlocked.includes('utok') ?
        `<div class="btn-flat btn-gray" style="color:#fff;">${t('secretBought')}</div>` :
        `<div class="btn-flat btn-green" onclick="buyBrawler('utok', ${GAME_CONFIG.UTOK_COINS_PRICE}, 'coins')" style="color:#000;">${t('secretBuyCoins')}</div>`;

    const shatkoBtn = data.unlocked.includes('shatko') ?
        `<div class="btn-flat btn-gray" style="color:#fff;">${t('secretBought')}</div>` :
        `<div class="btn-flat btn-green" onclick="buyBrawler('shatko', ${GAME_CONFIG.SHATKO_GEMS_PRICE}, 'gems')" style="color:#000;">${t('secretBuyShatko')}</div>`;

    container.innerHTML = `
        <div style="border: 2px solid #fff; padding: 10px; width: 45%; min-width: 200px;">
            <h3 style="color:white;">${data.lang === 'ru' ? BRAWLERS['ratok'].name : BRAWLERS['ratok'].enName}</h3>
            <div style="font-size: 40px; text-align:center; line-height: 1;" class="skin-wrapper">
                <div>👿</div><div>🩻</div><div>🩳</div><div>🦿🦿</div>
            </div>
            <p style="font-size:12px; margin: 10px 0;">${t('ratokDesc')}</p>
            ${ratokBtn}
        </div>
        <div style="border: 2px solid #fff; padding: 10px; width: 45%; min-width: 200px;">
            <h3 style="color:white;">${data.lang === 'ru' ? BRAWLERS['utok'].name : BRAWLERS['utok'].enName}</h3>
            <div style="font-size: 40px; text-align:center; line-height: 1;" class="skin-wrapper">
                <div>💩</div><div>👕</div><div>🩳</div><div>🦵🦵</div>
            </div>
            <p style="font-size:12px; margin: 10px 0;">${t('utokDesc')}</p>
            ${utokBtn}
        </div>
        <div style="border: 2px solid #fff; padding: 10px; width: 45%; min-width: 200px;">
            <h3 style="color:white;">${data.lang === 'ru' ? BRAWLERS['shatko'].name : BRAWLERS['shatko'].enName}</h3>
            <div style="font-size: 40px; text-align:center; line-height: 1;" class="skin-wrapper">
                <div>😏</div><div>🎽</div><div>🩲</div><div>🦿🦵</div>
            </div>
            <p style="font-size:12px; margin: 10px 0;">${t('shatkoDesc')}</p>
            ${shatkoBtn}
        </div>
    `;
}

function updateDailyUI() {
    const today = getTodayStr();
    const btnClaim = document.getElementById('btn-claim-daily');
    const timer = document.getElementById('daily-timer');

    if (data.lastDailyTimestamp === today) {
        if (btnClaim) {
            btnClaim.style.background = '#888';
            btnClaim.innerText = t('dailyClaimed');
        }
        if (timer) timer.innerText = getTimeToTomorrowStr();
    } else {
        if (btnClaim) {
            btnClaim.style.background = '#005500';
            btnClaim.innerText = t('dailyClaim');
        }
        if (timer) timer.innerText = '';
    }

    // Магазин
    const shopBtn = document.getElementById('btn-claim-shop');
    if (data.lastShopTimestamp === today) {
        if (shopBtn) {
            shopBtn.style.background = '#888';
            shopBtn.innerText = t('shopGiftClaimed');
        }
    } else {
        if (shopBtn) {
            shopBtn.style.background = '#00aa00';
            shopBtn.innerText = t('shopGiftClaim');
        }
    }
}

function showModal(id) {
    if (id === 'modal-nick' && data.nickLockUntil && data.nickLockUntil > Date.now()) {
        return;
    }
    document.getElementById(id).style.display = 'flex';
}

function hideModal(id) {
    document.getElementById(id).style.display = 'none';
}

function openBrawlersModal() {
    const container = document.getElementById('brawlers-container');
    container.innerHTML = '';

    data.unlocked.forEach(id => {
        const b = BRAWLERS[id];
        if (!b) return;

        const card = document.createElement('div');
        card.className = 'btn-flat';
        card.style.textAlign = 'center';
        card.style.minWidth = '140px';

        const isSelected = data.selectedBrawler === id;
        let btnClass = 'btn-yellow';
        if (id === 'mito') btnClass = 'btn-red';
        else if (id === 'kiko') btnClass = 'btn-blue';
        else if (id === 'ratok') btnClass = 'btn-gray';
        else if (id === 'shatko') btnClass = 'rainbow-bg';
        if (isSelected) btnClass = 'btn-green';

        card.innerHTML = `
            <div style="font-size: 50px; line-height: 1;" class="skin-wrapper">
                <div>${b.head}</div><div>${b.body}</div><div>${b.shorts || ''}</div><div>${b.legs}</div>
            </div>
            <div style="margin-top:10px;" class="btn-flat ${btnClass}" onclick="selectBrawler('${id}')">
                ${isSelected ? t('brawlersSelected') : (data.lang === 'ru' ? b.name : b.enName)}
            </div>
        `;
        container.appendChild(card);
    });

    showModal('modal-brawlers');
}