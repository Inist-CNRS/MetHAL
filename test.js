"use strict";

var MetHal = require('./index');


MetHal.MetHAL('docid:"19"' , function (err , res) {
	console.log(res.response.docs);
});
