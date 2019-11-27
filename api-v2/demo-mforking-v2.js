// ============================================== Telnyx Media Forking Demo ==============================================

// Description:
// This simple app is creating a simple IVR to test Telnyx Call Control Media Forking

// Author:
// Filipe Leitão (filipe@telnyx.com)

// Application:
const g_appName = "telnyx-mforking";

// TTS Options
const g_ivr_voice = "female";
const g_ivr_language = "en-GB";

const g_pstn_destination = "<pstn_number_here>";
const g_udp_dest = "udp:<dest_ip_here:270010";
const g_udp_tx = "udp:<dest_ip_here:27001";
const g_udp_rx = "udp:<dest_ip_here:27002";

// ======= Conventions =======
// = g_xxx: global variable
// = f_xxx: function variable
// = l_xxx: local variable
// ===========================

// =======================================================================================================================

var express = require("express");
var request = require("request");

// =============================================== Telnyx Account Details ===============================================

const g_telnyx_api_auth_v2 = require("./telnyx-account-v2");
const g_serviceName = "MForkingApp";

// ================================================ RESTful API Creation ================================================

var rest = express();

rest.use(express.json());

// ================================================ AUXILIARY FUNCTIONS  ================================================

function get_timestamp() {
	var now = new Date();

	return (
		"utc|" +
		now.getUTCFullYear() +
		"/" +
		(now.getUTCMonth() + 1) +
		"/" +
		now.getUTCDate() +
		"|" +
		now.getHours() +
		":" +
		now.getMinutes() +
		":" +
		now.getSeconds() +
		":" +
		now.getMilliseconds()
	);
}

// ================================================ TELNYX COMMANDS API  ================================================
// Call Control - Media Fork Start
function call_control_fork_start(
	f_telnyx_api_auth_v2,
	f_call_control_id,
	f_fork_dest,
	f_rx,
	f_tx
) {
	var l_cc_action = "fork_start";

	var options = {
		url:
			"https://api.telnyx.com/v2/calls/" +
			f_call_control_id +
			"/actions/" +
			l_cc_action,
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
			Authorization: "Bearer " + f_telnyx_api_auth_v2
		},
		json: {
			target: f_fork_dest,
			// rx: f_rx,
			// tx: f_tx
		}
	};

	request.post(options, function(err, resp, body) {
		if (err) {
			return console.log(err);
		}
		console.log(
			"[%s] DEBUG - Command Executed [%s]",
			get_timestamp(),
			l_cc_action
		);
		console.log(body);
		console.log(resp)
	});
}

// Call Control - Media Fork Stop
function call_control_fork_stop(f_telnyx_api_auth_v2, f_call_control_id) {
	console.log("[%s] LOG - Fork Stop!", get_timestamp());
	var l_cc_action = "fork_stop";

	var options = {
		url:
			"https://api.telnyx.com/v2/calls/" +
			f_call_control_id +
			"/actions/" +
			l_cc_action,
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
			Authorization: "Bearer " + f_telnyx_api_auth_v2
		},
		json: {}
	};

	request.post(options, function(err, resp, body) {
		if (err) {
			return console.log(err);
		}
		console.log(
			"[%s] DEBUG - Command Executed [%s]",
			get_timestamp(),
			l_cc_action
		);
		console.log(body);
		
	});
}

// Call Control - Transfer
function call_control_transfer(
	f_telnyx_api_auth_v2,
	f_call_control_id,
	f_dest,
	f_orig
) {
	console.log("[%s] LOG - Transfer!", get_timestamp());
	var l_cc_action = "transfer";

	var options = {
		url:
			"https://api.telnyx.com/v2/calls/" +
			f_call_control_id +
			"/actions/" +
			l_cc_action,
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
			Authorization: "Bearer " + f_telnyx_api_auth_v2
		},
		json: {
			to: f_dest,
			from: f_orig
		}
	};

	request.post(options, function(err, resp, body) {
		if (err) {
			return console.log(err);
		}
		console.log(
			"[%s] DEBUG - Command Executed [%s]",
			get_timestamp(),
			l_cc_action
		);
		console.log(body);
	});
}

// Call Control - Answer Call
function call_control_answer_call(
	f_telnyx_api_auth_v2,
	f_call_control_id,
	f_client_state_s
) {
	console.log("[%s] LOG - Answer!", get_timestamp());
	var l_cc_action = "answer";

	var l_client_state_64 = null;

	if (f_client_state_s)
		l_client_state_64 = Buffer.from(f_client_state_s).toString("base64");

	var options = {
		url:
			"https://api.telnyx.com/v2/calls/" +
			f_call_control_id +
			"/actions/" +
			l_cc_action,
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
			Authorization: "Bearer " + f_telnyx_api_auth_v2
		},

		json: {
			client_state: l_client_state_64 //if inbound call >> null
		}
	};

	request.post(options, function(err, resp, body) {
		if (err) {
			return console.log(err);
		}
		console.log(
			"[%s] DEBUG - Command Executed [%s]",
			get_timestamp(),
			l_cc_action
		);
		console.log(body);
	});
}

