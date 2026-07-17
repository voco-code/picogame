// Управление данными
let gameData = null;

function initData() {
    const saved = localStorage.getItem('pico_data');
    gameData = saved ? JSON.parse(saved) : {};

    // Установка значений по умолчанию
    const defaults = {
        coins: 0,
        gems: 0,
        popcorn: 0,
        level: 0,
        nick: '',
        nickClicks: 0,
        selectedBrawler: 'mito',
        unlocked: ['mito', 'kiko'],
        dailyDay: 1,
        lastDailyTimestamp: 0,
        lastShopTimestamp: 0,
        passLevels: [],
        passClaimed: [],
        codesUsed: {},
        shields: 0,
        nickChangesCount: 0,
        nickLockUntil: 0,
        seasonEnd: Date.now() + GAME_CONFIG.SEASON_DURATION,
        devBtnHidden: false,
        lang: 'ru',
        noRainbow: false
    };

    // Заполняем недостающие поля
    for (const [key, value] of Object.entries(defaults)) {
        if (gameData[key] === undefined) {
            gameData[key] = value;
        }
    }

    // Генерируем уровни пасса если их нет
    if (gameData.passLevels.length === 0) {
        generatePassLevels();
    }

    saveData();
    return gameData;
}

function saveData() {
    localStorage.setItem('pico_data', JSON.stringify(gameData));
}

function getData() {
    if (!gameData) initData();
    return gameData;
}

function updateData(newData) {
    gameData = { ...gameData, ...newData };
    saveData();
    return gameData;
}

function generatePassLevels() {
    gameData.passLevels = [];
    for (let i = 1; i <= GAME_CONFIG.PASS_LEVELS; i++) {
        const rand = Math.random();
        let type = 'coins';
        let amount = Math.floor(Math.random() * 100) + 50;

        if (rand > 0.75) {
            type = 'gems';
            amount = Math.floor(Math.random() * 10) + 1;
        } else if (rand > 0.45) {
            type = 'popcorn';
            amount = Math.floor(Math.random() * 40) + 15;
        }

        gameData.passLevels.push({ type, amount });
    }
    saveData();
}

function getMskDate() {
    return new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Moscow" }));
}

function getTimeToTomorrowStr() {
    const now = getMskDate();
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0);
    const diff = tomorrow - now;
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${h} ч. ${m} м.`;
}

function getTodayStr() {
    const now = getMskDate();
    return now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate();
}