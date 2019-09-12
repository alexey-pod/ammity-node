function checkInBasketAmount(config, SESSION) {
	const id = config['id'];

	for (let item of SESSION['user_data']['cart']) {
		if (item['id'] == id) {
			return item['amount'];
		}
	}
	return 0;
}

function addToBasket(config, SESSION) {
	const item_array = SESSION['user_data']['cart'];

	for (let key in item_array) {
		let val = item_array[key];
		if (val['id'] == config['id']) {
			SESSION['user_data']['cart'][key]['amount'] += config['amount'];
			return;
		}
	}

	SESSION['user_data']['cart'].push({
		id: config['id'],
		amount: config['amount']
	});

	const amount = checkInBasketAmount(config, SESSION);
	return amount;
}

function checkInBasket(config, SESSION) {
	const id = config['id'];

	for (let item of SESSION['user_data']['cart']) {
		if (item['id'] == id) {
			return true;
		}
	}
	return false;
}

function clearBasket(config, SESSION) {
	SESSION['user_data']['cart'] = [];
	return;
}

function deleteFromBasket(config, SESSION) {
	const id = config['id'];

	let cart = [];
	for (let key in SESSION['user_data']['cart']) {
		let val = SESSION['user_data']['cart'][key];
		if (val['id'] != id) {
			cart.push(val);
		}
	}
	SESSION['user_data']['cart'] = cart;
	return;
}

function updateBasketItem(config, SESSION) {
	const { id, amount } = config;

	for (let key in SESSION['user_data']['cart']) {
		let val = SESSION['user_data']['cart'][key];
		if (val['id'] == id) {
			SESSION['user_data']['cart'][key]['amount'] = amount;
			return;
		}
	}
	return;
}

async function loadBasket(config, SESSION) {
	const item_array = SESSION['user_data']['cart'];

	if (!item_array.length) {
		return {
			ann_array: [],
			summa: 0,
			summa_str: '0'
		};
	}

	let total_summa = 0;

	let basket = [];
	const AnnModel = require('./ann');

	for (let val of item_array) {
		let tmp = await AnnModel.getAnnItemShot({
			id: val['id'],
			bild_full_name: true
		});

		let item = {
			id: tmp['id'],
			name: tmp['name'],
			name_full: tmp['name_full'],
			cat_name_one: tmp['cat_name_one'],
			seria_name: tmp['seria_name'],
			image: tmp['image'],
			price: tmp['price'],
			price_str: AnnModel.formatPrice(tmp['price']),
			url: tmp['url']
		};

		item['amount'] = val['amount'];
		item['summa'] = item['amount'] * item['price'];
		item['summa_str'] = AnnModel.formatPrice(item['summa']);
		basket.push(item);
		total_summa += item['summa'];
	}

	const result = {
		ann_array: basket,
		summa: total_summa,
		summa_str: AnnModel.formatPrice(total_summa)
	};
	return result;
}

module.exports = {
	addToBasket,
	checkInBasket,
	checkInBasketAmount,
	clearBasket,
	loadBasket,
	deleteFromBasket,
	updateBasketItem
};
