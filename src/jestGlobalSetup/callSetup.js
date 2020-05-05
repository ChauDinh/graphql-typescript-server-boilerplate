// reference setup module
const { setup } = require("./setup");

module.exports = async function () {
  // Call the initialization methods
  await setup();
  return null;
};
