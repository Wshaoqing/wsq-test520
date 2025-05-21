exports.logInfo = (msg, obj) => {
    console.log(`[INFO] ${msg}`, obj || '');
};

exports.logError = (msg, err) => {
    console.error(`[ERROR] ${msg}`, err.message);
};