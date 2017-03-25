var ECHO_PIN = 24,
    TRIG_PIN = 23;

var watson = require('watson-developer-cloud');
var config = require("./config.js")
var exec = require('child_process').exec;
var fs = require('fs');
var text_to_speak = "This is a test";
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

/*
tempStream = text_to_speech.synthesize(params).pipe(fs.createWriteStream('output.wav')).on('close', function() {
    var create_audio = exec('aplay output.wav', function(error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
});*/




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

var initSensor = function(config) {
    var sensor = usonic.createSensor(config.echoPin, config.triggerPin, config.timeout);

    console.log('Config: ' + JSON.stringify(config));

    var distances;

    (function measure() {
        if (!distances || distances.length === config.rate) {
            if (distances) {
                print(distances);
            }else{
              console.log('Khong co distance');
            }

            distances = [];
        }

        setTimeout(function() {
            console.log('vao setTimeout: ', distances.length);
            distances.push(sensor());
            measure();
        }, config.delay);
    }());
};

usonic.init(function(error) {
    if (error) {
        console.log(error);
    } else {
        initSensor({
            echoPin: ECHO_PIN,
            triggerPin: TRIG_PIN,
            timeout: 750,
            delay: 60,
            rate: 5
        });
    }
});
