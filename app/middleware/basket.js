module.exports = async function(req, res, next) {
	if (req.session.user_data == undefined) {
		req.session.user_data = {};
	}
	if (req.session.user_data.cart == undefined) {
		req.session.user_data.cart = [];
	}
	next();
};
