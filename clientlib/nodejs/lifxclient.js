/*
 * This example program connects to already paired buttons and register event listeners on button events.
 * Run the newscanwizard.js program to add buttons.
 */


var fliclib = require("./fliclibNodeJs");
var FlicClient = fliclib.FlicClient;
var FlicConnectionChannel = fliclib.FlicConnectionChannel;
var FlicScanner = fliclib.FlicScanner;

var client = new FlicClient("localhost", 5551);

var LifxClient = require('node-lifx').Client;
var lifxClient = new LifxClient();

function listenToButton(bdAddr) {
	var cc = new FlicConnectionChannel(bdAddr);
	client.addConnectionChannel(cc);
	cc.on("buttonSingleOrDoubleClickOrHold", function(clickType, wasQueued, timeDiff) {
	        switch (bdAddr) {
                  case '80:e4:da:71:c9:55': // Kitchen Flic
                    console.log("Kitchen " + clickType + " " + (wasQueued ? "wasQueued" : "notQueued") + " " + timeDiff + " seconds ago");
										var light = lifxClient.light('Kitchen Back');
										if (clickType == 'ButtonSingleClick') {
											light.getPower(function(error,data) {
												if (data == 0) {
													light.on(1000);
													lifxClient.light('Kitchen Front').on(1000);
												}
												else {
													light.off(1000);
													lifxClient.light('Kitchen Front').off(1000);
												}
											});
										}
										break;
                  case '80:e4:da:71:a1:bd': // Playroom Flic
                    console.log("Playroom " + clickType + " " + (wasQueued ? "wasQueued" : "notQueued") + " " + timeDiff + " seconds ago");
                    var light = lifxClient.light('Playroom');
										if (clickType == 'ButtonSingleClick') {
											light.color(Math.floor(Math.random() * 361), 80, 70, 3500, 1000);
											light.getPower(function(error,data) {
												if (data == 0) {
													light.on();
												}
											});
										}
                    if (clickType == 'ButtonDoubleClick') {
											light.getState(function(error,data) {
												if (data.color.kelvin == 3000) {
													light.getPower(function(error,data) {
														if (data == 0) {
															light.on();
														}
														else {
															light.off();
														}
													});
												}
												else {
													light.color(0,0, 70, 3000, 1000);
												}
											});
                    }
                    break;
                  case '80:e4:da:71:af:e5': // Upstairs Flic
                    console.log("Upstairs " + clickType + " " + (wasQueued ? "wasQueued" : "notQueued") + " " + timeDiff + " seconds ago");
										if (clickType == 'ButtonSingleClick') {
											var light = lifxClient.light('Upstairs Landing');
											light.getPower(function(error,data) {
											  if (data == 0) {
													light.on(1000);
												}
												else {
													light.off(1000);
												}
											});
										}
										if (clickType == 'ButtonHold') {
											var light = lifxClient.light('Kitchen Back');
											light.getPower(function(error,data) {
												if (data == 0) {
													light.on(1000);
													lifxClient.light('Kitchen Front').on(1000);
													lifxClient.light('Living Room Stand Back').on(1000);
													lifxClient.light('Living Room Stand Front').on(1000);
												}
												else {
													light.off(1000);
													lifxClient.light('Kitchen Front').off(1000);
													lifxClient.light('Living Room Stand Back').off(1000);
													lifxClient.light('Living Room Stand Front').off(1000);
												}
											});
										}
                    break;
                  default:
                    console.log("Unknown " + clickType + " " + (wasQueued ? "wasQueued" : "notQueued") + " " + timeDiff + " seconds ago");

                }
        });
	cc.on("connectionStatusChanged", function(connectionStatus, disconnectReason) {
		//console.log(bdAddr + " " + connectionStatus + (connectionStatus == "Disconnected" ? " " + disconnectReason : ""));
	});
}

client.once("ready", function() {
	console.log("Connected to daemon!");
	client.getInfo(function(info) {
		info.bdAddrOfVerifiedButtons.forEach(function(bdAddr) {
			listenToButton(bdAddr);
		});
	});
});

client.on("bluetoothControllerStateChange", function(state) {
	console.log("Bluetooth controller state change: " + state);
});

client.on("newVerifiedButton", function(bdAddr) {
	console.log("A new button was added: " + bdAddr);
	listenToButton(bdAddr);
});

client.on("error", function(error) {
	console.log("Daemon connection error: " + error);
});

client.on("close", function(hadError) {
	console.log("Connection to daemon is now closed");
});

lifxClient.on('listening', function() {
  var address = lifxClient.address();
  console.log(
    'Started LIFX listening on ' +
    address.address + ':' + address.port + '\n'
  );
});

lifxClient.init();
