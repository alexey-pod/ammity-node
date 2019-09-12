const BasketModel = require('./basket');

function addOrderItem(config, SESSION) {
	BasketModel.clearBasket({}, SESSION);
	return Math.floor(Math.random() * 1000);
}

function addFakeRequest(config) {
	return Math.floor(Math.random() * 1000);
}

module.exports = { addOrderItem, addFakeRequest };
