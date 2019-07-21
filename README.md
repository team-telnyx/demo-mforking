# Telnyx Media Forking Demo
Telnyx Media Forking demo built on Call Control and node.js.


In this tutorial, you’ll learn how to:

1. Set up your development environment to use Telnyx Call Control using Node.
2. Build a simple Telnyx Call Control IVR that makes use of Media Forking using Node.
3. Receive forked UDP/RTP packets in a remote linux machine.


---

- [Prerequisites](#prerequisites)
- [Telnyx Call Control Basics](#telnyx-call-control-basics)
  - [Understanding the Command Syntax](#understanding-the-command-syntax)
  - [Telnyx Call Control Commands](#telnyx-call-control-commands)
  - [Using file generators](#using-generators)
  - [Adding examples for a new language](#adding-examples-for-a-new-language)
- [Building an IVR that uses Media Forking](#building-an-ivr-that-uses-media-forking)
- [Lightning-Up the Application](#lightning-up-the-application)
- [Listening for UDP](#listening-for-udp)


---

## Prerequisites

Before you get started, you’ll need to complete these steps:

1. Have a Telnyx account, that you can create here 
2. Buy a Telnyx number on Mission Portal, that you can learn how to do here
3. Create a new Connection as Call Control on Mission Portal, that you can learn how to do here.
4. You’ll need to have `node` installed to continue. You can check this by running the following:

```shell
$ node -v
```

If Node isn’t installed, follow the [official installation instructions](https://nodejs.org/en/download/) for your operating system to install it.

You’ll need to have the following Node dependencies installed for the Call Control API:

```js
require(express);
require(request);
```

You’ll need to have tcpdump installed on the remote Linux machine that will receive the forked media. You can check this by running the following:

```shell
$ tcpdump --v
```

If tcpdump isn’t installed, follow the [official installation instructions](https://www.tcpdump.org/index.html) for your operating system to install it.



## Telnyx Call Control Basics

For the Call Control application you’ll need to get a set of basic functions to perform Telnyx Call Control Commands. This tutorial will be using the following subset of Telnyx Call Control Commands:

- [Call Control Forking Start](https://developers.telnyx.com/docs/api/v1/call-control/Call-Commands#CallControlForkStart)
- [Call Control Transfer](https://developers.telnyx.com/docs/api/v1/call-control/Call-Commands#CallControlTransfer)
- [Call Control Answer](https://developers.telnyx.com/docs/api/v1/call-control/Call-Commands#CallControlAnswer)
- [Call Control Gather Using Speak](https://developers.telnyx.com/docs/api/v1/call-control/Call-Commands#CallControlSpeak)
- [Call Control Hangup](https://developers.telnyx.com/docs/api/v1/call-control/Call-Commands#CallControlHangup)

You can get the full set of available Telnyx Call Control Commands [here](https://developers.telnyx.com/docs/api/v1/overview).

For each Telnyx Call Control Command we will be creating a function that will execute an `HTTP POST` Request to back to Telnyx server.  To execute this API we are using Node `request`, so make sure you have it installed. If not you can install it with the following command:

```shell
$ npm install request --save
```

After that you’ll be able to use ‘request’ as part of your app code as follows:

```js
var request = require('request');
```

To make use of the Telnyx Call Control Command API you’ll need to set a Telnyx API Key and Secret. 

To check that go to Mission Control Portal and under the `Auth` tab you select `Auth V2`.

Once you have them, you can include it as ‘const’ variable in your code:

```js
const g_telnyx_key        = "dfb642e0-558d-47b1-b9da-7b84cdcf0c9a"
const g_telnyx_secret     = "6ow9hnixSPirLvgwWPbcda"
```

Once all dependencies are set, we can create a function for each Telnyx Call Control Command. All Commands will follow the same syntax:

```js

function call_control_COMMAND_NAME(f_call_control_id, f_INPUT1, ...){
    
    var cc_action = ‘COMMAND_NAME’

    var options = {
        url: 'https://api.telnyx.com/calls/' 
                +  f_call_control_id 
                + '/actions/' 
                + cc_action,
        auth: {
            username: g_telnyx_key,
            password: g_telnyx_secret
        },
        form: {
           PARAM1:  f_INPUT-1,
             ...
        } 
    };

    request.post(options,function(err,resp,body){
        if (err) { return console.log(err); }
    });  
}  
```

### Understanding the Command Syntax

There are several aspects of this function that deserve some attention:

- `Function Input Parameters`: to execute every Telnyx Call Control Command you’ll need to feed your function with the following: the `Call Control ID`; and the input parameters, specific to the body of the Command you’re executing. Having these set as function input parameters will make it generic enough to reuse in different use cases:

```js
function call_control_COMMAND_NAME(f_call_control_id, f_INPUT)
```

All Telnyx Call Control Commands will be expecting the `Call Control ID` except `Dial`. There you’ll get a new one for the leg generated as response.

- `Name of the Call Control Command`: as detailed [here](https://developers.telnyx.com/docs/api/v1/overview), the Command name is part of the API URL. In our code we call that the `action` name, and will feed the POST Request URL later:

```js
var cc_action = ‘COMMAND_NAME’
```

- `Building the Telnyx Call Control Command`: once you have the Command name defined, you should have all the necessary info to build the complete Telnyx Call Control Command:


```js
var options = {
    url: 'https://api.telnyx.com/calls/' 
            +  f_call_control_id 
            + '/actions/' 
            + cc_action,
    auth: {
        username: g_telnyx_key,
        password: g_telnyx_secret
    },
    form: {
        PARAM:  f_INPUT, 
    } 
};
```

In this example you can see that `Call Control ID` and the Action name will feed the URL of the API, both Telnyx Key and Telnyx Secret feed the Authentication headers, and the body will be formed with all the different input parameters  received for that specific Command. 


- `Calling the Telnyx Call Control Command`: Having the request  `headers` and `options`/`body` set, the only thing left is to execute the `POST Request` to execute the command. 

For that we are using making use of the node's `request` module:

```js
 request.post(options,function(err,resp,body){
    if (err) { return console.log(err); }
});  
```

### Telnyx Call Control Commands

This is how every Telnyx Call Control Command used in this application would look like:

#### Call Control Forking Start

```js
function call_control_fork_start(f_call_control_id, f_fork_target, f_fork_rx, f_fork_tx) {

    var cc_action = 'fork_start';

    var options = null;

    if (!f_fork_target && f_fork_rx && f_fork_tx) {
        options = {
            url: 'https://api.telnyx.com/calls/' +
                f_call_control_id +
                '/actions/' +
                cc_action,
            auth: {
                username: g_telnyx_key,
                password: g_telnyx_secret
            },
            form: {
                rx: f_fork_rx,
                tx: f_fork_tx
            }
        };
    } else if (f_fork_target && !f_fork_rx && !f_fork_tx) {
        options = {
            url: 'https://api.telnyx.com/calls/' +
                f_call_control_id +
                '/actions/' +
                cc_action,
            auth: {
                username: g_telnyx_key,
                password: g_telnyx_secret
            },
            form: {
                target: f_fork_target
            }
        };

    };

        request.post(options,function(err,resp,body){
            if (err) { return console.log(err); }
    });
}
```

#### Call Control Transfer

```js
function call_control_transfer(f_call_control_id, f_dest, f_orig) {

    var cc_action = 'transfer'

    var options = {
        url: 'https://api.telnyx.com/calls/' +
            f_call_control_id +
            '/actions/' +
            cc_action,
        auth: {
            username: g_telnyx_key,
            password: g_telnyx_secret
        },
        form: {
            to: f_dest,
            from: f_orig,
        }
    };

    request.post(options, function (err, resp, body) {
        if (err) {
            return console.log(err);
        }
    });
}
```

#### Call Control Answer

```js
function call_control_answer_call(f_call_control_id, f_client_state_s) {

    var l_cc_action = 'answer';

    var l_client_state_64 = null;

    if (f_client_state_s)
        l_client_state_64 = Buffer.from(f_client_state_s).toString('base64');


    var options = {
        url: 'https://api.telnyx.com/calls/' +
            f_call_control_id +
            '/actions/' +
            l_cc_action,

        auth: {
            username: g_telnyx_key,
            password: g_telnyx_secret
        },

        form: {
            client_state: l_client_state_64 //if inbound call >> null
        }
    };

    request.post(options, function (err, resp, body) {
        if (err) {
            return console.log(err);
        }
    });
}
```

#### Call Control Gather Using Speak

```js
function call_control_gather_using_speak(f_call_control_id, f_tts_text, f_gather_digits, f_gather_max, f_client_state_s, f_term) {

    var l_cc_action = 'gather_using_speak';
    var l_client_state_64 = null;

    if (f_client_state_s)
        l_client_state_64 = Buffer.from(f_client_state_s).toString('base64');

    var options = {
        url: 'https://api.telnyx.com/calls/' +
            f_call_control_id +
            '/actions/' +
            l_cc_action,
        auth: {
            username: g_telnyx_key,
            password: g_telnyx_secret
        },
        form: {
            payload: f_tts_text,
            voice: g_ivr_voice,
            language: g_ivr_language,
            valid_digits: f_gather_digits,
            max: f_gather_max,
            terminating_digit: f_term,
            client_state: l_client_state_64
        }
    };

    request.post(options, function (err, resp, body) {
        if (err) {
            return console.log(err);
        }
    });
}
```

#### Call Control Hangup

```js
function call_control_hangup(f_call_control_id) {

    var l_cc_action = 'hangup';

    var options = {
        url: 'https://api.telnyx.com/calls/' +
            f_call_control_id +
            '/actions/' +
            l_cc_action,

        auth: {
            username: g_telnyx_key,
            password: g_telnyx_secret
        },

        form: {}
    };

    request.post(options, function (err, resp, body) {
        if (err) {
            return console.log(err);
        }
    });
}
```

`Client State`: within some of the Telnyx Call Control Commands list we presented, you probably noticed we were including the `Client State` parameter. `Client State` is the key to ensure that we can have several levels on our IVR while consuming the same Call Control Events. 

Because Call Control is stateless and async your application will be receiving several events of the same type, e.g. user just included `DTMF`. With `Client State` you enforce a unique ID to be sent back to Telnyx which be used within a particular Command flow and identifying it as being at Level 2 of a certain IVR for example.


## Building an IVR that uses Media Forking

With all the basic Telnyx Call Control Commands set, we are ready to put them in the order that will create a simple IVR application. The main purpose of this tutorial is to demonstrate how to utilize Media Forking. For that all we are going to do is to: 

1. handle an incoming call
2. greet and invite the calling party to press 1 to start the process
3. redirect the call to a PSTN number and in parallel start forking the media to a destination at our choice.


![Bilby Stampede](https://github.com/team-telnyx/demo-mforking/raw/master/mforking-ivr.png)

To exemplify this process we created a simple API call that will be exposed as the webhook in Mission Portal. For that we would be using `express`:

```shell
$ npm install request --save
```

With `express` we can create an API wrapper that uses `HTTP GET` to call our Request Token method:

```js
rest.post('/'+g_appName+'/mforking', function (req, res) {
  // IVR CODE GOES HERE  
})
```

This would expose a webhook like the following: 

    https://MY_DOMAIN_URL/telnyx-mforking/mforking

You probably noticed that `g_appName` in  the previous point. That is part of a set of global variables we are defining with a certain set of info we know we are going to use in this app: TTS parameters, like voice and language to be used, IVR redirecting contact points, and the Media Forking destination address. 

You can set these at the beginning of your code:

```js
// Application:
const g_appName = "telnyx-mforking";

// TTS Options
const g_ivr_voice     = 'female';
const g_ivr_language  = 'en-US';

// IVR Redirect Options
const g_pstn_phone     = '+10987654320;

// Forking Destination Options
const g_udp_target = 'udp:192.1.1.1:27000';
const g_udp_tx     = 'udp:192.1.1.1:27001';
const g_udp_rx     = 'udp:192.1.1.1:27002';
```

With that set, we can fill in that space that we named as `IVR CODE GOES HERE`. So as you expose the URL created as Webhook in Mission Control associated with your number, you’ll start receiving all call events for that call. 

So the first thing to be done is to identify the kind of event you just received and extract the `Call Control Id` and `Client State` (if defined previously):

```js
if (req && req.body && req.body.event_type){
    var l_hook_event_type = req.body.event_type;
    var l_call_control_id = req.body.payload.call_control_id;
    var l_client_state_64 = req.body.payload.client_state;
} else{res.end('0');}
```

Once you identify the `Event Type` received, it’s just a matter of having your application reacting to that. Is the way you react to that Event that helps you creating the IVR logic. What you would be doing is to execute Telnyx Call Control Command as a reaction to those Events.

### `Webhook Call Initiated >> Command Answer Call`

```js
if (l_hook_event_type =='call_initiated') {
    if (req.body.payload.direction == 'incoming')
        call_control_answer_call(l_call_control_id, null);
    else
     call_control_answer_call(l_call_control_id,'stage-outgoing');
    res.end();   
}
```

### `Webhook Call Answered >> Command Gather Using Speak`

Once your app is notified by Telnyx that the call was established you want to initiate your IVR. You do that using the Telnyx Call Control Command `Gather Using Speak`, with the IVR Lobby message.

As part of the `Gather Using Speak` Command we indicate that valid digits for the `DTMF` collection are 1 and 2, and that only 1 digit input would be valid. At this point we will also set the `client-state` as `stage-dial`.

```js
else if (l_hook_event_type=='call_answered'){  
    if (!l_client_state_64)
        // No State >> Incoming >> Gather Input
        call_control_gather_using_speak(l_call_control_id,
            'Welcome to this Telnyx Demo,' +
            'Please press 1 to transfer 
                     the call and start forking,',
            '1', '1', 'stage-dial', '');
    res.end();
}
```

### `Webhook Speak Ended >> Do Nothing`
Your app will be informed that the Speak executed ended at some point. For the IVR we are doing nothing with that info, but we will need to reply to that command. 

```js
else if (l_hook_event_type =='speak_ended'){
 res.end();
}
```

*Important Note: For consistency Telnyx Call Control engine requires every single Webhook to be replied by the Webhook end-point, otherwise will keep trying. For that reason we have to be ready to consume every Webhook we expect to receive and reply with 200 OK.*

### `Webhook Call Bridged >> Do Nothing`
Your app will be informed that the call was bridged at some point. For the IVR we are doing nothing with that info, but we will need to reply to that command. 


```js
else if (l_hook_event_type == call_bridged){
 res.end();
}
```

### `Webhook Gather Ended >> IVR Logic`
It’s when you receive the Webhook informing your application that Call Control `Gather Ended` (DTMF input) that we can create the redirection and forking logic:


```js
else if (l_hook_event_type =='gather_ended'){
   // Receive DTMF Number
    var l_dtmf_number = req.body.payload.digits;

    // Set Client State 
    var l_client_state_buff = new Buffer(l_client_state_64,'base64');
    var l_client_state_s = l_client_state_buff.toString('ascii');

    if (l_client_state_s == "stage-dial" && l_dtmf_number == 1) {

        // Transfer Call
        call_control_transfer(l_call_control_id, 
                              g_pstn_phone, 
                              req.body.payload.from);

        // Start Forking
        call_control_fork_start(l_call_control_id, 
                                g_udp_target, 
                                null, 
                                null);
    }
    res.end();
}
```

Here we make a very simple check for `DTMF` digits received and the `client-state` value. If it’s the same we set previously (`stage-dial`) and the tone received was ‘1’, then we proceed to the logic execution. 

In the logic execution we are using Call Control `Transfer` to transfer the call to the `PSTN` phone number hardcoded at the beginning of the code.

At the same time (because both the code and Call Control are async) we are starting the Media Forking using Call Control `Fork Start`. For Media Forking to start we need to specify the destination for the media. 

Consulting the Call Control `Media Forking` [documentation page](https://developers.telnyx.com/docs/api/v1/call-control/Call-Commands#CallControlForkStart) will give you more information about the three main parameters that can be used depending on the way we want to stream the media:

- if the intention is to stream both inbound and outbound legs of the call - in this case the A and B legs of the call - to the same destination point, you will then use `target` in the body. To use `target` we are calling the global `g_udp_target` variable that includes both ip and port destination for receiving the data. If we use `target` we cannot specify the `rx` and `tx` attributes, hence specifying them `null` as the example above states. 

- if the intention is to stream inbound and outbound legs of the call to different `IP:Port` tuples, in case you would like to digest each leg separately or analyse one of the legs only, then you will not use `target` but the attributes `rx` and `tx` instead. For that case you will not formulate the `call_control_fork_start` function as above but as follows instead:
```js
call_control_fork_start(l_call_control_id, 
                        null, 
                        g_udp_rx, 
                        g_udp_tx);
```
Both `g_udp_rx` and `g_udp_tx` are two global variables also specified at the beginning of this code, having different destination ports so we can differentiate both traffic’s legs.

*NOTE: If the destination for forked media is specified using the `target` attribute, the RTP will be encapsulated in an extra header, which adds a 24 byte header to each packet payload.*


## Lightning-Up the Application
Finally the last piece of the puzzle is having your application listening for Telnyx Webhooks:

```js
var server = rest.listen(8081, function () {
  var host = server.address().address
  var port = server.address().port
})
```

And start the application by executing the following command:

```shell
$ node telnyx-mforking.js
```

## Listening for UDP

The easiest way to confirm that your media stream is being sent is to have a tcpdump capturing incoming UDP traffic for the destination IP and Ports designated for that. 

There are several ways to do that, but in this tutorial we executed the following command:  

```shell
$ tcpdump -i INTERFACE udp portrange 27000-27010 -w mforking.pcap
```

This command would  listen for UDP packets within the port range `27000-27002` (the ones we use in this tutorial). Please be sure to replace `INTERFACE` by the interface that is exposed to the traffic. Once stopped, you would get all packets collected in a `pcap` file that you can analyse using a packet analyser application such as Wireshark.



