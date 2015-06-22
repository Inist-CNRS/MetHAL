"use strict";
// objet de retour dans la focntion qui contient les resultats obtenu
// depuis la requête vers l'api hal
var info = {};
//déclaration de le fonciton MetHAL qu'elle va être exporte, elle prend en 1er argument 
// la valeur de la recherche dans la requête et en 2éme arguement une fonction collback avec la 
// on peut recupérés la valeur de retour 
function  MetHAL(argument, callback){
	var request = require('request').defaults({
	  proxy: process.env.http_proxy ||
	         process.env.HTTP_PROXY ||
	         process.env.https_proxy ||
	         process.env.HTTPS_PROXY
	});

	//nettoyage  de l'argument de recherche de toute carréctaire qui peut causé un beug sur notre requête
	//var argumentNonstopword = argument.replace(/[%&"#?;=+*:]/gi , ' ' );

	var url ='http://api.archives-ouvertes.fr/search/?wt=json&fl=*';
	// assemblement du lien de la requête
	var requete = url + '&q=(' + argument + ')'; 
	
	//envoye de la requête vers l'api hal et lecture du resultat
	request.get(requete , function (err, res , body){
		//condition au cas d'erreur dans la transaction
		if (err) {
		    throw err;
		}
		//au cas où ça marche bien et il y a une réponse de retour
	 	if(res.statusCode === 200){
	 		try{
	 		//parser le resultat de retour et le donné une format json
	 		info = JSON.parse(body);
	 		//si la propriété error existe alors c'est un objet json qui contient un description d'erreur de la recherche
	 		if(info.error){	
	 			callback(null ,"Recherche introuvable") ;
	 		}else{
	 		// retour du resultat obtenu englobé dans une focntion de retour	
	 			callback(null , info);
	 		}
			
	 		}catch(e){
	 			callback(null , 'resultat syntaxiquement incorrecte , erreur : ' + e);  	
	 		}
	 	}else if(res.statusCode === 404){
	 		callback(null ,"Erreur 404 page introuvable")
	 	}else{
	 		callback(null , "Recherche introuvable");
	 	}
	 	 
	});


}

module.exports = {
	"MetHAL" : MetHAL
};

