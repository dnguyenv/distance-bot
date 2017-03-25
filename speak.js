var ECHO_PIN = 7, TRIG_PIN = 16;

var rpio = require('rpio');
var watson = require('watson-developer-cloud');
var config = require("./config.js")
var devicConfig = require("./device.json");
var exec = require('child_process').exec;
var fs = require('fs');
var text_to_speak = "This is a test";
var iotf = require("ibmiotf");
var statistics = require('math-statistics');
var usonic = require('mmm-usonic');

var text_to_speech = watson.text_to_speech({
    username: config.TTSUsername,
    password: config.TTSPassword,
    version: 'v1'
});

var params = {
    text: text_to_speak,
    voice: config.voice,
    accept: 'audio/wav'
};

var deviceClient = new iotf.IotfDevice(devicConfig);

//setting the log level to trace. By default its 'warn'
deviceClient.log.setLevel('debug');

deviceClient.connect();

deviceClient.on('connect', function(){
    console.log("connected");
});

deviceClient.on('reconnect', function(){

	console.log("Reconnected!!!");
});

deviceClient.on('disconnect', function(){
  console.log('Disconnected from IoTF');
});

deviceClient.on('error', function (argument) {
	console.log(argument);
});

deviceClient.on("command", function (commandName,format,payload,topic) {
    console.log('payload: ', payload, ' and topic: ', topic);
    if(commandName === "blink") {
        console.log(blink);
    } else {
        console.log("Command not supported.. " + commandName);
    }
});

tempStream = text_to_speech.synthesize(params).pipe(fs.createWriteStream('output.wav')).on('close', function() {
    var create_audio = exec('aplay output.wav', function(error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
});


var init = function(config) {
    var sensor = usonic.createSensor(config.echoPin, config.triggerPin, config.timeout);
    //console.log(config);
    var distances;

    (function measure() {
        if (!distances || distances.length === config.rate) {
            if (distances) {
                print(distances);
            }

            distances = [];
        }

        setTimeout(function() {
            distances.push(sensor());

            measure();
        }, config.delay);
    }());
};

var print = function(distances) {
    var distance = statistics.median(distances);

    process.stdout.clearLine();
    process.stdout.cursorTo(0);

    if (distance < 0) {
        process.stdout.write('Error: Measurement timeout.\n');
    } else {
        process.stdout.write('Distance: ' + distance.toFixed(2) + ' cm');
    }
};

init({
    echoPin: 7, //Echo pin
    triggerPin: 16, //Trigger pin
    timeout: 1000, //Measurement timeout in µs
    delay: 60, //Measurement delay in ms
    rate: 5 //Measurements per sample
});
