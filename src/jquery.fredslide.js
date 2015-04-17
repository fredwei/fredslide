(function ($) {
    $.fn.fredslide = function(options){
        var defaults = {
            // 是否自动轮播
            auto : false,
            // 自动轮播间隔时间
            delay : 3000,
            // 动画时间
            animateTime : 1200,
            // 动画速度的 easing 函数
            animateEasing : 'swing',
            // 从第几张图开始播放，第一张为0
            startSlide : 0,
            // 是否显示圆点
            hasDot : true,
            // 圆点父元素class
            dotClass : 'slide-dot',
            // 圆点的当前活动样式
            dotActiveClass : 'z-sel',
            // 圆点切换触发事件
            dotClick : 'click',
            // 是否显示左右切换按钮
            hasBtn : true,
            // 上一个按钮class
            prevClass : 'prev',
            // 下一个按钮class
            nextClass : 'next',
            // 是否支持触摸
            hasTouch : true,
            // 在动画完成之前是否禁止切换
            isPauseAnimate : false,
            // 消失的class
            outClass : 'slide-out',
            // 活动的class
            activeClass : 'slide-active',
            // 准备的class
            inClass : 'slide-in',
            // 初始化完成执行回调
            initSlide : function(slide){},
            // 开始切换之前执行回调
            beforSlide : function(slide){},
            // 切换完成之后执行回调
            afterSlide : function(slide){}
        };

        var options = $.extend(defaults, options);

        this.each(function(){
            loadSlide($(this));
        });

        // 初始化
        function loadSlide(obj){
            // 轮播对象
            obj.li = obj.find('li');
            // 轮播图数量
            obj.liLen = obj.li.length - 1;
            // 上一个
            obj.liPrev = options.startSlide - 1;
            obj.liPrev = (obj.liPrev<0) ? obj.liLen : obj.liPrev;
            // 当前
            obj.liActive = options.startSlide;
            // 下一个
            obj.liNext = options.startSlide + 1;
            obj.liNext = (obj.liNext>=obj.liLen) ? 0 : obj.liNext;
            // 自动轮播对象
            obj.autoTime = null;
            // 是否点击圆点
            obj.dotClicked = false;
            // 是否点击上一个按钮
            obj.prevClicked = false;

            // 轮播图数量少于2个则不做处理
            if(obj.liLen <= 1){
                obj.li.css({'opacity': 0, 'display': 'block'}).animate({'opacity': 1}, options.animateTime, options.animateEasing);
                return false;
            }

            // 圆点
            if(options.hasDot){
                dotSlide(obj);
            }

            // 左右按钮
            if (options.hasBtn) {
                prevNextSlide(obj);
            }
            
            // 触摸操作
            if (options.hasTouch) {
                touchSlide(obj);
            }

            // 执行轮播
            toSlide(obj);
        };

        // 自动切换
        function autoSlide(obj){

            clearTimeout(obj.autoTime);

            obj.autoTime = setTimeout(function(){
                toSlide(obj);
            },options.delay);
        };

        // 轮播切换
        function toSlide(obj){
            // 在动画完成之前是否禁止切换
            if(options.isPauseAnimate && obj.li.is(':animated')){
                return false;
            }

            // 点击圆点时切换当前页Idx
            if(obj.dotClicked){
                obj.liActive = obj.dotClickIdx;
                obj.dotClicked = false;
            }

            // 点击上一个按钮时切换当前页Idx
            if(obj.prevClicked){
                obj.liActive = (obj.liPrev - 1) < 0 ? obj.liLen : (obj.liPrev - 1);
                obj.prevClicked = false;
            }

            // 执行beforSlide回调函数
            options.beforSlide(obj);

            // 圆点样式
            obj.dotObj.find('span').eq(obj.liActive).addClass(options.dotActiveClass).siblings().removeClass(options.dotActiveClass);

            // 当前项隐藏
            obj.li.stop(true,true).eq(obj.liPrev).removeClass(options.activeClass + ' ' + options.inClass).addClass(options.outClass);
            obj.li.stop(true,true).eq(obj.liPrev).css({'opacity': 1}).animate({'opacity': 0}, options.animateTime, options.animateEasing, function(){
                $(this).hide();
                // 执行beforSlide回调函数
                options.afterSlide(obj);
            });

            // 下一张显示
            obj.li.eq(obj.liActive).removeClass(options.outClass + ' ' + options.inClass).addClass(options.activeClass);
            obj.li.eq(obj.liActive).css({'opacity': 0, 'display': 'block'}).animate({'opacity': 1}, options.animateTime, options.animateEasing);

            // 下一张准备
            obj.li.eq(obj.liNext).removeClass(options.activeClass + ' ' + options.outClass).addClass(options.inClass);
            obj.li.eq(obj.liNext).css({'opacity': 1}).animate({'opacity': 0});

            // 上一张、活动项、下一张指向改变
            obj.liPrev = obj.liActive;
            obj.liActive = (obj.liActive>=obj.liLen) ? 0 : (obj.liActive + 1);
            obj.liNext = (obj.liNext>=obj.liLen) ? 0 : (obj.liActive + 1);

            // 自动轮播
            if(options.auto){
                autoSlide(obj);
            }
        };

        // 圆点
        function dotSlide(obj){
            var dotHtml = [],
                $dotParent = $('<div class="'+ options.dotClass +'"></div>');

            obj.li.each(function(i){
                dotHtml.push('<span>'+ (i + 1) + '</span>');
            });

            $dotParent.append(dotHtml.join(''));
            obj.append($dotParent);
            obj.dotObj = $dotParent;

            // 圆点操作
            $dotParent.on(options.dotClick,'span',function(){
                if(!$(this).hasClass(options.dotActiveClass)){
                    clearTimeout(obj.autoTime);
                    obj.dotClicked = true;
                    obj.dotClickIdx = $(this).index();
                    toSlide(obj);
                }
            });
        };

        // 左右切换
        function prevNextSlide(obj){

            obj.append('<a class="'+ options.prevClass +'" href="javascript:void(0);">&lt;</a><a class="'+ options.nextClass +'" href="javascript:void(0);">&gt;</a>');

            obj.on('click','.' + options.prevClass + ',.' + options.nextClass,function(){
                clearTimeout(obj.autoTime);

                if($(this).hasClass(options.prevClass)){
                    obj.prevClicked = true;
                }

                toSlide(obj);
            });
        };

        // 触摸滑动操作
        function touchSlide(obj){
            if('ontouchend' in document){
                obj.moveLeft = false;
                obj.moveX = 0;

                obj.on('touchstart',function(e){
                    obj.moveX = touchX(e);
                }).on('touchend',function(e){
                    obj.moveLeft = (obj.moveX > touchX(e)) ? false : true;

                    clearTimeout(obj.autoTime);

                    if(obj.moveLeft){
                        obj.prevClicked = true;
                    }

                    toSlide(obj);
                });
            }
        };

        // 返回触摸时X轴的值
        function touchX(e){
            if(e.originalEvent.changedTouches){
                e = e.originalEvent.changedTouches[e.originalEvent.changedTouches.length-1];
            }
            return e.clientX + document.body.scrollLeft || e.pageX;
        };
    };
})(jQuery);