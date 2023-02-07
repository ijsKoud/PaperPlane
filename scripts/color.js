const hex2rgba = (hex, alpha = 1) => {
	const [r, g, b] = hex.match(/\w\w/g).map((x) => parseInt(x, 16));
	return `rgba(${r},${g},${b},${alpha})`;
};

const color = "#242526";
const colorName = "main";
const aplhas = Array(10)
	.fill(null)
	.map((_, k) => (k + 1) / 10);
const generated = aplhas.map((alpha) => `"${colorName}-${alpha * 1e3}": "${hex2rgba(color, alpha)}"`);
console.log(generated.join(",\n"));
