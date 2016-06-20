/**
 * jQuery Transition v1.0.2 - https://github.com/harujioh
 * author : harujioh
 **/

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
		$(this).each(function(){
			var $self = $(this);
			var $img = $(this).children();

			// option
			opt = $.extend({
				fps : 60,
				duration : 500,
				speed : 0,
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

			if($img[0].complete){
				setTransition();
			}else{
				$img.bind('load', setTransition);
			}

			// get <img> size
			function setTransition(){
				var backgroundImage = $img[0];
				var width = backgroundImage.width;
				var height = backgroundImage.height;

				// create <canvas>
				var canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;

				// replace <img> -> <canvas>
				var ctx = canvas.getContext('2d');
				ctx.drawImage(backgroundImage, 0, 0);
				$self.append(canvas);
				$img.remove();

				// load hover image
				var hoverImageSrc = $self.data('hoverImage') || '';
				if(hoverImageSrc.length > 0){
					var hoverImage = new Image();
					hoverImage.onload = function(){
						var duration = opt.duration;
						if(opt.speed > 0){
							duration = canvas.width / opt.speed;
						}

						$self.hover(function(){
							clearTimeout(animationTimeout);
							animation(hodlerPosition, 1, duration);
						}, function(){
							clearTimeout(animationTimeout);
							animation(hodlerPosition, -1, duration);
						});
					}
					hoverImage.src = hoverImageSrc;
				}

				// animation method
				function animation(position, sign, duration){
					var rangePosition = Math.max(0, Math.min(duration, position));
					var easingRate = opt.easing(rangePosition / duration, rangePosition, 0, 1, duration);

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
					}else if(position > duration){
						position = duration;
					}else{
						var delay = 1000 / opt.fps;
						hodlerPosition = position;
						animationTimeout = setTimeout(function(){
							animation(position + delay * sign, sign, duration);
						}, delay);
					}
				};
			}
		});

		return this;
	},

	transitionIn : function(opt, callback){
		$(this).each(function(){
			var $self = $(this);
			var $img = $(this).children();

			// option
			opt = $.extend({
				fps : 60,
				duration : 500,
				speed : 0,
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
				var width = hoverImage.width;
				var height = hoverImage.height;

				// create <canvas>
				var canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;

				// replace <img> -> <canvas>
				var ctx = canvas.getContext('2d');
				$self.append(canvas);
				$img.remove();

				// load hover image
				var duration = opt.duration;
				if(opt.speed > 0){
					duration = canvas.width * opt.speed;
				}
				animation(hodlerPosition, 1, duration);

				// animation method
				function animation(position, sign, duration){
					var rangePosition = Math.max(0, Math.min(duration, position));
					var easingRate = opt.easing(rangePosition / duration, rangePosition, 0, 1, duration);

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
					}else if(position > duration){
						position = duration;

						if(typeof callback === 'function'){
							callback.apply($self, []);
						}
					}else{
						var delay = 1000 / opt.fps;
						hodlerPosition = position;
						animationTimeout = setTimeout(function(){
							animation(position + delay * sign, sign, duration);
						}, delay);
					}
				}
			}
		});

		return this;
	}
});