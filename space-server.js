var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , url = require("url")
  , path = require("path");  

app.listen(80);

var dgram = require('dgram');
var client = dgram.createSocket("udp4");
var message = new Buffer("started");
client.send(message, 0, message.length, 8051, "192.168.1.111", function(err, bytes) {
  console.log(message);
});

function handler (req, res) {
    var uri = url.parse(req.url).pathname;  
    var filename = path.join(process.cwd(), uri);  
    fs.exists(filename, function(exists) {  
        if(!exists) {  
            res.writeHead(404, {"Content-Type": "text/plain"});  
            res.write("404 Not Found\n");  
            res.end();  
            return;  
        }  
        fs.readFile(filename, "binary", function(err, file) {  
            if(err) {  
		filename = path.join(process.cwd(), uri + "/index.html");
		fs.readFile(filename, "binary", function(err, file) {  
		            if(err) {  
		
		                res.writeHead(500, {"Content-Type": "text/plain"});  
		                res.write(err + "\n");  
		                res.end();  
		                return;  
		            }  
		            res.writeHead(200);  
		            res.write(file, "binary");  
		            res.end();  
		});  
                return;  
            }  
            res.writeHead(200);  
            res.write(file, "binary");  
            res.end();  
        });  
    });  
}

function serialize(obj)
{
  var returnVal;
  if(obj != undefined){
  switch(obj.constructor)
  {
   case Array:
    var vArr="[";
    for(var i=0;i<obj.length;i++)
    {
     if(i>0) vArr += ",";
     vArr += serialize(obj[i]);
    }
    vArr += "]"
    return vArr;
   case String:
    returnVal = ("'" + obj + "'");
    return returnVal;
   case Number:
    returnVal = isFinite(obj) ? obj.toString() : null;
    return returnVal;    
   case Date:
    returnVal = "#" + obj + "#";
    return returnVal;  
   default:
    if(typeof obj == "object"){
     var vobj=[];
     for(attr in obj)
     {
      if(typeof obj[attr] != "function")
      {
       vobj.push('"' + attr + '":' + serialize(obj[attr]));
      }
     }
      if(vobj.length >0)
       return "{" + vobj.join(",") + "}";
      else
       return "{}";
    }  
    else
    {
     return obj.toString();
    }
  }
  }
  return null;
}

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
    jdata = serialize(data)
    var keystroke = new Buffer(jdata);
    client.send(keystroke, 0, keystroke.length, 8051, "192.168.1.111", function(err, bytes) {
  	console.log(keystroke);
    });
  });
});



