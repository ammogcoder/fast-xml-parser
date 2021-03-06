#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var parser = require('./lib/parser');
var readToEnd = require('./src/read').readToEnd;

if(process.argv[2] === "--help" || process.argv[2] === "-h"){
    console.log("Fast XML Parser " + require(path.join(__dirname + "/package.json")).version);
    console.log("----------------");
    console.log("xml2js [-ns|-a|-c|-v|-V] <filename> [-o outputfile.json]");
    console.log("cat xmlfile.xml | xml2js [-ns|-a|-c|-v|-V] [-o outputfile.json]");
    console.log("-ns: remove namespace from tag and atrribute name.");
    console.log("-a: don't parse attributes.");
    console.log("-c: parse values to premitive type.");
    console.log("-v: validate before parsing.");
    console.log("-V: validate only.");
}else if(process.argv[2] === "--version"){
    console.log(require(path.join(__dirname + "/package.json")).version);
}else{
    var options = {
        ignoreNameSpace : true,
        ignoreAttributes : false,
        parseNodeValue : true,
        parseAttributeValue : true
    };
    var fileName = "";
    var outputFileName;
    var validate = false;
    var validateOnly = false;
	for(var i=2; i<process.argv.length;i++){
		if(process.argv[i] === "-ns"){
            options.ignoreNameSpace = false;
        }else if(process.argv[i] === "-a"){
            options.ignoreAttributes = true;
        }else if(process.argv[i] === "-c"){
            options.parseNodeValue = false;
            options.parseAttributeValue = false;
        }else if(process.argv[i] === "-o"){
            outputFileName = process.argv[++i];
        }else if(process.argv[i] === "-v"){
            validate = true;
        }else if(process.argv[i] === "-V"){
            validateOnly = true;
        }else{//filename
            fileName = process.argv[i];
        }
    }
    var callback = function (xmlData) {
        var output = "";
        if(validate){
            var result = parser.validate(xmlData);
            if(result === true){
                output = JSON.stringify(parser.parse(xmlData,options),null,4);        
            }else{
                output = result;
            }
        }else if(validateOnly){
            output = parser.validate(xmlData);
        }else{
            output = JSON.stringify(parser.parse(xmlData,options),null,4);
        }
        if (outputFileName) {
            writeToFile(outputFileName, output);
        } else {
            console.log(output);
        }
    };

    try{
        if (!fileName) {
            readToEnd(process.stdin, function (err, data) {
                if (err) throw err;
                callback(data);
            });
        }else {
            fs.readFile(fileName, function (err, data) {
                if (err) throw err;
                callback(data);
            });
        }
    }catch(e){
        console.log("Seems an invalid file or stream." + e);
    }
}

function writeToFile(fileName, data){
	fs.writeFile(fileName, data, function (err) {
		if (err) throw err;
	 	console.log('JSON output has been written to ' + fileName);
	});
}
