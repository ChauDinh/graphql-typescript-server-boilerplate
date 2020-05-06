// reference setup module
const { setup } = require("./setup");

module.exports = async function() {
	// Call the initialization methods
	if (!process.env.TEST_HOST) {
		await setup();
	}
	return null;
};
