const config = require("../../tailwind.config.cjs");
module.exports = { ...config, content: ["./src/**/*.{js,ts,jsx,tsx}", "../../packages/**/**/*.{js,ts,jsx,tsx}"] };
