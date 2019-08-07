﻿'use strict';

// load module
const wikiapi = require('../wikiapi.js');

const CeL = global.CeL;
CeL.info('Using CeJS version: ' + CeL.version);

// load modules for test
CeL.run('application.debug.log');

// ============================================================================

/** {ℕ⁰:Natural+0}count of all errors (failed + fatal) */
let all_error_count = 0;
/** {ℕ⁰:Natural+0}tests still running */
let still_running = 0;

function check_tests(recorder, error_count) {
	all_error_count += error_count;
	if (--still_running > 0 || all_error_count === 0)
		return;

	throw new Error('All %error@1.', all_error_count);
}

// ============================================================================

still_running++;
CeL.test('load page', async (assert, setup_test, finish_test) => {
	setup_test('load page: [[w:en:Universe]]');
	let wiki = new wikiapi;
	let page = await wiki.page('Universe');
	// console.log(CeL.wiki.title_link_of('Universe') + ':');
	// console.log(page.wikitext);
	assert(page.wikitext.includes('space]]')
		&& page.wikitext.includes('time]]'), 'wikitext');
	finish_test('load page: [[w:en:Universe]]');
}, check_tests);

// ------------------------------------------------------------------

still_running++;
CeL.test('edit page', async (assert, setup_test, finish_test) => {
	setup_test('edit page');
	const test_page_title = 'Project:Sandbox';
	const test_wikitext = '\nTest edit using {{GitHub|kanasimi/wikiapi}}.';
	let bot_name = null;
	let password = null;

	let enwiki = new wikiapi;
	await enwiki.login(bot_name, password, 'en');

	// CeL.set_debug(6);
	await enwiki.edit_page(test_page_title, (page_data) => {
		// append text
		return page_data.wikitext
			+ test_wikitext;
	}, {
			bot: 1,
			summary: 'Test edit using wikiapi'
		});
	// CeL.set_debug(0);

	let page = await enwiki.page(test_page_title);
	// IP is blocked.
	// assert(page.wikitext.endsWith(test_wikitext), 'test edit page result');

	// console.log('Done.');
	finish_test('edit page');
}, check_tests);

// ------------------------------------------------------------------

still_running++;
CeL.test('parse page en', async (assert, setup_test, finish_test) => {
	setup_test('parse page en');
	let user_name = null;
	let password = null;

	let enwiki = new wikiapi('en');
	await enwiki.login(user_name, password);
	let page = await enwiki.page('Universe');
	let template_list = [];
	page.parse().each('template',
		(token) => template_list.push(token.name));
	assert(template_list.includes('Infobox'), '[[w:en:Universe]] must includes {{Infobox}}');
	finish_test('parse page en');
}, check_tests);

// ------------------------------------------------------------------

still_running++;
CeL.test('parse page zh', async (assert, setup_test, finish_test) => {
	setup_test('parse page zh');
	let zhwiki = new wikiapi('zh');
	let page = await zhwiki.page('宇宙');
	let template_list = [];
	page.parse().each('template',
		(token) => template_list.push(token.name));
	assert(template_list.includes('Infobox'), '[[w:zh:宇宙]] must includes {{Infobox}}');
	finish_test('parse page zh');
}, check_tests);

// ------------------------------------------------------------------

still_running++;
CeL.test('read wikidata', async (assert, setup_test, finish_test) => {
	setup_test('read wikidata');
	let wiki = new wikiapi;
	// Q1: Universe
	let page = await wiki.data('Q1');
	assert([CeL.wiki.data.value_of(page.labels.zh), '宇宙'], 'zh label of Q1 is 宇宙');
	finish_test('read wikidata');
}, check_tests);

// ------------------------------------------------------------------

still_running++;
CeL.test('read wikidata #2', async (assert, setup_test, finish_test) => {
	setup_test('read wikidata #2');
	let wiki = new wikiapi;
	// P1419: shape
	let data = await wiki.data('Universe', 'P1419');
	// console.log('`shape` of the `Universe`:');
	// console.log(data);
	assert(data.includes('shape of the universe'), '`shape` of the `Universe` is Q1647152 (shape of the universe)');
	finish_test('read wikidata #2');
}, check_tests);

// ------------------------------------------------------------------

still_running++;
CeL.test('get list of category', async (assert, setup_test, finish_test) => {
	setup_test('get list of [[w:en:Category:Chemical_elements]]');
	let wiki = new wikiapi;
	let list = await wiki.categorymembers('Chemical elements');
	assert(list.map((page_data) => page_data.title).includes('Iron'), 'Iron is a chemical element');
	finish_test('get list of [[w:en:Category:Chemical_elements]]');
}, check_tests);

