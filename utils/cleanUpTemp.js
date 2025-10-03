import fs from 'fs/promises';

export async function cleanupTempFiles(paths) {
  for (const filePath of paths) {
    try {
      await fs.unlink(filePath);
      console.log(`🧹 Cleaned up temporary file: ${filePath}`);
    } catch (err) {
      console.error(`❌ Failed to delete temp file ${filePath}: ${err.message}`);
    }
  }
}
