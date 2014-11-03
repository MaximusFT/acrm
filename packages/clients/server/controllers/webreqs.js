'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Webreq = mongoose.model('Webreq')/*,
	_ = require('lodash')*/
;

/**
 * Create webreq
 */
exports.web_request_form_add = function (req, res, next) {
	console.log(req.body);
	var secret = req.body.secret;
	if (!secret)
		return res.jsonp('empty secret');
	if (secret !== 'lqMZUJM76jsBBLmsPcBA86qpiVZv620b')
		return res.jsonp('wrong secret');
	var webreq = new Webreq();
	webreq.webreq_inside_id = !req.body.webreq_inside_id ? -1 : req.body.webreq_inside_id;
	switch (req.body.webreq_type) {
	case 1:
		webreq.webreq_type = 'Обратный звонок';
		break;
	case 2:
		webreq.webreq_type = 'Хочу учиться в офисе';
		break;
	case 3:
		webreq.webreq_type = 'Хочу инвестировать (ПерсТрейдер)';
		break;
	case 4:
		webreq.webreq_type = 'Хочу учиться дистанционно в Москве';
		break;
	case 5:
		webreq.webreq_type = 'Хочу инвест. в Москве (ПерсТрейдер)';
		break;
	case 6:
		webreq.webreq_type = 'Мастер-класс в Москве';
		break;
	case 7:
		webreq.webreq_type = 'Хочу учиться дистанционно';
		break;
	case 8:
		webreq.webreq_type = 'Сайт ПТ: Вопрос с сайта';
		break;
	case 9:
		webreq.webreq_type = 'Сайт ПТ: Стать инвестором';
		break;
	case 10:
		webreq.webreq_type = 'Сайт ПТ: Стать трейдером';
		break;
	case 11:
		webreq.webreq_type = 'Сайт ПТ: Вопрос трейдеру';
		break;
	case 12:
		webreq.webreq_type = 'Хочу демо счет';
		break;
	case 13:
		webreq.webreq_type = 'Мастер-инвест';
		break;
	case 14:
		webreq.webreq_type = 'Хочу работать';
		break;
	case 15:
		webreq.webreq_type = 'Конкурсы';
		break;
	case 16:
		webreq.webreq_type = 'Акции';
		break;
	case 17:
		webreq.webreq_type = 'Хочу бонус';
		break;
	case 18:
		webreq.webreq_type = '24% годовых';
		break;
	case 19:
		webreq.webreq_type = 'Вопрос менеджеру';
		break;
	case 20:
		webreq.webreq_type = 'Хочу зарабатывать';
		break;
	case 21:
		webreq.webreq_type = 'Хочу открыть счет';
		break;
	case 29:
		webreq.webreq_type = 'Заказать обучающие материалы';
		break;
	case 30:
		webreq.webreq_type = 'Хочу торговые сигналы';
		break;
	case 31:
		webreq.webreq_type = 'Хочу электронную книгу';
		break;
	case 32:
		webreq.webreq_type = 'Хочу VIP счет';
		break;
	case 33:
		webreq.webreq_type = 'Мастер-инвест: мастер';
		break;
	case 34:
		webreq.webreq_type = 'Хочу учиться: новичкам';
		break;
	case 35:
		webreq.webreq_type = 'Телемагазин';
		break;
	case 36:
		webreq.webreq_type = 'Бизнес семинар';
		break;
	default:
		webreq.webreq_type = 'Неизвестный тип';
		break;
	}
	webreq.office_destination = !req.body.office_destination ? 'Неизвестный офис' : req.body.office_destination;
	webreq.form_address = !req.body.form_address ? '' : req.body.form_address;
	webreq.link_source = !req.body.link_source ? '' : req.body.link_source;
	webreq.target_page = !req.body.target_page ? '' : req.body.target_page;
	webreq.lastname = !req.body.lastname ? '' : req.body.lastname;
	webreq.firstname = !req.body.firstname ? '' : req.body.firstname;
	webreq.middlename = !req.body.middlename ? '' : req.body.middlename;
	webreq.sex = req.body.sex;
	webreq.email = !req.body.email ? '' : req.body.email;
	webreq.phone = !req.body.phone ? '' : req.body.phone;
	webreq.comment = !req.body.comment ? '' : req.body.comment;
	webreq.utm_source = !req.body.utm_source ? '' : req.body.utm_source;
	webreq.utm_medium = !req.body.utm_medium ? '' : req.body.utm_medium;
	webreq.utm_campaign = !req.body.utm_campaign ? '' : req.body.utm_campaign;
	webreq.utm_term = !req.body.utm_term ? '' : req.body.utm_term;
	webreq.ip = !req.body.ip ? '' : req.body.ip;
	webreq.save(function (err) {
		if (err) {
			console.log(err);
			return res.status(500).json({
				error : 'Cannot set the webreq'
			});
		}
		return res.jsonp(webreq);
	});
};

exports.webreqs = function (req, res) {
	Webreq
	.find()
	.exec(function(err, webreqs) {
		if(!webreqs) {
			return res.render('error', {
				status : 500
			});
		} else {
			return res.jsonp(webreqs);
		}
	});
};