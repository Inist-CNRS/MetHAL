# MetHAL


Enrichissement de chaque EC par une requête vers HAL pour récupérer les métadonnées de l'article. 

  guide d'utilisation :

  pour installer ce module lancer la commande a la racine de votre projet

  npm i -save methal

  ensuite au sein de votre code ajouter ces lignes
  
```js
  var MetHal = require('methal');


  MetHal.MetHAL('japon' , function (err , res) {
    console.log(res);
  });
```