console.log(Object.keys(process.env).filter(k => k.includes("GEMINI") || k.includes("API")).map(k => `${k}=${process.env[k]}`));
