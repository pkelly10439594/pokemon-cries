const express = require('express');
const app = express();
const static = express.static(__dirname + '/public');

const configRoutes = require('./routes');
// const exphbs = require('express-handlebars');
const { engine } = require('express-handlebars');

app.use('/public', static);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');

configRoutes(app);

app.listen(4000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});
