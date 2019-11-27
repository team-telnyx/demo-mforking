# Call Control Media Forking
The [Call Control framework](https://developers.telnyx.com/docs/api/v2/call-control) is a set of REST APIs that allow you to control the complete call flow from the moment a call comes in (or out) to the moment you terminate that call. In between you will receive a number of [webhooks](https://developers.telnyx.com/docs/v2/call-control/receiving-webhooks) for each step of the call, to which you answer with a [command](https://developers.telnyx.com/docs/v2/call-control/sending-commands) of your need. It's this back and forward communication that makes Call Control so great in terms of the granular control you have for your call.

Among the options you have for Call Control, is [Media Forking and Control](https://telnyx.com/products/media-forking-control). An excellent use case for this product can be found in our [Replicant Case Study](https://telnyx.com/resources/replicant-case-study). 



## Media Forking Webhooks and Commands
The same way for any other Call Control framework, Media Forking also works based on HTTP webhooks and REST commands back and forward. The Call Control Media Forking framework allows realtime media duplication. Call media is forked instantly, the moment the call is established. Media Forking in Call Control applies specifically to the Call Control Commands:

- [Forking Start](https://developers.telnyx.com/docs/api/v2/call-control/Call-Commands#CallControlForkStart)
- [Forking End](https://developers.telnyx.com/docs/api/v2/call-control/Call-Commands#CallControlForkStop)


Those commands will make Telnyx to take the actions described above and some will trigger the following webhooks:

- call.fork.started
- call.fork.stopped


## Starting Media Forks

When you create a Conference Room with Call Control you will obviously keep receiving regular Call Control Webhooks that are non-Conference related. It is by mixing regular Call Control webhooks and commands with Call Control Conference webhooks and commands that you create your application logic.

For the purpose of this guide we are using simple node.js that would have the Fork Start command defined as follows:

```js
function call_control_fork_start(
	f_telnyx_api_auth_v2,
	f_call_control_id,
	f_fork_dest,
	f_rx,
	f_tx
) {
	var cc_action = "fork_start";

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
			rx: f_rx,
			tx: f_tx
		}
	};

	request.post(options, function(err, resp, body) {
		if (err) {
			return console.log(err);
		}
		console.log(
			"[%s] DEBUG - Command Executed [%s]",
			get_timestamp(),
			cc_action
		);
		console.log(body);
	});
}
```
Where `f_telnyx_api_auth_v2` is the API V2 token being used for authentication, `f_call_control_id` is the Call Control Id from the call leg I want to use to begin forking. There are three options for the destination, and thus methodology in which your media stream is forked. They will be specified form-data header. This example utilizing json instead of form or data.

  - `f_fork_dest` is where the call's RTP media packets should be forwarded, both the inbound and outbound media.
  - `f_rx` destination forking only the incoming media
  - `f_tx` destination forking only the outgoing media
.


```js

// Gather Ended >> Proccess DTMF Input
	} else if (l_hook_event_type == "gather.ended") {
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
```

If the previous command succeeds Telnyx will be sending a `gather.ended` webhook after any digit is pressed, satisfying input required to start forking media. This can be even simpler in a production application, by invoking the `call_control_fork_start` function when the call is answered.


## Complete Media Forking App

To help you understand the concepts we just walk you through, we build two `node.js` applications in both Call Control V1 and V2 versions of the API.

We invite you to have a deeper look in order to see the differences and step-by-step instructions:

1. [Media Forking Demo in API v1](https://github.com/team-telnyx/demo-mforking/tree/master/api-v1)
2. [Media Forking Demo in API v2](https://github.com/team-telnyx/demo-mforking/tree/master/api-v2)
