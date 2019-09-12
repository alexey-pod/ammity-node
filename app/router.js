const path = require('path');
const router = require('express').Router();
const init_controller = require('./controllers/init');
const index_controller = require('./controllers/index');
const pages_controller = require('./controllers/pages');
const ajax_controller = require('./controllers/ajax');
const catalog_controller = require('./controllers/catalog');

router.get('/app/respondents/init.php', init_controller.index);
router.get('/app/respondents/index.php', index_controller.index);

router.get('/app/respondents/pages.php', function(req, res) {
	const { mnemonic } = req.query;

	if (mnemonic == 'contact') {
		return pages_controller.contact(req, res);
	}
	if (mnemonic == 'presentation') {
		return pages_controller.presentation(req, res);
	}
	if (mnemonic == 'product_registration') {
		return pages_controller.product_registration(req, res);
	}
	if (mnemonic == 'search_dealer') {
		return pages_controller.search_dealer(req, res);
	}
	if (mnemonic == 'app') {
		return pages_controller.app(req, res);
	}

	return pages_controller.index(req, res);
});

router.get('/app/respondents/catalog.php', async function(req, res) {
	const { mode } = req.query;

	if (mode == 'ann_array_cat' || mode == 'catalog_mane') {
		return catalog_controller.ann_array_cat(req, res);
	}

	if (mode == 'ann_array_seria') {
		return catalog_controller.ann_array_seria(req, res);
	}

	if (mode == 'ann_item') {
		return catalog_controller.ann_item(req, res);
	}

	if (mode == 'compare') {
		return catalog_controller.compare(req, res);
	}
});

router.post('/respondents/script_client.php', function(req, res) {
	const { mode } = req.body;

	if (mode == 'getSeriaArrayByAnnCat') {
		return ajax_controller.getSeriaArrayByAnnCat(req, res);
	}

	if (mode == 'getAnnArrayForRegister') {
		return ajax_controller.getAnnArrayForRegister(req, res);
	}

	if (mode == 'searchAnn') {
		return ajax_controller.searchAnn(req, res);
	}

	if (mode == 'setCompare') {
		return ajax_controller.setCompare(req, res);
	}

	if (mode == 'addToBasket') {
		return ajax_controller.addToBasket(req, res);
	}

	if (mode == 'loadBasket') {
		return ajax_controller.loadBasket(req, res);
	}

	if (mode == 'updateBasketItem') {
		return ajax_controller.updateBasketItem(req, res);
	}

	if (mode == 'deleteFromBasket') {
		return ajax_controller.deleteFromBasket(req, res);
	}

	if (mode == 'addOrderItem') {
		return ajax_controller.addOrderItem(req, res);
	}

	if (
		[
			'addPrItem',
			'addDealerRequestItem',
			'addCommentItem',
			'addServiceItem',
			'addQuestionItem'
		].indexOf(mode)
	) {
		return ajax_controller.addFakeRequest(req, res);
	}
});

router.get('*', function(req, res) {
	const HTML_FILE = path.resolve('../index.html');
	return res.sendFile(HTML_FILE);
});

module.exports = router;
