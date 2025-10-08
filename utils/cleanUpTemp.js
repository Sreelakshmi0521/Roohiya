const fs = require('fs').promises;

const cleanupTempFiles = async (filePaths) => {
    if (!filePaths || filePaths.length === 0) return;
    
    const cleanupPromises = filePaths.map(async (filePath) => {
        try {
            await fs.unlink(filePath);
        } catch (error) {
            
        }
    });
    
    await Promise.allSettled(cleanupPromises);
};

module.exports = {
    cleanupTempFiles
};