// Call Control - Gather Using Speak
function call_control_gather_using_speak(
	f_telnyx_api_auth_v2,
	f_call_control_id,
	f_tts_text,
	f_gather_digits,
	f_gather_max,
	f_client_state_s,
	f_term
) {
	console.log("[%s] LOG - Gather Using Speak!", get_timestamp());
	var l_cc_action = "gather_using_speak";
	var l_client_state_64 = null;

	if (f_client_state_s)
		l_client_state_64 = Buffer.from(f_client_state_s).toString("base64");

	var options = {
		url:
			"https://api.telnyx.com/v2/calls/" +
			f_call_control_id +
			"/actions/" +
			l_cc_action,
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
			Authorization: "Bearer " + f_telnyx_api_auth_v2
		},
		json: {
			payload: f_tts_text,
			voice: g_ivr_voice,
			language: g_ivr_language,
			valid_digits: f_gather_digits,
			max: f_gather_max,
			terminating_digit: f_term,
			client_state: l_client_state_64
		}
	};

	request.post(options, function(err, resp, body) {
		if (err) {
			return console.log(err);
		}
		console.log(
			"[%s] DEBUG - Command Executed [%s]",
			get_timestamp(),
			l_cc_action
		);
		console.log(body);
	});
}

// Call Control - Hangup
function call_control_hangup(f_telnyx_api_auth_v2, f_call_control_id) {
	console.log("[%s] LOG - Hangup!", get_timestamp());

	var l_cc_action = "hangup";

	var options = {
		url:
			"https://api.telnyx.com/v2/calls/" +
			f_call_control_id +
			"/actions/" +
			l_cc_action,
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
			Authorization: "Bearer " + f_telnyx_api_auth_v2
		},

		json: {}
	};

	request.post(options, function(err, resp, body) {
		if (err) {
			return console.log(err);
		}
		console.log(
			"[%s] DEBUG - Command Executed [%s]",
			get_timestamp(),
			l_cc_action
		);
		console.log(body);
	});
}

// ================================================    WEBHOOK API IVR   ================================================

// POST - Receive Number: https://<your_webhook_url>:8081/telnyx-mforking/mforking

rest.get("/", (req, res) => {
	res.send(`<h1>Telnyx APIv2 Media Forking Demo is Running!</h1>`);
});

rest.post("/" + g_appName + "/mforking", function(req, res) {
	// console.log(req.body);
	// console.log(req.body.data.payload.call_control_id);

	if (req && req.body && req.body.data.event_type) {
		var l_hook_event_type = req.body.data.event_type;
		var l_call_control_id = req.body.data.payload.call_control_id;
		var l_client_state_64 = req.body.data.payload.client_state;
	} else {
		console.log("[%s] LOG - Invalid Webhook received!", get_timestamp());
		res.end("0");
	}

	console.log(
		"[%s] LOG - Webhook received - call_control_id [%s]",
		get_timestamp(),
		l_call_control_id
	);
	console.log(
		"[%s] DEBUG - Webhook received - complete payload: %s",
		get_timestamp(),
		JSON.stringify(req.body.data, null, 4)
	);

	// Call Innitiated >> Answer Call
	if (l_hook_event_type == "call.initiated") {
		console.log("initiate");
		if (req.body.data.payload.direction == "incoming") {
			console.log("incoming");
			call_control_answer_call(
				g_telnyx_api_auth_v2,
				l_call_control_id,
				null
			);
		} else
			call_control_answer_call(
				g_telnyx_api_auth_v2,
				l_call_control_id,
				"stage-outgoing"
			);

		res.end();
	} else if (l_hook_event_type == "call.answered") {
		if (!l_client_state_64)
			// No State >> Incoming >> Gather Input
			call_control_gather_using_speak(
				g_telnyx_api_auth_v2,
				l_call_control_id,
				"Welcome to this Telnyx Demo," +
					"Please press 1 to transfer the call and start forking,",
				"0123456789#*",
				"20",
				"stage-dial",
				""
			);

		// State >> Outbound >> Do Nothing

		res.end();

		// Speach Ended >> Do Nothing
	} else if (l_hook_event_type == "speak.ended") {
		res.end();

		// Call Bridged >> Do Nothing
	} else if (l_hook_event_type == "call.bridged") {
		res.end();

		// Gather Ended >> Proccess DTMF Input
	} else if (l_hook_event_type == "call.gather.ended") {
		// Receive DTMF Number
		var l_dtmf_number = req.body.data.payload.digits;

		console.log(
			"[%s] DEBUG - RECEIVED DTMF [%s]",
			get_timestamp(),
			l_dtmf_number
		);

		// Check Current IVR Level

		if (!l_client_state_64) {
			// IVR Lobby
			// do nothing... will have state
		} else {
			// Beyond Lobby Level

			// Set Client State
			var l_client_state_buff = new Buffer(l_client_state_64, "base64");
			var l_client_state_s = l_client_state_buff.toString("ascii");

			// Selected Sales >> Choose Destination
			if (l_client_state_s == "stage-dial" && l_dtmf_number) {
				// Transfer Call
			
				call_control_transfer(
					g_telnyx_api_auth_v2,
					l_call_control_id,
					g_pstn_destination,
					req.body.data.payload.from
				);

				// Start Forking

				// call_control_fork_start(f_call_control_id, f_fork_dest, f_rx, f_tx)
				call_control_fork_start(
					g_telnyx_api_auth_v2,
					l_call_control_id,
					g_udp_dest,
					null,
					null
				);
			}
		}

		res.end();
	}
});

// ================================================ RESTful Server Start ================================================

var server = rest.listen(8081, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log(
		"[%s] SERVER - " + g_appName + " app listening at http://%s:%s",
		get_timestamp(),
		host,
		port
	);
});
