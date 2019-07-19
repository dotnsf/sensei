//. settings.js
exports.s2t_apikey = '';
exports.s2t_url = 'https://stream.watsonplatform.net/speech-to-text/api';
exports.t2s_apikey = '';
exports.t2s_url = 'https://stream.watsonplatform.net/text-to-speech/api';
exports.lt_apikey = '';
exports.lt_url = 'https://gateway.watsonplatform.net/language-translator/api';

if( process.env.VCAP_SERVICES ){
  var VCAP_SERVICES = JSON.parse( process.env.VCAP_SERVICES );
  if( VCAP_SERVICES && VCAP_SERVICES.text_to_speech ){
    exports.t2s_apikey = VCAP_SERVICES.text_to_speech[0].credentials.apikey;
    exports.t2s_url = VCAP_SERVICES.text_to_speech[0].credentials.url;
  }
  if( VCAP_SERVICES && VCAP_SERVICES.speech_to_text ){
    exports.s2t_apikey = VCAP_SERVICES.speech_to_text[0].credentials.apikey;
    exports.s2t_url = VCAP_SERVICES.speech_to_text[0].credentials.url;
  }
  if( VCAP_SERVICES && VCAP_SERVICES.language_translator ){
    exports.lt_apikey = VCAP_SERVICES.language_translator[0].credentials.apikey;
    exports.lt_url = VCAP_SERVICES.language_translator[0].credentials.url;
  }
}
