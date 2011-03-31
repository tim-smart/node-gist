var Gist, gist;
Gist = require('../');
gist = new Gist({
  id: '8ff9209f495c2cc9cacb',
  user: 'Tim-Smart',
  token: '1ea2c37e8d532a9ceb06bb3c8fd4912f'
});
gist.load(function(error, meta) {
  console.log(meta);
  return console.log(this);
});