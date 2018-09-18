const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const db_config = require('./config/database');
var fs = require('fs-extra');  // file system
const empty = require('empty-folder');
var zipFolder = require('zip-folder');
const del = require('del');
const multer = require('multer'); // file storing middleware
const PORT = process.env.PORT || 5000;




//MULTER CONFIG: to get file photos to temp server storage
const multerConfig = {

    storage: multer.diskStorage({
        //Setup where the user's file will go
        destination: function(req, file, next){
            next(null, './public/img/');
        },


        filename: function(req, file, next){
            //console.log(file.originalname);
            //const ext = file.mimetype.split('/')[1];
            //next(null, file.fieldname + '-' + Date.now() + '.'+ext);
            next(null, file.originalname);
        }
    }),

    //A means of ensuring only images are uploaded.
    fileFilter: function(req, file, next){
        if(!file){
            next();
        }
        const image = file.mimetype.startsWith('image/');
        if(image){
            console.log('photo uploaded');
            next(null, true);
        }else{
            console.log("file not supported");

            return next();
        }
    }
};



var connection;
//fixing LOST connection bag
function handleDisconnect() { //https://stackoverflow.com/questions/20210522/nodejs-mysql-error-connection-lost-the-server-closed-the-connection
    connection = mysql.createConnection(db_config);

    connection.connect(function(err) {
        if(err) {
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000);
        }else{
            console.log('Connected to mysql!');
        }
    });

    connection.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}
// /handleDisconnect();


//function we can use to delete all unnecessary folders from output

function cleanOutputFolder(){
    fs.readFile('./banners_html.json' , 'utf-8' , function(err,data){
        if(err) throw err
        var folders = [];
        var arrayOfObjects = JSON.parse(data);
        arrayOfObjects = arrayOfObjects.banners_html;
        for(var x=0; x<arrayOfObjects.length ; x++){
            folders.push(arrayOfObjects[x].folder_name.substring(0,arrayOfObjects[x].folder_name.length-4));
        }


        fs.readdir('./output', (err, files) => {
            files.forEach(file => {
                var exist = false;

                for(var z =0; z<folders.length;z++){
                    if(file == folders[z]){
                        exist = true;
                    }
                }
                for(var z =0; z<folders.length;z++){
                    if(file == folders[z] +'.zip'){
                        exist = true;
                    }
                }

                if(!exist){
                    fs.remove('./output/' + file , err => {
                        if (err) return console.error(err)
                    });
                }
            });
        });
    });
}
//cleanOutputFolder();

// Init App
const app = express();

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname, '/')));

var urlencodedParser = bodyParser.urlencoded({ extended: false });

// Home Route
app.get('/', urlencodedParser ,function(req, res){
    var images = [];
    fs.readdir('./public/img', function (err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        files.forEach(function (file) {
            images.push(file);
        });
        res.render('index' , {
            images : images
        });
    });

});

//store image on /upload POST request
app.post('/upload' , multer(multerConfig).array('images',20) , urlencodedParser ,  function(req,res){
    res.redirect('/');
});



