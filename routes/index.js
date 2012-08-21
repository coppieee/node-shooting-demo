
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index');
};
exports.game = function(req, res){
  res.render('game');
};
exports.gameover = function(req, res){
	res.render('gameover');
};