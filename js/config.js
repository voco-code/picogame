// Конфигурация бойцов
const BRAWLERS = {
    'mito': {
        head: '😀',
        body: '🩻',
        shorts: '🩳',
        legs: '🦵🏻🦵🏻',
        hp: 1000,
        dmg: 300,
        name: 'Мито',
        enName: 'Mito'
    },
    'kiko': {
        head: '😎',
        body: '🩻',
        shorts: '🩲',
        legs: '🦵🦵🏽',
        hp: 1000,
        dmg: 300,
        name: 'Коко',
        enName: 'Coco'
    },
    'ratok': {
        head: '👿',
        body: '🩻',
        shorts: '🩳',
        legs: '🦿🦿',
        hp: 1200,
        dmg: 350,
        name: 'Раток',
        enName: 'Ratok'
    },
    'utok': {
        head: '💩',
        body: '👕',
        shorts: '🩳',
        legs: '🦵🦵',
        hp: 1400,
        dmg: 250,
        name: 'Уток',
        enName: 'Utok'
    },
    'shatko': {
        head: '😏',
        body: '🎽',
        shorts: '🩲',
        legs: '🦿🦵',
        hp: 1200,
        dmg: 300,
        name: 'Шатко',
        enName: 'Shatko'
    }
};

// Настройки игры
const GAME_CONFIG = {
    MAX_BOTS: {
        showdown: 3,
        training: 2,
        duo: 5
    },
    PLAYER_SPEED: 400,
    KIKO_SPEED: 460,
    BOT_SPEED: 170,
    BOT_KIKO_SPEED: 220,
    SHOOT_COOLDOWN: 500,
    BOT_SHOOT_COOLDOWN: 4000,
    BULLET_SPEED: 850,
    SHIELD_PRICE: 598,
    SHIELD_CHARGES: 4,
    SHATKO_POPCORN_PRICE: 169,
    SHATKO_GEMS_PRICE: 499,
    RATOK_GEMS_PRICE: 299,
    UTOK_COINS_PRICE: 599,
    SEASON_DURATION: (18 * 24 + 10) * 60 * 60 * 1000,
    NICK_CHANGE_LIMIT: 2,
    NICK_LOCK_DAYS: 14,
    DAILY_REWARDS: [
        { day: 1, coins: 7 },
        { day: 2, popcorn: 15 },
        { day: 3, gems: 5 },
        { day: 4, popcorn: 60 },
        { day: 5, coins: 100 }
    ],
    BOT_NICKS: ['LeoNinja', 'Pro_Brawler', 'BrawlKing', 'CyberGamer', 'SniperX', 'ShadowStrike', 'Tornado', 'Phoenix'],
    PASS_LEVELS: 60,
    BUSH_COUNT: 16,
    ARENA_SIZE: 2000,
    RAGE_DURATION: 3,
    IMMORTAL_DURATION: 10,
    SHATKO_ABILITY_DURATION: 10,
    HEAL_INTERVAL: 3,
    HEAL_AMOUNT: 30,
    BOT_FROZEN_DURATION: 2.5
};