/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/unbound-method */
const { join } = require("path");

module.exports.DATA_DIR = join(process.cwd(), "data");
module.exports.FILE_DATA_DIR = join(module.exports.DATA_DIR, "files");
