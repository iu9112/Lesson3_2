const express = require("express");
const bodyParser = require("body-parser");
const PORT = 3000;
const app = express();
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const url = 'mongodb://localhost:27017/tel_kn';
let dop_field= [
                {
                    id:'mail',
                    name: 'Почта'
                },
                {
                    id:'skype',
                    name: 'Skype'
                },
                {
                    id:'vk',
                    name: 'Вконтакте'
                },
                {
                    id:'whatsapp',
                    name: 'WhatsApp'
                },
                {
                    id:'ok',
                    name: 'Одноклассники'
                },
                {
                    id:'tw',
                    name: 'Twitter'
                }
                
            ];// массив для доп полей

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));    // to support JSON-encoded bodies
app.use(express.static(__dirname + '/public'));

app.get("/", function(req, res) {
     res.send('hello');
});
app.get("/contacts/", function(req, res) {//получаем весь список контактов
MongoClient.connect(url , (err,db)=>{
    if (err) {
        console.log('Невозможно подключиться к серверу MongoDB. Ошибка: ', err);
    }
    else {
        console.log('Соединение установлено для ', url);
		var collection = db.collection('contact');
		collection.find({}, {_id:0, firstName:1,lastName:1}).sort({ firstName: 1 }).toArray( (err,result)=> {
			if (err){
				 console.log('Ошибка: ', url);
			}
			else if (result.length){
				res.json(result);  
			}
			else {
				console.log('Ни чего не найдено');
			}
			 db.close();
		});
    }
});
});

app.get('/contacts/user/', function(req, res) {//получаем конкретный контакт
    MongoClient.connect(url , (err,db)=>{
        if (err) {
            console.log('Невозможно подключиться к серверу MongoDB. Ошибка: ', err);
        }
        else {
            console.log('Соединение установлено для ', url);
            var collection = db.collection('contact');//создание коллекции
            collection.find({$and:[{lastName:req.query.lastName},{firstName:req.query.firstName}]} , {_id:0}).toArray( (err,result)=> {
                if (err){
                     console.log('Ошибка: ', url);
                }
                else if (result.length){
                    res.json(result);
                }
                else {
                    console.log('Ни чего не найдено');
                }
                 db.close();
            });
        }
    });
});

app.get('/contacts/user/delete/', function(req, res) {//удаляем контакт
    MongoClient.connect(url , (err,db)=>{
        if (err) {
            console.log('Невозможно подключиться к серверу MongoDB. Ошибка: ', err);
        }
        else {
            console.log('Соединение установлено для ', url);
            var collection = db.collection('contact');//создание коллекции
            collection.deleteOne({firstName:req.query.firstName}, (err,result)=> {
                if (err){
                     console.log('Ошибка: ', url);
                }
                else{
                    collection.find({}, {_id:0, firstName:1,lastName:1}).sort({ firstName: 1 }).toArray( (err,result)=> {
                        if (err){
                             console.log('Ошибка: ', url);
                        }
                        else if (result.length){
                            res.json(result);  
                        }
                        else {
                            console.log('Ни чего не найдено');
                        }
                         db.close();
                    });  
                }
            });
        }
    })
});

app.get('/contacts/user/edit/', function(req, res) {//изменяем контакт
    let searchLastName = req.query.lastName,
        searchFirstName = req.query.firstName,
        number = req.query.data.number,
        field =  req.query.data.field,
        lastName = req.query.data.lastName,
        firstName = req.query.data.firstName;
    MongoClient.connect(url , (err,db)=>{
        if (err) {
            console.log('Невозможно подключиться к серверу MongoDB. Ошибка: ', err);
        }
        else {
            console.log('Соединение установлено для ', url);
            var collection = db.collection('contact');//создание коллекции
            collection.update({$and:[{lastName:searchLastName},{firstName:searchFirstName}]},{$set: {lastName: lastName,firstName:firstName,number:number,field:field}},{upsert:1}, (err,result)=> {
               if (err){
                     console.log('Ошибка: ', url);
                }
                else{
                    collection.find({$and:[{lastName:lastName},{firstName:firstName}]}, {_id:0}).toArray( (err,result)=> {
                if (err){
                     console.log('Ошибка: ', url);
                }
                else if (result.length){
                    res.json(result);
                }
                else {
                    console.log('Ни чего не найдено');
                }
                 db.close();
                });
                }
            });
        }
    });
});

app.get('/contacts/user/add/', function(req, res) {// добавляем контакт
    let number = req.query.data.number,
        field =  req.query.data.field,
        lastName = req.query.data.lastName,
        firstName = req.query.data.firstName;
    MongoClient.connect(url , (err,db)=>{
        if (err) {
            console.log('Невозможно подключиться к серверу MongoDB. Ошибка: ', err);
        }
        else {
            console.log('Соединение установлено для ', url);
            var collection = db.collection('contact');//создание коллекции
            collection.insertOne({lastName: lastName,firstName:firstName,number:number,field:field}, (err,result)=> {
               if (err){
                     console.log('Ошибка: ', url);
                }
                else{
                    collection.find({$and:[{lastName:lastName},{firstName:firstName}]}, {_id:0}).toArray( (err,result)=> {
                if (err){
                     console.log('Ошибка: ', url);
                }
                else if (result.length){
                    res.json(result);
                }
                else {
                    console.log('Ни чего не найдено');
                }
                 db.close();
                });
                }
            });
        }
    });
});

app.listen(PORT, () => {
  console.log('Hello! We are live on ' + PORT);
});

