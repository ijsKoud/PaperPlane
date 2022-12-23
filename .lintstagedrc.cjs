module.exports = {
	"**/*.{js,jsx,ts,tsx}": (filenames) => ["yarn run lint", `prettier --write ${filenames.join(" ")}`]
};
