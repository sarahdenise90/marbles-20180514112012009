//-------------------------------------------------------------------
// Marbles Chaincode Library
// - this contains the most interesting code pieces of marbles.
// - each function is using the FCW library to communicate to the peer/orderer
// - from here we can interact with our chaincode.
//   - the cc_function is the chaincode function we will call
//   - the cc_args are the arguments to pass to your chaincode function
//-------------------------------------------------------------------

module.exports = function (enrollObj, g_options, fcw, logger) {
	var customers_chaincode = {};

	// Chaincode -------------------------------------------------------------------------------

	//check if chaincode exists
	customers_chaincode.check_if_already_instantiated = function (options, cb) {
		console.log('');
		logger.info('Checking for chaincode...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			cc_function: 'read',
			cc_args: ['selftest']
		};
		fcw.query_chaincode(enrollObj, opts, function (err, resp) {  // send a request to our peer
			if (err != null) {
				if (cb) return cb(err, resp);
			}
			else {
				if (resp.parsed == null || isNaN(resp.parsed)) {	 //if nothing is here, no chaincode
					if (cb) return cb({ error: 'chaincode not found' }, resp);
				}
				else {
					if (cb) return cb(null, resp);
				}
			}
		});
	};

	//check chaincode version
	customers_chaincode.check_version = function (options, cb) {
		console.log('');
		logger.info('Checking chaincode and ui compatibility...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			cc_function: 'read',
			cc_args: ['customers_ui']
		};
		fcw.query_chaincode(enrollObj, opts, function (err, resp) {
			if (err != null) {
				if (cb) return cb(err, resp);
			}
			else {
				if (resp.parsed == null) {							//if nothing is here, no chaincode
					if (cb) return cb({ error: 'chaincode not found' }, resp);
				}
				else {
					if (cb) return cb(null, resp);
				}
			}
		});
	};


	// Marbles -------------------------------------------------------------------------------

	//create a marble
	customers_chaincode.create_a_customer = function (options, cb) {
		console.log('');
		logger.info('Creating a customer...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			event_urls: g_options.event_urls,
			endorsed_hook: options.endorsed_hook,
			ordered_hook: options.ordered_hook,
			cc_function: 'init_customer',
			cc_args: [
				'm' + leftPad(Date.now() + randStr(5), 19),
				options.args.color,
				options.args.size,
				options.args.owner_id,
				options.args.auth_company
			],
		};
		fcw.invoke_chaincode(enrollObj, opts, function (err, resp) {
			if (cb) {
				if (!resp) resp = {};
				resp.id = opts.cc_args[0];			//pass customer id back
				cb(err, resp);
			}
		});
	};

	//get customer
	customers_chaincode.get_customer = function (options, cb) {
		logger.info('fetching customer ' + options.customer_id + ' list...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_version: g_options.chaincode_version,
			chaincode_id: g_options.chaincode_id,
			cc_function: 'read',
			cc_args: [options.args.customer_id]
		};
		fcw.query_chaincode(enrollObj, opts, cb);
	};

	//set customer owner
	customers_chaincode.set_customer_owner = function (options, cb) {
		console.log('');
		logger.info('Setting customer owner...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			event_urls: g_options.event_urls,
			endorsed_hook: options.endorsed_hook,
			ordered_hook: options.ordered_hook,
			cc_function: 'set_owner',
			cc_args: [
				options.args.customer_id,
				options.args.owner_id,
				options.args.auth_company
			],
		};
		fcw.invoke_chaincode(enrollObj, opts, cb);
	};

	//delete customer
	customers_chaincode.delete_customer = function (options, cb) {
		console.log('');
		logger.info('Deleting a customer...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			event_urls: g_options.event_urls,
			endorsed_hook: options.endorsed_hook,
			ordered_hook: options.ordered_hook,
			cc_function: 'delete_customer',
			cc_args: [options.args.customer_id, options.args.auth_company],
		};
		fcw.invoke_chaincode(enrollObj, opts, cb);
	};

	//get history for key
	customers_chaincode.get_history = function (options, cb) {
		logger.info('Getting history for...', options.args);

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			event_urls: g_options.event_urls,
			endorsed_hook: options.endorsed_hook,
			ordered_hook: options.ordered_hook,
			cc_function: 'getHistory',
			cc_args: [options.args.id]
		};
		fcw.query_chaincode(enrollObj, opts, cb);
	};

	//get multiple marbles/owners by start and stop ids
	customers_chaincode.get_multiple_keys = function (options, cb) {
		logger.info('Getting customers between ids', options.args);

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			event_urls: g_options.event_urls,
			endorsed_hook: options.endorsed_hook,
			ordered_hook: options.ordered_hook,
			cc_function: 'getCustomersByRange',
			cc_args: [options.args.start_id, options.args.stop_id]
		};
		fcw.query_chaincode(enrollObj, opts, cb);
	};


	// Owners -------------------------------------------------------------------------------

	//register a owner/user
	customers_chaincode.register_owner = function (options, cb) {
		console.log('');
		logger.info('Creating a customer owner...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			event_urls: g_options.event_urls,
			endorsed_hook: options.endorsed_hook,
			ordered_hook: options.ordered_hook,
			cc_function: 'init_owner',
			cc_args: [
				'o' + leftPad(Date.now() + randStr(5), 19),
				options.args.customer_owner,
				options.args.owners_company
			],
		};
		fcw.invoke_chaincode(enrollObj, opts, function (err, resp) {
			if (cb) {
				if (!resp) resp = {};
				resp.id = opts.cc_args[0];				//pass owner id back
				cb(err, resp);
			}
		});
	};

	//get a owner/user
	customers_chaincode.get_owner = function (options, cb) {
		var full_username = build_owner_name(options.args.customer_owner, options.args.owners_company);
		console.log('');
		logger.info('Fetching owner ' + full_username + ' list...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			cc_function: 'read',
			cc_args: [full_username]
		};
		fcw.query_chaincode(enrollObj, opts, cb);
	};

	//get the owner list
	customers_chaincode.get_owner_list = function (options, cb) {
		console.log('');
		logger.info('Fetching owner index list...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			cc_function: 'read',
			cc_args: ['_ownerindex']
		};
		fcw.query_chaincode(enrollObj, opts, cb);
	};

	// disable a marble owner
	customers_chaincode.disable_owner = function (options, cb) {
		console.log('');
		logger.info('Disabling a customer owner...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			event_urls: g_options.event_urls,
			endorsed_hook: options.endorsed_hook,
			ordered_hook: options.ordered_hook,
			cc_function: 'disable_owner',
			cc_args: [
				options.args.owner_id,
				options.args.auth_company
			],
		};
		fcw.invoke_chaincode(enrollObj, opts, function (err, resp) {
			if (cb) {
				if (!resp) resp = {};
				resp.id = opts.cc_args[0];				//pass owner id back
				cb(err, resp);
			}
		});
	};

	//build full name
	customers_chaincode.build_owner_name = function (username, company) {
		return build_owner_name(username, company);
	};


	// All ---------------------------------------------------------------------------------

	//build full name
	customers_chaincode.read_everything = function (options, cb) {
		console.log('');
		logger.info('Fetching EVERYTHING...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_version: g_options.chaincode_version,
			chaincode_id: g_options.chaincode_id,
			cc_function: 'read_everything',
			cc_args: ['']
		};
		fcw.query_chaincode(enrollObj, opts, cb);
	};

	// get block height of the channel
	customers_chaincode.channel_stats = function (options, cb) {
		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts
		};
		fcw.query_channel(enrollObj, opts, cb);
	};


	// Other -------------------------------------------------------------------------------

	// Format Owner's Actual Key Name
	function build_owner_name(username, company) {
		return username.toLowerCase() + '.' + company;
	}

	// random string of x length
	function randStr(length) {
		var text = '';
		var possible = 'abcdefghijkmnpqrstuvwxyz0123456789ABCDEFGHJKMNPQRSTUVWXYZ';
		for (var i = 0; i < length; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
		return text;
	}

	// left pad string with "0"s
	function leftPad(str, length) {
		for (var i = str.length; i < length; i++) str = '0' + String(str);
		return str;
	}

	return customers_chaincode;
};
