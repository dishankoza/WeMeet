const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');
var data = ''
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('home');
});

app.post("/ml",(req,res) =>{
  console.log("request body: "+ req.body.data)
data = req.body.data
res.sendStatus(200);
})
app.get('/data',(req,res) =>{
  res.send({data: data})
  // res.setHeader('Content-Type', 'application/json');
  // res.end(JSON.stringify({name: 'John'}));
})

app.get('/meet', (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get('/:room', (req, res) => {
  const id = req.params.room;
  const regex = new RegExp(
    /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
  );
  if (!regex.test(id)) {
    return res.redirect('/');
  }
  return res.render('room', { roomId: req.params.room });
});

io.on('connection', (socket) => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId);
    });
  });
});

server.listen(process.env.PORT || 3000);
