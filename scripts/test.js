// eslint-disable-next-line @typescript-eslint/no-var-requires
const twofactor = require("node-2fa");

const newSecret = twofactor.generateSecret({ name: "MyAwesomeApp", account: "johndoe" });
console.log(newSecret);

const newToken = twofactor.generateToken("NTNTAOVMXKAFJKM5VLVEFSED66ZSHNIX");
const check = twofactor.verifyToken("NTNTAOVMXKAFJKM5VLVEFSED66ZSHNIX", "738292");
console.log(newToken, check);

// ADD 2FA package!!!!!!!!!!
// ADD FORM PACKAGE!!!!!!!!!!!!!
// ADD LOGIN PAGE!!!!!!!!!!