app.post('/', urlencodedParser , function(req, res){

    var title = JSON.stringify(req.body.title);
    var bannerHtml = req.body.bannerHtml;
    var backgroundSet = JSON.parse(req.body.backgroundSet);
    var backgroundSetLength = backgroundSet.length;
    var timeStamp = new Date().valueOf();
    var directoryName = title +  '&' + timeStamp;
    directoryName = directoryName.replace(/ /g,"");
    directoryName = directoryName.replace(/"/g,"");
    var destinationFolder = './output/' + directoryName;
    var indexHTML = destinationFolder + '/index.html';
    var archiveName = directoryName + '.zip';
    var legalNote = req.body.legalNote;


    bannerHtml = bannerHtml.replace(/&quot;/g, "'");
    bannerHtml = bannerHtml.replace(/..\/public\/img/g , "./img");

    //create destination folder
    fs.mkdirSync(destinationFolder);

    //parsing output html

    var path = process.cwd();
    var footer = fs.readFileSync(path + "/outputParts/footer.txt");
    var header = fs.readFileSync(path + "/outputParts/header.txt");
    footer = footer.toString();
    header = header.toString();

    var titleString = '<title>' + title + '</title>';
    titleString = titleString.replace(/"/g,'');
    header = header.replace('<title></title>' , titleString);


    //whole index.html for our banner
    var finalOutput = header  + bannerHtml + legalNote   + footer;



    fs.appendFile(indexHTML, finalOutput, function (err) {
        if (err) throw err;
    });


    fs.copy('./outputSkeleton', destinationFolder, function (err) {
        if (err) {
            console.error(err);
        } else {
            console.log("success copying images!");
        }
    });


    //delete all content from directory
    empty('./output/img', false, (o,err)=>{
        if(o.error) console.error(err);
    });


    //copying new images
    for(var x=0; x < backgroundSetLength; x++){
        var mainImgName =  './public/img/' + backgroundSet[x].main;
        var mainImgNameDestination =  destinationFolder + '/img/'  + backgroundSet[x].main;
        var animImgName =  './public/img/' + backgroundSet[x].anim;
        var animImgNameDestination =  destinationFolder + '/img/'  + backgroundSet[x].anim;

        fs.copy(mainImgName, mainImgNameDestination, function (err) {
            if (err) {
                console.error(err);
            } else {
                console.log("success copying images!");
            }
        });

        fs.copy(animImgName, animImgNameDestination, function (err) {
            if (err) {
                console.error(err);
            } else {
                console.log("success copying images!");
            }
        });
    }

    res.send(archiveName);
});


app.post('/download', function(req, res){
    var generatedZipFolderName = req.body.generatedFolderName;
    var folderName = generatedZipFolderName.substring(0,generatedZipFolderName.length-4);
    var bannerHtml = req.body.outputHtml;
    var title = req.body.title;
    bannerHtml = bannerHtml.replace(/&quot;/g, "'");
    bannerHtml = bannerHtml.replace(/..\/public\/img/g , "./img");
    var currentdate = new Date();
    var datetime = currentdate.getDate() + "/"
        + (currentdate.getMonth()+1)  + "/"
        + currentdate.getFullYear();
    var width = req.body.width;
    var height = req.body.height;
    var templateType = req.body.template;
    var slidesContent  = req.body.slidesContent;
    var legalNote = req.body.legalNote;
    var legalNoteType = req.body.legalNoteType;
    slidesContent = JSON.parse(slidesContent);




    //creating database of all banners html

    fs.readFile('./banners_html.json' , 'utf-8' , function(err,data){
        if(err) throw err

        var arrayOfObjects = JSON.parse(data);

        arrayOfObjects.banners_html.push({
            'title' : title,
            'html'  : bannerHtml,
            'folder_name' : generatedZipFolderName,
            'date' : datetime,
            'height' : height,
            'width' : width,
            'template' : templateType,
            'slides_content' : slidesContent,
            'legal_note' : legalNote,
            'legalNoteType' : legalNoteType
        });

        fs.writeFile('./banners_html.json', JSON.stringify(arrayOfObjects), 'utf-8', function(err) {
            if (err) throw err
        })
    });


    zipFolder('./output/' + folderName, './output/' + generatedZipFolderName  , function(err) {
        if(err) {
            console.log('oh no!', err);
        } else {
            console.log('EXCELLENT');
        }
    });

    res.send(generatedZipFolderName);

});

app.post('/deleteBanner' , function(req , res){
    var folderNameZip = req.body.folderName;
    var folderName =  folderNameZip.substring(0,folderNameZip.length-4);


    fs.readFile('./banners_html.json' , 'utf-8' , function(err,data){
        if(err) throw err

        var arrayOfObjects = JSON.parse(data);



        for(var z = 0 ; z < arrayOfObjects.banners_html.length ; z++){
            if(arrayOfObjects.banners_html[z].folder_name == folderNameZip){
                arrayOfObjects.banners_html.splice(z,1);
            }
        }


        fs.writeFile('./banners_html.json', JSON.stringify(arrayOfObjects), 'utf-8', function(err) {
            if (err) throw err
        })
    });

    del.sync(['./output/' + folderName + '/**']).then(paths => {
        //console.log('Deleted files and folders:\n', paths.join('\n'));
    });


    res.send('Good!');
});


app.post('/deleteSingleImg' , function(req,res){
    var name = req.body.name;

    fs.remove('./public/img/' + name , err => {
        if (err){
            return console.error(err);
        }else{
            res.send('OK');
        }
    });


});


app.post('/copyImagesFromOutput' , function(req,res){
    var folder_name = req.body.folderName;
    folder_name = folder_name.substring(0,folder_name.length-4);


    fs.copy('./output/' + folder_name + '/img/', './public/img/', function (err) {
        if (err) {
            console.error(err);
        } else {
            console.log("success copying images!");
        }
    });

    res.send('OK');
});





// Start Server
app.listen(PORT, function(){
    console.log('Server started on port 5000...');
});

/*

fs.remove('./output/' + folderNameZip , err => {
       if (err) return console.error(err)
});

*/



//clear file

/*fs.truncate('./output/index.html', 0);
* was used to clear html before copying to our file
* */


