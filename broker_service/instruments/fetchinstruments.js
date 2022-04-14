const axios = require('axios');
var instruments =[];
function fetchInstrumentTokens(){
    instruments=[];
    axios.get('https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json').then((response) => {
        var responseBody = response.data;

        responseBody.forEach((inst)=>{
            var tsymbol = inst['symbol']
            if(tsymbol.toLowerCase().indexOf('-bl')===-1 && tsymbol.toLowerCase().indexOf('-be')===-1 
            && tsymbol.toLowerCase().indexOf('-mf')===-1 && tsymbol.toLowerCase().indexOf('-sg')===-1){
                var obj = {
                    name: inst['name'],
                    token: inst['token'],
                    symbol: inst['symbol'],
                    exchange: inst['exch_seg']
                }
                instruments.push(obj);
            }
        })
    }).catch((err) => {
        console.log(err);
    });
}


function searchInstruumentToken(name, cb){
    var searchresult = [];
	try {
		var search = name;
		var searchList;
		//	if(search.indexOf(" ")!==-1){
		searchList = getMonth(search);
		var tlength = searchList.length;
		//	}

		instruments.filter((entry) => {

			for (let i = 0; i < tlength; i++) {
				var item = searchList[i];
				if (entry.symbol) {
					if (entry.symbol.toLowerCase().indexOf(item.toLowerCase()) !== -1) {
						if (i === tlength - 1) {
							searchresult.push(entry);
						}
					} else {
						break;
					}
				}
			}

		});
		cb(searchresult);
	} catch (e) {
		console.log(e);
	}
}

function getMonth(searchString) {

	var months = [
		'jan',
		'feb',
		'mar',
		'apr',
		'may',
		'jun',
		'jul',
		'aug',
		'sep',
		'oct',
		'nov',
		'dec'
	];

	var slist = searchString.split(" ");
	for (let index = 0; index < months.length; index++) {
		var month = months[index];

		slist.forEach((item) => {
			if (item.toLowerCase().indexOf(month.toLowerCase()) !== -1) {
				var tindex = slist.indexOf(item)
				slist[tindex] = month;
			}
		});
	}
	return slist;
}


module.exports= {fetchInstrumentTokens,searchInstruumentToken};
