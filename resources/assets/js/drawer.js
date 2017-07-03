(function ($) {

    "use strict";

    var DATA_KEY = 'ca.drawer';
    var EVENT_KEY = DATA_KEY+'.';

    var Event = {
        HIDE: EVENT_KEY+'hide',
        HIDDEN: EVENT_KEY+'hidden',
        SHOW: EVENT_KEY+'show',
        SHOWN: EVENT_KEY+'shown',
        CLICK_DISMISS: EVENT_KEY+'click.dismiss'
    };

    var Selector = {
        DIALOG: '.md-drawer',
        DATA_TOGGLE: '[data-toggle="drawer"]'
    };

    var MaterialDrawer = function () {

        var MaterialDrawer = function (element, config) {
            this.$drawer_ = $(element);
            this.isShown_ = false;
            this.isAnimating_ = false;
            this.startX_ = 0;
            this.currentX_ = 0;
            this.touchingDrawer_ = false;
            this.currentXUp_ = 0;
            this.currentYUp_ = 0;
            this.startTime_ = 0;
            this.endTime_ = 0;
            this.init_(config);
        };

        MaterialDrawer.prototype.VERSION = '1.0';

        MaterialDrawer.prototype.Default = {
            show: true,
            permanent: false,
            fullHeight: false,
            temporary: true,
            persistent: false,
            mini: false,
            touch: true,
            miniVariant: false,
            swipe: true
        };

        MaterialDrawer.prototype.Classes_ = {
            DIALOG_SURFACE: 'md-drawer__surface',
            SHADOW: 'md-drawer__shadow',
            IS_VISIBLE: 'md-drawer--visible',
            IS_SWIPING: 'md-drawer--swiping',
            DRAWER_ANIMATING: 'md-drawer--animating',
            BODY_CLASS: 'is-drawer-open',
            BODY_PERMANENT: 'has-permanent-drawer',
            PERMANENT: 'md-drawer--permanent',
            PERMANENT_FULL_HEIGHT: 'md-drawer--permanent-full-height',
            PERMANENT_MINI_VARIANT: 'md-drawer--permanent-mini-variant',
            BODY_PERMANENT_FULL_HEIGHT: 'has-permanent-drawer--full-height',
            BODY_MINI_VARIANT: 'has-permanent-drawer--mini-variant',
            PERMANENT_FLOATING: 'has-permanent-floating-drawer'
        };

        MaterialDrawer.prototype.init_ = function (config) {
            if (this.$drawer_.length) {
                this.config = $.extend({}, this.Default, config);
                this.$drawerSurface_ = this.$drawer_.find('.' + this.Classes_.DIALOG_SURFACE);
                this.$drawerShadow_ = this.$drawer_.find('.' + this.Classes_.SHADOW);
                this.boundOnTouchStart_ = this.onTouchStart_.bind(this);
                this.boundOnTouchMove_ = this.onTouchMove_.bind(this);
                this.boundOnTouchEnd = this.onTouchEnd_.bind(this);
                this.boundIgnoreClicks_ = this.ignoreClick_.bind(this);
                this.boundHideDrawer_ = this.hide.bind(this);
                this.boundOnTransitionEnd_ = this.onTransitionEnd_.bind(this);
                this.update_ = this.update_.bind(this);
                this.$drawerSurface_.on('click', this.boundIgnoreClicks_);
                this.$drawerShadow_.on('click', this.boundHideDrawer_);
                if (this.config.touch) {
                    this.$drawerShadow_.on('touchstart', this.boundOnTouchStart_);
                    this.$drawerShadow_.on('touchmove', this.boundOnTouchMove_);
                    this.$drawerShadow_.on('touchend', this.boundOnTouchEnd);
                }
                this.drawerWidth_ = this.$drawerSurface_.width();
                this.setDrawerClass_();
                this.setSwipeGesture_();
                (this.config.show && config !== 'string') ? this.show() : '';
                this.setBodyClass_()
            }
        };

        MaterialDrawer.prototype.show = function () {
            if (this.isShown_ || this.isAnimating_)
                return;
            this.$drawer_.trigger(Event.SHOW);
            this.$drawer_.addClass(this.Classes_.DRAWER_ANIMATING).addClass(this.Classes_.IS_VISIBLE);
            this.isAnimating_ = true;
            this.isShown_ = true;
            var $body = $('body');
            $body.addClass(this.Classes_.BODY_CLASS);
            this.$drawer_.on('transitionend', this.boundOnTransitionEnd_);
        };
        MaterialDrawer.prototype['show'] = MaterialDrawer.prototype.show;

        MaterialDrawer.prototype.hide = function () {
            if (!this.isShown_ || this.isAnimating_)
                return;
            this.$drawer_.trigger(Event.HIDE);
            this.isShown_ = false;
            this.setBodyClass_();
            this.$drawer_.addClass(this.Classes_.DRAWER_ANIMATING)
                .removeClass(this.Classes_.IS_VISIBLE);
            var $body = $('body');
            $body.removeClass(this.Classes_.BODY_CLASS);
            this.$drawer_.on('transitionend', this.boundOnTransitionEnd_)
        };
        MaterialDrawer.prototype['hide'] = MaterialDrawer.prototype.hide;

        MaterialDrawer.prototype.toggle = function () {
            this.isShown_ ? this.hide() : this.show();
        };
        MaterialDrawer.prototype['toggle'] = MaterialDrawer.prototype.toggle;

        MaterialDrawer.prototype.setBodyClass_ = function () {
            var $body = $('body');
            if (this.config.permanent) {
                this.$drawer_.addClass(this.config.BODY_PERMANENT);
                if (this.config.fullHeight) {
                    $body.addClass(this.Classes_.BODY_PERMANENT_FULL_HEIGHT);
                    this.$drawer_.addClass(this.Classes_.PERMANENT_FULL_HEIGHT)
                }
                if (this.config.miniVariant) {
                    $body.addClass(this.Classes_.BODY_MINI_VARIANT);
                    this.$drawer_.addClass(this.Classes_.PERMANENT_MINI_VARIANT)
                }
            }
        };

        MaterialDrawer.prototype.ignoreClick_ = function (e) {
            e.stopPropagation();
        };

        MaterialDrawer.prototype.onTouchStart_ = function (e) {
            this.xDown_ = e.originalEvent.touches[0].clientX;
            this.yDown_ = e.originalEvent.touches[0].clientY;
            this.startTime_ = Math.floor(Date.now());
            if (!this.$drawer_.hasClass(this.Classes_.IS_VISIBLE))
                return;
            this.startX_ = e.originalEvent.touches[0].pageX;
            this.currentX_ = this.startX_;
            this.touchingDrawer_ = true;
            requestAnimationFrame(this.update_);
        };

        MaterialDrawer.prototype.onTouchMove_ = function (e) {
            this.currentXUp_ = e.originalEvent.touches[0].clientX;
            this.currentYUp_ = e.originalEvent.touches[0].clientY;
            if (!this.touchingDrawer_)
                return;
            this.currentX_ = e.originalEvent.touches[0].pageX;
        };

        MaterialDrawer.prototype.onTouchEnd_ = function (e) {
            if (!this.touchingDrawer_)
                return;
            this.touchingDrawer_ = false;
            var translateX = Math.min(0, this.currentX_ - this.startX_);
            this.$drawerSurface_.css('transform', '');
            this.$drawerShadow_.css('opacity', '');


            this.endTime_ = Math.floor(Date.now());


            if (!this.xDown_ || !this.yDown_) {
                return;
            }


            var xDiff = this.xDown_ - this.currentXUp_;
            var yDiff = this.yDown_ - this.currentYUp_;

            if (Math.abs(xDiff) > Math.abs(yDiff)) {/*most significant*/
                if (xDiff > 0) {
                    if (xDiff > 60 && (Math.abs(this.startTime_ - this.endTime_) > 0) && (Math.abs(this.startTime_ - this.endTime_) < 100)) {
                        this.hide();
                        this.xDown_ = 0;
                        
                        this.startTime_ = 0;
                        this.endTime_ = 0;
                        return;
                    }
                } else {
                    /* right swipe */
                    console.log('right swipe');
                    console.log(Math.abs(this.startTime_ - this.endTime_));
                    //if(Math.abs(this.startTime_ - this.endTime_) > )
                }
            } else {
                if (yDiff > 0) {
                    /* up swipe */
                    console.log('up swipe')
                } else {
                    /* down swipe */
                    console.log('down swipe')
                }
            }
            this.xDown_ = 0;
            

            if ((translateX < 0) && (translateX < -140)) {
                this.hide();
            } else {
                this.$drawer_.addClass(this.Classes_.DRAWER_ANIMATING);
                this.$drawer_.on('transitionend', this.boundOnTransitionEnd_)
            }
            //reset time
            this.startTime_ = 0;
            this.endTime_ = 0;
        };

        MaterialDrawer.prototype.onSwipeTouchStart_ = function (e) {
            this.xDown_ = e.originalEvent.touches[0].clientX;
            this.yDown_ = e.originalEvent.touches[0].clientY;
            this.startTime_ = Math.floor(Date.now());
            if (this.$drawer_.hasClass(this.Classes_.IS_VISIBLE))
                return;
            this.$drawer_.addClass(this.Classes_.IS_SWIPING);
            this.startX_ = e.originalEvent.touches[0].pageX;
            this.currentX_ = this.startX_;
            this.touchingSwipe_ = true;
            requestAnimationFrame(this.updateOnSwipe_);
        };

        MaterialDrawer.prototype.onSwipeTouchMove_ = function (e) {
            this.currentXUp_ = e.originalEvent.touches[0].clientX;
            this.currentYUp_ = e.originalEvent.touches[0].clientY;
            if (!this.touchingSwipe_)
                return;
            this.currentX_ = e.originalEvent.touches[0].pageX;
        };

        MaterialDrawer.prototype.onSwipeTouchEnd_ = function (e) {
            if (!this.touchingSwipe_)
                return;
            this.touchingSwipe_ = false;
            var translateX = Math.max(0, this.currentX_ - this.startX_);
            this.$drawerSurface_.css('transform', '');
            this.$drawerShadow_.css('opacity', '');
            this.endTime_ = Math.floor(Date.now());
            var xDiff = this.xDown_ - this.currentXUp_;
            var yDiff = this.yDown_ - this.currentYUp_;
            if (Math.abs(xDiff) > Math.abs(yDiff)) {
                if (xDiff > 60 && (Math.abs(this.startTime_ - this.endTime_) > 0) && (Math.abs(this.startTime_ - this.endTime_) < 100)) {
                    this.show();
                    this.xDown_ = 0;
                    this.startTime_ = 0;
                    this.endTime_ = 0;
                    return;
                }
            }
            this.xDown_ = 0;
            if ((translateX > 140)) {
                this.show();
            } else {
                this.$drawer_.addClass(this.Classes_.DRAWER_ANIMATING);
                this.$drawer_.on('transitionend', this.boundOnTransitionEnd_)
            }
            this.$drawer_.removeClass(this.Classes_.IS_SWIPING);
            //reset time
            this.startTime_ = 0;
            this.endTime_ = 0;
        };

        MaterialDrawer.prototype.onTransitionEnd_ = function () {
            this.$drawer_.removeClass(this.Classes_.DRAWER_ANIMATING);
            this.isAnimating_?this.isAnimating_=false:'';
            //this.is?this.isAnimating_=false:'';
            this.$drawerSurface_.unbind('transitionend', this.boundOnTransitionEnd_);
            if (this.isShown_) {
                this.$drawer_.trigger(Event.SHOWN);
                this.$drawerSurface_.attr('aria-hidden', false);
            } else {
                this.$drawer_.trigger(Event.HIDDEN);
                this.$drawerSurface_.attr('aria-hidden', true);
            }
        };

        MaterialDrawer.prototype.update_ = function () {
            if (!this.touchingDrawer_)
                return;
            requestAnimationFrame(this.update_);
            var translateX = Math.min(0, this.currentX_ - this.startX_);
            var opacityPercentage = 0;
            if (Math.abs(translateX) <= this.drawerWidth_) {
                opacityPercentage = (this.drawerWidth_ - Math.abs(translateX)) / (this.drawerWidth_);
            }
            this.$drawerSurface_.css('transform', 'translateX(' + translateX + 'px');
            this.$drawerShadow_.css('opacity', opacityPercentage);
        };

        MaterialDrawer.prototype.updateOnSwipe_ = function () {
            if (!this.touchingSwipe_)
                return;
            requestAnimationFrame(this.updateOnSwipe_);
            var translateX = Math.abs(Math.min(0, this.startX_ - this.currentX_));
            translateX = Math.min(this.drawerWidth_, translateX);
            console.log(translateX);
            //return ;
            var opacityPercentage = 0;
            if((this.drawerWidth_ - translateX) !=0){
                opacityPercentage = (translateX) / (this.drawerWidth_);
            }else{
                opacityPercentage = 1;
            }
            this.$drawerSurface_.css('transform', 'translateX(' + Math.min(0, (- this.drawerWidth_+ translateX)) + 'px');
            this.$drawerShadow_.css('opacity', opacityPercentage);
        };

        MaterialDrawer.prototype.setSwipeGesture_ = function () {
            if (this.config.swipe) {
                this.$swipe = $('.md-drawer-swipe');
                if (this.$swipe.length){
                    this.updateOnSwipe_ = this.updateOnSwipe_.bind(this);
                    this.boundSwipeOnTouchStart_ = this.onSwipeTouchStart_.bind(this);
                    this.boundSwipeOnTouchMove_ = this.onSwipeTouchMove_.bind(this);
                    this.boundSwipeOnTouchEnd = this.onSwipeTouchEnd_.bind(this);
                    this.$swipe.on('touchstart', this.boundSwipeOnTouchStart_);
                    this.$swipe.on('touchmove', this.boundSwipeOnTouchMove_);
                    this.$swipe.on('touchend', this.boundSwipeOnTouchEnd);
                }
            }
        };

        MaterialDrawer.prototype.setDrawerClass_ = function() {
            if(this.config.permanent) {
                this.$drawer_.addClass(this.Classes_.PERMANENT);
                $('body').addClass(this.Classes_.BODY_PERMANENT);
            }
        };

        MaterialDrawer.Plugin_ = function Plugin_(config) {
            return this.each(function () {
                var $this = $(this);
                var data  = $this.data(DATA_KEY);
                if (!data){
                    $this.data(DATA_KEY, (data = new MaterialDrawer(this, config)));
                }
                if (typeof config === 'string') {
                    if (data[config] === undefined) {
                        throw new Error('No method named "' + config + '"');
                    }
                    data[config]();
                }
            });
        };
        return MaterialDrawer;
    }();

    /**
     * -----------------------
     * Data Api
     * -----------------------
     */
    $(document).on('click', Selector.DATA_TOGGLE, function (event) {
        var $this = $(this);
        if (this.tagName === 'A') {
            event.preventDefault();
        }
        var target = $this.attr('data-target');
        if(typeof target === typeof undefined){
            throw new Error('Target Dialog not specified.');
            return;
        }
        var config = $(target).data(DATA_KEY) ? 'toggle' : $.extend({}, $(target).data(), $(this).data());
        MaterialDrawer.Plugin_.call($(target), config);
    });

    $.fn.MaterialDrawer = MaterialDrawer.Plugin_;
    $.fn.MaterialDrawer.Constructor = MaterialDrawer;
    $.fn.MaterialDrawer.noConflict = function () {
        $.fn.MaterialDrawer = MaterialDrawer;
        return MaterialDrawer.Plugin_;
    };
}( jQuery ));