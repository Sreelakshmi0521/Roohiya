// helpers/orderIcon.js
function getColorCode(color) {
    if (!color || typeof color !== 'string') return '#d4af37';

    const normalized = color.trim().toLowerCase();

    const colorMap = {
        'gold': '#d4af37',
        'rose gold': '#e7c6b3',
        'silver': '#c0c0c0',
        'white': '#ffffff',
        'black': '#000000',
        'yellow': '#ffd700',
        'red': '#ff0000',
        'blue': '#0000ff',
        'green': '#008000',
        'platinum': '#e5e4e2'
    };

    return colorMap[normalized] || '#d4af37';
}

module.exports = { getColorCode };