//.  app.js
var express = require( 'express' ),
    cfenv = require( 'cfenv' ),
    multer = require( 'multer' ),
    bodyParser = require( 'body-parser' ),
    fs = require( 'fs' ),
    ejs = require( 'ejs' ),
    ltv3 = require( 'watson-developer-cloud/language-translator/v3' ),
    s2tv1 = require( 'watson-developer-cloud/speech-to-text/v1' ),
    t2sv1 = require( 'watson-developer-cloud/text-to-speech/v1' ),
    settings = require( './settings' ),
    app = express();
var appEnv = cfenv.getAppEnv();

var s2t = t2s = lt = null;
if( settings.s2t_apikey ){
  var s2t_url = ( settings.s2t_url ? settings.s2t_url : 'https://gateway.watsonplatform.net/speech-to-text/api/' );
  s2t = new s2tv1({
    iam_apikey: settings.s2t_apikey,
    version: '2018-05-01',
    url: s2t_url
  });
}
if( settings.t2s_apikey ){
  var t2s_url = ( settings.t2s_url ? settings.t2s_url : 'https://gateway.watsonplatform.net/text-to-speech/api/' );
  t2s = new t2sv1({
    iam_apikey: settings.t2s_apikey,
    version: '2018-05-01',
    url: t2s_url
  });
}
if( settings.lt_apikey ){
  var lt_url = ( settings.lt_url ? settings.lt_url : 'https://gateway.watsonplatform.net/language-translator/api/' );
  lt = new ltv3({
    iam_apikey: settings.lt_apikey,
    version: '2018-05-01',
    url: lt_url
  });
}


app.use( multer( { dest: './tmp/' } ).single( 'data' ) );
app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );
app.use( express.static( __dirname + '/public' ) );

app.set( 'views', __dirname + '/views' );
app.set( 'view engine', 'ejs' );


app.get( '/', function( req, res ){
  res.render( 'index', {} );
});

app.post( '/s2t', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  //. https://www.ibm.com/watson/developercloud/speech-to-text/api/v1/?node#recognize_sessionless_nonmp12
  //. req.file.path に audio/wav
  var filepath = req.file.path;
  var model = req.body.model; //'en-US_BroadbandModel';
  //console.log( 'model = ' + model );

  var params = {
    audio: fs.createReadStream( filepath ),
    content_type: 'audio/wav',
    model: model,
    timestamps: true
  };
  s2t.recognize( params, function( error, result ){
    if( error ){
      console.log( error );
      res.write( JSON.stringify( { status: false, error: error }, 2, null ) );
      res.end();
    }else{
      //console.log( JSON.stringify(result) );
      var transcript = '';
      for( var i = 0; i < result.results.length; i ++ ){
        var r = result.results[i];
        if( r && r.alternatives ){
          var t = result.results[i].alternatives[0].transcript;
          transcript += ( " " + t );
        }
      }
      //console.log( 'transcript=' + transcript );
      res.write( JSON.stringify( { status: true, result: transcript }, 2, null ) );
      res.end();
    }
    fs.unlink( filepath, function(e){} );
  });
});

app.get( '/t2s', function( req, res ){
  //. https://www.ibm.com/watson/developercloud/text-to-speech/api/v1/?node#synthesize_audio
  var text = req.query.text;
  var voice = req.query.voice;

  var params = {
    text: text,
    accept: 'audio/wav',
    voice: voice
  };

  t2s.synthesize( params )
  .on( 'error', function( error ){
    res.write( JSON.stringify( { status: false, error: error }, 2, null ) );
    res.end();
  }).on( 'response', function( response1 ){
    res.writeHead( 200, { 'Content-Type': 'audio/wav' } );
  }).pipe( res );
});

app.get( '/voices', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  t2s.voices( null, function( error, voices ){
    if( error ){
      res.write( JSON.stringify( { status: false, error: error }, 2, null ) );
      res.end();
    }else{
      res.write( JSON.stringify( { status: true, voices: voices }, 2, null ) );
      res.end();
    }
  });
});

