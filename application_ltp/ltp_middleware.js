var fullList={};
var rList={};

function setToken(data){
    fullList[data['token']]=data['exchange'];
}

function getTokenLength(){
    return Object.keys(fullList).length- Object.keys(rList).length;
}

function getTokens(){
    var fullKeys= Object.keys(fullList);
    var rKeys= Object.keys(rList);
    var tokens=[];
    fullKeys.forEach((key)=>{
        if(rKeys.indexOf(key)===-1){
            tokens.push({exchange: fullList[key], token : key});
            rList[key]=fullList[key];
        }
    });
    return tokens;
}

function resetTokenList(){
    fullList={};
    rList={};
}

module.exports= {setToken, getTokenLength, getTokens, resetTokenList}
