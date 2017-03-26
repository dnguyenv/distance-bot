// You can change the voice of the robot to your favorite voice.
exports.voice = 'en-US_AllisonVoice';
// Some of the available options are:
// en-US_AllisonVoice
// en-US_LisaVoice
// en-US_MichaelVoice (the default)

//Credentials for Watson Text to Speech service
exports.TTSPassword = 'xxxxxxxxxx' ;
exports.TTSUsername = 'xxxxxxxxxx' ;

// Configuration for SC-SR04 sensor
exports.Sensor = {
    echoPin: 24,
    triggerPin: 23,
    timeout: 750,
    delay: 60,
    rate: 5
};
// Text to speak out.
exports.TextToSpeak = "Wow, you are too close to me, I need some privacy please!";
