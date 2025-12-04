
function getColorCode(color) {
    if (!color) return '#d4af37';
    
    const colorMap = {
        'gold': '#d4af37',
        'silver': '#c0c0c0',
        'rose gold': '#e7c6b3',
        'white': '#ffffff',
        'black': '#000000',
        'yellow': '#ffd700',
        'red': '#ff0000',
        'blue': '#0000ff',
        'green': '#008000'
    };
    return colorMap[color.toLowerCase()] || '#d4af37';
}
module.exports = { getColorCode }