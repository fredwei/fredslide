// made in fred,2014.04.29,shenzhen
// my website http://fredweb.duapp.com/
// this plug in git https://github.com/fredwei/fredslide
// you can contact me email 250095176@163.com or QQ 250095176 , Best can speak Chinese

;(function($){
	$.fn.fredslide = function(options){

		var opts = $.extend({},$.fn.fredslide.defaults,options);

		//执行代码
		return this.each(function(){
			var $this = $(this),
				lilen = true;

			//元素初始化
			lilen = slide_load($this,opts);

			//添加左右按钮
			prev_next_add($this,opts);
			//添加圆点按钮
			dot_add($this,opts);

		});

	};

	//自动播放
	var timer = null;
	function auto_play(obj,opts){

	   var depaytime = opts.AutoDelay + opts.SwitchTime + opts.AutoTime;

	   clearTimeout(timer);

		timer = setTimeout(function(){


			if(opts.SwitchStyle == 'fade')
			{
				//fade切换
				fade_prev_next(obj,true,opts);
			}

			if(opts.SwitchStyle == 'toleft')
			{
				//toleft切换
				toleft_prev_next(obj,true,opts);
			}

			auto_play(obj,opts);

		},depaytime);
	};

	//添加圆点按钮
	function dot_add(obj,opts){

		if(!opts.Dot)
		{
			return false;
		}

		var $objli = obj.find('li'),
			str = '<dl class="slide-dot">',
			lilen = $objli.length,
			mlen = lilen + 1;

		if(lilen < 2)
		{
			return false;
		}

		for(var i = 1 ; i < mlen ; i++)
		{
			str = str + '<dd>' + i + '</dd>';
		}

		str = str + '</dl>';

		obj.append(str);

		obj.find('.slide-dot dd').eq(opts.StartInex).addClass('active');

		//添加点击事件
		obj.on('click mouseenter mouseleave','.slide-dot dd',function(){

			//判断是否停止播放
			pauseorplay(obj,opts,event.type);

			if($objli.is(":animated") || $(this).hasClass('active') || event.type != 'click')
			{
				return false;
			}

			var thisindex = $(this).index(),
				porn = true;

			if(opts.SwitchStyle == 'fade')
			{
				//fade切换
				fade_prev_next(obj,porn,opts,thisindex);
			}

			if(opts.SwitchStyle == 'toleft')
			{

				$objli.eq(thisindex).css({'left':'100%'});

				//toleft切换
				toleft_prev_next(obj,porn,opts,thisindex);
			}
		});
	};

	//添加左右按钮
	function prev_next_add(obj,opts){
		var str = [],
			pobj = '.' + opts.Prev + ',.' + opts.Next,
			click_next = false,
			lilen = obj.find('li').length;

		if(lilen < 2)
		{
			return false;
		}

		str[0] = '<a href="javascript:;" id="' + opts.Prev + '" class="' + opts.Prev + '">' + opts.Prev + '</a>',
		str[1] = '<a href="javascript:;" id="' + opts.Next + '" class="' + opts.Next + '">' + opts.Next + '</a>',

		obj.append(str.join(''));

		//添加点击事件
		obj.on('click mouseenter mouseleave',pobj,function(event){

			//判断是否停止播放
			pauseorplay(obj,opts,event.type);

			if(obj.find('li').is(":animated") || event.type != 'click')
			{
				return false;
			}

			if($(this).hasClass(opts.Next))
			{
				click_next = true;
			}
			else{
				click_next = false;
			}

			if(opts.SwitchStyle == 'fade')
			{
				//fade切换
				fade_prev_next(obj,click_next,opts);
			}

			if(opts.SwitchStyle == 'toleft')
			{
				//toleft切换
				toleft_prev_next(obj,click_next,opts);
			}

		});

	};

	//fade切换
	function fade_prev_next(obj,r,opts,ifdot){
		var $bli = obj.find('li'),
			thisnum = $bli.parent().find('li.active').index(),
			nextindex = thisnum - 1;

		//判断prev、next、dot
		nextindex = ifpnd(obj,r,ifdot,thisnum);

		$bli.eq(thisnum).removeClass('active').fadeOut(opts.SwitchTime);
		$bli.eq(nextindex).addClass('active').fadeIn(opts.SwitchTime);
		obj.find('.slide-dot dd').removeClass('active').eq(nextindex).addClass('active');

	};


	//toleft切换
	function toleft_prev_next(obj,r,opts,ifdot){
		var $bli = obj.find('li'),
			thisnum = $bli.parent().find('li.active').index(),
			nextindex = 0,
			left_this = '-100%',
			left_next = '0px';

		//判断prev、next、dot
		nextindex = ifpnd(obj,r,ifdot,thisnum);

		if(!r)
		{
			//prev
			left_this = '100%';
		}

		$bli.eq(thisnum).removeClass('active').animate({left: left_this},opts.SwitchTime,opts.Aneasing);
		$bli.eq(nextindex).addClass('active').animate({left: left_next},opts.SwitchTime,opts.Aneasing,function(){
			toleftstyle(obj,opts,nextindex);
		});

		obj.find('.slide-dot dd').removeClass('active').eq(nextindex).addClass('active');

	};

	//元素初始化
	function slide_load(obj,opts){

		var $objli = obj.find('li'),
			lilen = $objli.length,
			previndex = 0,
			nextindex = 0,
			startindex = opts.StartInex;

		$objli.eq(startindex).addClass('active').show();

		//判断切换样式
		if(opts.SwitchStyle == 'toleft')
		{
			nextindex = ifpnd(obj,true,null,startindex);
			previndex = ifpnd(obj,true,null,startindex - 2);

			$objli.eq(previndex).css({'left':'-100%'});
			$objli.eq(opts.StartInex).css({'left':'0px'});
			$objli.eq(nextindex).css({'left':'100%'});
		}

		if(opts.AutoPlay && lilen > 1)
		{
			//自动播放
			auto_play(obj,opts);
		}

		obj.on('click mouseenter mouseleave','li .slide-txt',function(event){
			//判断是否停止播放
			pauseorplay(obj,opts,event.type);
		});

	};

	//判断prev或next或dot
	function ifpnd(obj,r,ifdot,thisnum){
		var $objli = obj.find('li'),
			thislen = $objli.length - 1,
			nextindex = thisnum - 1;

		if(r)
		{
			nextindex = thisnum + 1;
		}

		if(nextindex < 0)
		{
			nextindex = thislen;
		}

		if(nextindex > thislen)
		{
			nextindex = 0;
		}

		//如果是圆点
		if(ifdot != null)
		{
			nextindex = ifdot;
		}

		return nextindex;
	};

	//判断是否停止自动播放
	function pauseorplay(obj,opts,s){

		if(s == 'click' || s == 'mouseenter' || !opts.AutoPlay)
		{
			clearTimeout(timer);
		}
		else
		{
			//自动播放
			auto_play(obj,opts);
		}
	};

	//toleft切换样式
	function toleftstyle(obj,opts,tonext){

		var previndex = 0,
			nextindex = 0,
			owid = obj.width(),
			$objli = obj.find('li');

		nextindex = ifpnd(obj,true,null,tonext);
		previndex = ifpnd(obj,true,null,tonext - 2);

		$objli.eq(previndex).css({'left':'-100%'});
		$objli.eq(nextindex).css({'left':'100%'});
		
	};


	//默认值
	$.fn.fredslide.defaults = {
		Prev : 'prev',
		Next : 'next',
		StartInex: 0,
		SwitchTime : 800,
		SwitchStyle:'fade',
		Dot : true,
		AutoPlay : false,
		AutoTime : 1000,
		AutoDelay : 2000,
		Aneasing : 'easeOutQuad'
	};

})(jQuery);


jQuery.easing['jswing'] = jQuery.easing['swing'];
jQuery.extend( jQuery.easing,
{
	def: 'easeOutQuad',
	swing: function (x, t, b, c, d) {
		//alert(jQuery.easing.default);
		return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
	},
	easeOutQuad: function (x, t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},
	easeOutQuart: function (x, t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	}
});











