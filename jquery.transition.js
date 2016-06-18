/**
 * jQuery Transition v1.0.0 - https://github.com/harujioh
 * author : harujioh
 **/

// initialize
(function(){
	var head = document.getElementsByTagName('head').item(0);
	var style = document.createElement('style');
	style.type = "text/css";
	head.appendChild(style);

	for(var i = 0, l = document.styleSheets.length; i < l; i++){
		if(style.sheet === document.styleSheets[i]){
			document.styleSheets[i].insertRule('.transition > img { opacity: 0; }', 0);
		}
	}
})();

$.extend({
	clipShape : function(ctx, type, width, height, rate){
		if(type === 'linear-left-bottom'){
			ctx.moveTo(0, height);
			ctx.lineTo(0, height - (width + height) * rate);
			ctx.lineTo((width + height) * rate, height);
		}
		// default linear-left-top
		else{
			ctx.moveTo(0, 0);
			ctx.lineTo(0, (width + height) * rate);
			ctx.lineTo((width + height) * rate, 0);
		}
	}
})

// add jquery function
$.fn.extend({
	transition : function(opt){
		var $self = $(this);
		var $img = $(this).children();

		// option
		var opt = $.extend({
			fps : 60,
			duration : 500,
			clip : 'linear-left-top',
			easing : typeof $.easing.swing === 'function' && $.easing.swing.length == 5 ? $.easing.swing : function(x, t, b, c, d){ return.5-Math.cos(x*Math.PI)/2; }
		}, opt);

		// var
		var animationTimeout = -1;
		var hodlerPosition = 0;

		// this element has 1 <img> only
		if(!($img.length === 1 && $img.is('img'))){
			return this;
		}

		// get <img> size
		$img.bind('load', function(){
			var backgroundImage = $(this)[0];
			var width = $(this).width();
			var height = $(this).height();

			// create <canvas>
			var canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;

			// replace <img> -> <canvas>
			var ctx = canvas.getContext('2d');
			ctx.drawImage(backgroundImage, 0, 0);
			$self.append(canvas);
			$(this).remove();

			// load hover image
			var hoverImageSrc = $self.data('hoverImage') || '';
			if(hoverImageSrc.length > 0){
				var hoverImage = new Image();
				hoverImage.onload = function(){
					$self.hover(function(){
						clearTimeout(animationTimeout);
						animation(hodlerPosition, 1);
					}, function(){
						clearTimeout(animationTimeout);
						animation(hodlerPosition, -1);
					});
				}
				hoverImage.src = hoverImageSrc;
			}

			// animation method
			function animation(position, sign){
				var rangePosition = Math.max(0, Math.min(opt.duration, position));
				var easingRate = opt.easing(rangePosition / opt.duration, rangePosition, 0, 1, opt.duration);

				ctx.clearRect(0, 0, width, height);
				ctx.drawImage(backgroundImage, 0, 0);
				ctx.save();
				ctx.beginPath();
				$.clipShape(ctx, opt.clip, width, height, easingRate);
				ctx.closePath();
				ctx.clip();
				ctx.drawImage(hoverImage, 0, 0);
				ctx.restore();

				if(position < 0){
					position = 0;
				}else if(position > opt.duration){
					position = opt.duration;
				}else{
					var delay = 1000 / opt.fps;
					hodlerPosition = position;
					animationTimeout = setTimeout(function(){
						animation(position + delay * sign, sign);
					}, delay);
				}
			};
		});

		return this;
	},

	transitionIn : function(opt, callback){
		var $self = $(this);
		var $img = $(this).children();

		// option
		var opt = $.extend({
			fps : 60,
			duration : 500,
			easing : typeof $.easing.swing === 'function' && $.easing.swing.length == 5 ? $.easing.swing : function(x, t, b, c, d){ return.5-Math.cos(x*Math.PI)/2; }
		}, opt);

		// var
		var animationTimeout = -1;
		var hodlerPosition = 0;

		// this element has 1 <img> only
		if(!($img.length === 1 && $img.is('img'))){
			return this;
		}

		// get <img> size
		if($img[0].complete){
			startTransitionIn();
		}else{
			$img.bind('load', startTransitionIn);
		}

		function startTransitionIn(){
			var hoverImage = $img[0];
			var width = $img.width();
			var height = $img.height();

			// create <canvas>
			var canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;

			// replace <img> -> <canvas>
			var ctx = canvas.getContext('2d');
			$self.append(canvas);
			$img.remove();

			// load hover image
			animation(hodlerPosition, 1);

			// animation method
			function animation(position, sign){
				var rangePosition = Math.max(0, Math.min(opt.duration, position));
				var easingRate = opt.easing(rangePosition / opt.duration, rangePosition, 0, 1, opt.duration);

				ctx.clearRect(0, 0, width, height);
				ctx.save();
				ctx.beginPath();
				$.clipShape(ctx, opt.clip, width, height, easingRate);
				ctx.closePath();
				ctx.clip();
				ctx.drawImage(hoverImage, 0, 0);
				ctx.restore();

				if(position < 0){
					position = 0;
				}else if(position > opt.duration){
					position = opt.duration;

					if(typeof callback === 'function'){
						callback.apply($self, []);
					}
				}else{
					var delay = 1000 / opt.fps;
					hodlerPosition = position;
					animationTimeout = setTimeout(function(){
						animation(position + delay * sign, sign);
					}, delay);
				}
			}
		}

		return this;
	}
});