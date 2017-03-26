var watson = require('watson-developer-cloud');
var config = require("./config.js")
var exec = require('child_process').exec;
var fs = require('fs');
var statistics = require('math-statistics');
var usonic = require('mmm-usonic');

/* Convert input text to speech using IBM Watson text to speech service */
var speak = function(text){
    var params = {
        text: text,
        voice: config.voice,
        accept: 'audio/wav'
    };
    var text_to_speech = watson.text_to_speech({
        username: config.TTSUsername,
        password: config.TTSPassword,
        version: 'v1'
    });

    /* Streaming the resulting audio to file and play the file using aplay */

    text_to_speech.synthesize(params).pipe(fs.createWriteStream('output.wav')).on('close', function() {
        var create_audio = exec('aplay output.wav', function(error, stdout, stderr) {
            if (error !== null) {
                console.log('Error occurred while playing back: ' + error);
            }
        });
    });
}

var processDistance = function(distances) {
    var distance = statistics.median(distances);

    process.stdout.clearLine();
    process.stdout.cursorTo(0);

    if (distance < 0) {
        process.stdout.write('Somthing wrong with measurement ...\n');
    } else {
        process.stdout.write('Distance: ' + distance.toFixed(2) + ' cm');
        var privacy = distance.toFixed(2);
        /*Speak up if the distance to the clear by object is less than 10 cm */
        if (privacy < 10.00){
          speak(config.TextToSpeak);
        }
    }
};
/* Initiate the sensor and do the measurement in every config.delay*/
var startMeasuring = function(config) {
    var sensor = usonic.createSensor(config.echoPin, config.triggerPin, config.timeout);
    console.log('Config: ' + JSON.stringify(config));
    var distances;
    (function measure() {
        /* Refresh the distances array if enough distances are added in */
        if (!distances || distances.length === config.rate) {
            if (distances) processDistance(distances);
            distances = [];
        };
        /* Execute the measurement every config.delay ms*/
        setTimeout(function() {
            distances.push(sensor());
            measure();
        }, config.delay);
    }());
};

/* Main entry point */
usonic.init(function(error) {
    if (error) {
        console.log(error);
    } else {
        startMeasuring(config.Sensor);
    }
});