app.post( '/translate', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  var text = req.body.text;
  var source = req.body.source;
  var target = req.body.target;

  if( text ){
    if( source == 'en' || target == 'en' ){
      var data = { text: text, source: source, target: target };
      lt.translate( data, function( err, translations ){
        if( err ){
          res.status( 400 );
          res.write( JSON.stringify( { status: false, error: err } ) );
          res.end();
        }else{
          if( translations && translations.translations ){
            res.write( JSON.stringify( { status: true, translations: translations.translations } ) );
            res.end();
          }else{
            res.write( JSON.stringify( { status: true, translations: [] } ) );
            res.end();
          }
        }
      });
    }else{
      var data1 = { text: text, source: source, target: 'en' };
      lt.translate( data1, function( err, translations1 ){
        if( err ){
          res.status( 400 );
          res.write( JSON.stringify( { status: false, error: err } ) );
          res.end();
        }else{
          if( translations1 && translations1.translations && translations1.translations.length > 0 ){
            var data2 = { text: translations1.translations[0].translation, source: 'en', target: target };
            lt.translate( data2, function( err, translations2 ){
              if( err ){
                res.status( 400 );
                res.write( JSON.stringify( { status: false, error: err } ) );
                res.end();
              }else{
                if( translations2 && translations2.translations ){
                  res.write( JSON.stringify( { status: true, translations: translations2.translations } ) );
                  res.end();
                }else{
                  res.write( JSON.stringify( { status: true, translations: [] } ) );
                  res.end();
                }
              }
            });
          }else{
            res.write( JSON.stringify( { status: true, translations: [] } ) );
            res.end();
          }
        }
      });
    }
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'parameter text not found.' } ) );
    res.end();
  }
});

app.post( '/compare', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  var text1 = req.body.text1;
  var text2 = req.body.text2;
  var score = 0.0;

  var t1s = text1.split( ' ' );
  var t2s = text2.split( ' ' );

  //. text1 に使われている単語のどれだけを認識させることができたか？
  var t1_count = 0;
  for( var i = 0; i < t1s.length; i ++ ){
    var t1 = t1s[i];
    if( t1.endsWith( '.' ) || t1.endsWith( '!' ) || t1.endsWith( '?' ) ){
      t1 = t1.substring( 0, t1.length - 1 );
    }
    var b = false;
    for( var j = 0; j < t2s.length && !b; j ++ ){
      var t2 = t2s[j];
      if( t2.endsWith( '.' ) || t2.endsWith( '!' ) || t2.endsWith( '?' ) ){
        t2 = t2.substring( 0, t2.length - 1 );
      }
      b = ( t1.toLowerCase() == t2.toLowerCase() );
    }
    if( b ){
      t1_count ++;
    }
  }
  score = 100.0 * t1_count / t1s.length;

  //. text2 に使われている単語のどれだけが誤認識だったか？
  var t2_count = 0;
  for( var i = 0; i < t2s.length; i ++ ){
    var t2 = t2s[i];
    if( t2.endsWith( '.' ) || t2.endsWith( '!' ) || t2.endsWith( '?' ) ){
      t2 = t2.substring( 0, t2.length - 1 );
    }
    var b = false;
    for( var j = 0; j < t1s.length && !b; j ++ ){
      var t1 = t1s[j];
      if( t1.endsWith( '.' ) || t1.endsWith( '!' ) || t1.endsWith( '?' ) ){
        t1 = t1.substring( 0, t1.length - 1 );
      }
      b = ( t1.toLowerCase() == t2.toLowerCase() );
    }
    if( !b ){
      t2_count ++;
    }
  }
  score -= score * t2_count / t2s.length;

  /*
  console.log( ' t1_count = ' + t1_count );
  console.log( ' t1s.length = ' + t1s.length );
  console.log( ' t1_count/t1s.length = ' + ( t1_count / t1s.length ) );
  console.log( ' t2_count = ' + t2_count );
  console.log( ' t2s.length = ' + t2s.length );
  console.log( ' t2_count/t2s.length = ' + ( t2_count / t2s.length ) );
  console.log( ' score = ' + score );
  */

  res.write( JSON.stringify( { status: true, score: score }, 2, null ) );
  res.end();
});

var port = appEnv.port || 3000;
app.listen( port );
console.log( "server starting on " + port + " ..." );
