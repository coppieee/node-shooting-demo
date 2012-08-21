jQuery(function($) {
	"use strict";
	var _socket = io.connect('http://'+location.host+'/');
	var _userMap = {};
	var _bulletMap = {};
	_socket.on('player-update',function(data){
		var user;
		if(_userMap[data.userId] === undefined){
			console.log('create user '+data.userId , data);
			user = {x:0,y:0,v:0,rotate:0,userId:data.userId};
			user.element = $('<img src="/images/unit.png" class="player" />')
				.attr('data-user-id',user.userId);
			$('body').append(user.element);
			_userMap[data.userId] = user;
			
			var bullet = {x:-100,y:-100,v:0,rotate:0,userId:data.userId};
			bullet.element = $('<img src="/images/bullet.png" class="bullet" />')
				.attr('data-user-id',user.userId);
			$('body').append(bullet.element);
			
			_bulletMap[data.userId] = bullet;
			
		}else{
			user = _userMap[data.userId];
		}
		user.x = data.data.x;
		user.y = data.data.y;
		user.rotate = data.data.rotate;
		user.v = data.data.v;
		updateCss(user);
	});
	_socket.on('bullet-create',function(data){
		var bullet = _bulletMap[data.userId];
		if(bullet !== undefined){
			bullet.x = data.data.x;
			bullet.y = data.data.y;
			bullet.rotate = data.data.rotate;
			bullet.v = data.data.v;
		}
	});
	
	_socket.on('disconnect-user',function(data){
		var user = _userMap[data.userId];
		if(user !== undefined){
			user.element.remove();
			delete _userMap[data.userId];
			var bullet = _bulletMap[data.userId];
			bullet.element.remove();
			delete _bulletMap[data.userId];
		}
		
	});
	
	
	var _keyMap = [];
	var _player = {x:Math.random()*1000|0,y:Math.random()*500|0,v:0,rotate:0,element:$('#my-player')};
	var _bullet = {x:-100,y:-100,v:0,rotate:0,element:$('#my-bullet')};
	
	var updatePosition = function(unit){
		unit.x += unit.v* Math.cos(unit.rotate * Math.PI /180);
		unit.y += unit.v* Math.sin(unit.rotate * Math.PI /180);
	};
	var updateCss = function(unit){
		unit.element.css({
			left:unit.x|0+'px',
			top:unit.y|0 + 'px',
			transform:'rotate('+unit.rotate+'deg)'
		});
	};
	//メインループ
	var f = function(){
		if(_keyMap[37] === true){
			//left
			_player.rotate -= 3;
		}
		if(_keyMap[38] === true){
			//up
			_player.v += 0.5;
		}
		if(_keyMap[39] === true){
			//right
			_player.rotate += 3;
		}
		if(_keyMap[40] === true){
			//down
			_player.v -= 0.5;
		}
		if(_keyMap[32] === true && _isSpaceKeyUp){
			//space
			_isSpaceKeyUp = false;
			_bullet.x = _player.x +20;
			_bullet.y = _player.y +20;
			_bullet.rotate = _player.rotate;
			_bullet.v = Math.max(_player.v + 3,3);
			_socket.emit('bullet-create',{
				x:_bullet.x|0,
				y:_bullet.y|0,
				rotate:_bullet.rotate|0,
				v:_bullet.v
			});
		}
		_player.v *= 0.95;
		updatePosition(_player);
		var w_width = $(window).width();
		var w_height =$(window).height();
		if(_player.x < -50){ _player.x = w_width;}
		if(_player.y < -50){ _player.y = w_height;}
		if(_player.x > w_width){_player.x = -50;}
		if(_player.y > w_height){_player.y = -50;}
		
		updatePosition(_bullet);
		for(var key in _bulletMap){
			var bullet = _bulletMap[key];
			updatePosition(bullet);
			updateCss(bullet);
			if(_player.x < bullet.x && bullet.x <_player.x + 50 &&
			_player.y < bullet.y && bullet.y <_player.y + 50){
				location.href = '/gameover';
			}
		}
		updateCss(_bullet);
		updateCss(_player);
		_socket.emit('player-update',{x:_player.x|0,y:_player.y|0,rotate:_player.rotate|0,v:_player.v});
		setTimeout(f,30);
	};
	var _isSpaceKeyUp = true;
	setTimeout(f,30);
	$(window).keydown(function(e){
		_keyMap[e.keyCode] = true;
	});
	$(window).keyup(function(e){
		if(e.keyCode === 32){
			_isSpaceKeyUp = true;
		}
		_keyMap[e.keyCode] = false;
	});
});