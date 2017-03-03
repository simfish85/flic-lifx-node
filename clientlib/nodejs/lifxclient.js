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
										if (clickType == 'ButtonSingleClick') {
											var light = lifxClient.light('Kitchen Back');
											if (light) {
												light.getPower(function(error,data) {
													if (data == 0) {
														light.on(1000);
														light = lifxClient.light('Kitchen Front');
														if (light) {
															light.on(1000);
														}
														else {
															console.log("Kitchen Front could not be found");
														}
													}
													else {
														light.off(1000);
														light = lifxClient.light('Kitchen Front');
														if (light) {
															light.off(1000);
														}
														else {
															console.log("Kitchen Front could not be found");
														}
													}
												});
											}
											else {
												console.log("Kitchen Back could not be found");
											}
										}
										if (clickType == 'ButtonHold') {
											var light = lifxClient.light('Garage');
											if (light) {
												light.getPower(function(error,data) {
													if (data == 0) {
														light.on(1000);
													}
													else {
														light.off(1000);
													}
												});
											}
											else {
												console.log("Garage could not be found");
											}
										}
										break;
                  case '80:e4:da:71:a1:bd': // Playroom Flic
                    console.log("Playroom " + clickType + " " + (wasQueued ? "wasQueued" : "notQueued") + " " + timeDiff + " seconds ago");
                    var light = lifxClient.light('Playroom');
										if (light) {
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
													if (data) {
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
													}
													else {
														console.log("Data not available in playroom");
													}
												});
	                    }
										}
										else {
											console.log("Playroom could not be found");
										}
                    break;
                  case '80:e4:da:71:af:e5': // Upstairs Flic
                    console.log("Upstairs " + clickType + " " + (wasQueued ? "wasQueued" : "notQueued") + " " + timeDiff + " seconds ago");
										if (clickType == 'ButtonSingleClick') {
											var light = lifxClient.light('Upstairs Landing');
											if (light) {
												light.getPower(function(error,data) {
												  if (data == 0) {
														light.on(1000);
													}
													else {
														light.off(1000);
													}
												});
											}
											else {
												console.log("Upstairs Landing could not be found");
											}
										}
										if (clickType == 'ButtonHold') {
											var light = lifxClient.light('Kitchen Back');
											if (light) {
												light.getPower(function(error,data) {
													if (data == 0) {
														light.on(1000);
														light = lifxClient.light('Kitchen Front');
														if (light) {
															light.on(1000);
														}
														else {
															console.log("Kitchen Front could not be found");
														}
														light = lifxClient.light('Living Room Stand Back');
														if (light) {
															light.on(1000);
														}
														else {
															console.log("Living Room Stand Back could not be found");
														}
														light = lifxClient.light('Living Room Stand Front');
														if (light) {
															light.on(1000);
														}
														else {
															console.log("Living Room Stand Front could not be found");
														}
													}
													else {
														light.off(1000);
														light = lifxClient.light('Kitchen Front');
														if (light) {
															light.off(1000);
														}
														else {
															console.log("Kitchen Front could not be found");
														}
														light = lifxClient.light('Living Room Stand Back');
														if (light) {
															light.off(1000);
														}
														else {
															console.log("Living Room Stand Back could not be found");
														}
														light = lifxClient.light('Living Room Stand Front');
														if (light) {
															light.off(1000);
														}
														else {
															console.log("Living Room Stand Front could not be found");
														}
													}
												});
											}
											else {
												console.log("Kitchen Back could not be found");
											}
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
