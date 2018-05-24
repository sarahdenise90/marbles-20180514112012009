// ============================================================================================================================
// 													 Get config file fields
// ============================================================================================================================

module.exports = function (cp, logger) {
	var helper = {};

	// get the customer owner names
	helper.getCustomerUsernamesConfig = function () {
		return cp.getCustomersField('usernames');
	};

	// get the customers trading company name from config file
	helper.getCompanyNameFromFile = function () {
		return cp.getCustomersField('company');
	};

	// get the customer's server port number
	helper.getCustomersPort = function () {
		return cp.getCustomersField('port');
	};

	// get the status of customers previous startup
	helper.getEventsSetting = function () {
		if (cp.config['use_events']) {
			return cp.config['use_events'];
		}
		return false;
	};

	// get the re-enrollment period in seconds
	helper.getKeepAliveMs = function () {
		var sec = cp.getCustomersField('keep_alive_secs');
		if (!sec) sec = 30;									// default to 30 seconds
		return (sec * 1000);
	};

	return helper;
};
