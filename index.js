var express = require('express');
var youtubeSearch = require('youtube-search');
var bodyParser = require('body-parser');
var app = express();
var port = process.env.port || 8686;
var router = express.Router();
var fs = require('fs');
var youtubeDl = require('youtube-dl');
var ytdl = require('ytdl-core');
var badWords = ["sex","porn","sexy","nude","pornstar","xxx","سکس","پورن","جنده","کس","کیر","کون","dick"];
var badWordNegatives = ["movie","song","clip","album","track","music","book","magazine","آهنگ","فیلم","کلیپ"];
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use('/',router);
var isValidSearchTerm = function(searchQuery) {
    var query = searchQuery+""
    if (new RegExp(badWords.join("|")).test(query)) {
        if (new RegExp(badWordNegatives.join("|")).test(query)) {
            return true;
        } else{ 
            return false;
        }
    } else {
        return true;
    }
}
console.log(isValidSearchTerm("sexy hot girl"));
router.use(function(req,res,next){
    next();
});
router.post('/search',function(req,res){
    var opts = {maxResults:20,key:'AIzaSyBsTzQhNubTEN-xwzSTZRwUEUSbZYEcRss',type:'video'};
    var queryToCheck = req.body.query;
    if (isValidSearchTerm(queryToCheck)) {
        youtubeSearch(req.body.query,opts,function(err,results){
            if(err) return console.log(err);
            res.json({success:true,results});
        });
    } else {
        res.json({success:false,messsage:"جستجوی شما نتیجه ای نداد"})
    }
});
router.post('/download',function(req,res){
    var id = req.body.link.substr(req.body.link.length - 11);
    ytdl(req.body.link,{ filter: function(format) { return format.container === 'mp4'; }}).pipe(fs.createWriteStream('../static_content/' + id + '.mp4'))
        res.json({success:true, message:'https://myfuckingapi.com/'+id+'.mp4'});
});
router.post('/finish',function(req,res){
    var id = req.body.link.substr(req.body.link.length - 11);
    fs.unlink('../static_content/'+id+'.mp4');
    res.json({success:true});
});
app.listen(port);
console.log('voila');
