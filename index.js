var express = require('express');
var youtubeSearch = require('youtube-search');
var bodyParser = require('body-parser');
var app = express();
var port = process.env.port || 8282;
var router = express.Router();
var fs = require('fs');
var youtubeDl = require('youtube-dl');
var ytdl = require('ytdl-core');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use('/',router);
router.use(function(req,res,next){
    next();
});
router.post('/search',function(req,res){
    var opts = {maxResults:20,key:'AIzaSyBsTzQhNubTEN-xwzSTZRwUEUSbZYEcRss'};
    youtubeSearch(req.body.query,opts,function(err,results){
        if(err) return console.log(err);
        res.send(results);
    });8
});
router.post('/download',function(req,res){
    var id = req.body.link.substr(req.body.link.length - 11);
    ytdl(req.body.link,{ filter: function(format) { return format.container === 'mp4'; }}).pipe(fs.createWriteStream('../static_content/' + id + '.mp4')).on('close',function(){
        res.json({success:true, message:'https://myfuckingapi.com/'+id+'.mp4'});
    });
});
router.post('/finish',function(req,res){
    var id = req.body.link.substr(req.body.link.length - 11);
    fs.unlink(id+'.mp4');
    res.json({success:true});
});
app.listen(port);
console.log('voila');