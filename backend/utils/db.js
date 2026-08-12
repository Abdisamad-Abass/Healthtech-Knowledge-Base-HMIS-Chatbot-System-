exports.withTimeout = async (promise, ms = 10000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database timeout")), ms),
    ),
  ]);
};

exports.retryPrisma = async (operation, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (
        (error.code === "ETIMEDOUT" || error.message.includes("timeout")) &&
        i < retries - 1
      ) {
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
};
