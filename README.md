# sensei

## Overview

IBM Watson would be your Language pronounciation **sensei**(teacher).


## How to install

0. Get IBM Cloud account(IBM ID). You can proceed following steps with IBM Cloud Lite account(Free).

    - https://cloud.ibm.com/

    - You also need cf(Cloud Foundry) CLI command from https://github.com/cloudfoundry/cli/releases.

1. Log in to IBM Cloud with your IBM ID, and create following each runtime and instance in **Dallas**(US-SOUTH) region:

    - SDK for Node.js runtime

    - IBM Watson Language-Translator service

    - IBM Watson Speech-to-Text service

    - IBM Watson Text-to-Speech service

2. Bind 3 services(Language-Translator, Speech-to-Text, and Text-to-Speech) into SDK for Node.js runtime.

    - You can omit this step. But in that case, you need to edit settings.js with your IBM Watson services' apikeys.

3. Git clone or download this source code repository.

4. Login to IBM Cloud with cf CLI:

    - `$ cf login -a https://api.ng.bluemix.net/ -u (your IBM ID)`

5. Change directory to code repository, and Push your application with cf CLI:

    - `$ cd (your source code repository)`

    - `$ cf push (your runtime application name)`



## How to use

1. Launch web browser(**FireFox recommended**), and open application page.

    - https://(your runtime application name).mybluemix.net/

2. First, you need to input text **in Japanese** at very top of page.

3. Then you choose translation target language at left, and click down-arrow button to translate. You would see translated text.

4. If you click teacher's image, you can listen voice-spoken translated text in selected language model. You can refer that voice for following speech training.

5. Now it's your turn. You can record your voice while you push(mouse down) microphone image. If you release mouse(mouse up), your voice recording would be finished, and you would see recognized voice text in selected language model.



## Reference

https://cloud.ibm.com/apidocs/language-translator

https://cloud.ibm.com/apidocs/text-to-speech

https://cloud.ibm.com/apidocs/speech-to-text


## Licensing

This code is licensed under MIT.


## Copyright

2019  [K.Kimura @ Juge.Me](https://github.com/dotnsf) all rights reserved.
