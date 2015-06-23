# MetHAL


Enrichissement de chaque EC par une requête vers HAL pour récupérer les métadonnées de l'article. 

  guide d'utilisation :

  pour installer ce module lancer la commande a la racine de votre projet

  ==>$ npm i -save methal

  ensuite au sein de votre code ajouter ces lignes

```js
  var MetHal = require('methal');
```

exemple de recherche avec  la propriété docid 
```js
MetHal.MetHAL('docid:"19"' , function (err , res) {
	console.log(res.response.docs);
});
```
valeur de retour les métadonnées associées à cette propriété.


lien vers github
https://github.com/aloukili/MetHAL

lien vers l'instance npm
https://www.npmjs.com/package/methal