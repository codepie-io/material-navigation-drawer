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

    var MaterialDrawer = function (){

        var MaterialDrawer  = function(element, config) {
            this.$drawer_ = $(element);
            this.isShown_ = false;
            this.isAnimating_ = false;
            this.startX_ = 0;
            this.currentX_ = 0;
            this.touchingDrawer_ = false;
            this.init_(config);
        };

        MaterialDrawer.prototype.VERSION = '1.0';

        MaterialDrawer.prototype.Default = {
            show: true,
            permanent: false,
            fullHeight:false,
            temporary: true,
            persistent: false,
            mini: false,
            touch: true,
            miniVariant: false
        };

        MaterialDrawer.prototype.Classes_ = {
            DIALOG_SURFACE: 'md-drawer__surface',
            SHADOW: 'md-drawer__shadow',
            IS_VISIBLE: 'md-drawer--visible',
            DRAWER_ANIMATING: 'md-drawer--animating',
            BODY_CLASS: 'is-drawer-open',
            BODY_PERMANENT: 'has-permanent-drawer',
            PERMANENT: 'md-drawer--permanent',
            PERMANENT_FULL_HEIGHT: 'md-drawer--permanent-full-height',
            PERMANENT_MINI_VARIANT: 'md-drawer--permanent-mini-variant',
            BODY_PERMANENT_FULL_HEIGHT: 'has-permanent-drawer--full-height',
            PERMANENT_FLOATING: 'has-permanent-floating-drawer'
        };

        MaterialDrawer.prototype.init_ = function (config) {
            if(this.$drawer_.length){
                this.config = $.extend({}, this.Default, config);
                this.$drawerSurface_ = this.$drawer_.find('.'+this.Classes_.DIALOG_SURFACE);
                this.$drawerShadow_ = this.$drawer_.find('.'+this.Classes_.SHADOW);
                this.boundShowDrawer_ = this.show.bind(this);
                this.boundOnTouchStart_ = this.onTouchStart_.bind(this);
                this.boundIgnoreClicks_ = this.ignoreClick_.bind(this);
                this.boundHideDrawer_ = this.hide.bind(this);
                this.boundOnTouchMove_ = this.onTouchMove_.bind(this);
                this.boundOnTransitionEnd_ = this.onTransitionEnd_.bind(this);
                this.update_ = this.update_.bind(this);
                this.boundOnTouchEnd = this.onTouchEnd_.bind(this);
                this.$drawerSurface_.on('click',this.boundIgnoreClicks_);
                this.$drawerShadow_.on('click',this.boundHideDrawer_);
                if(this.config.touch){
                    this.$drawerShadow_.on('touchstart',this.boundOnTouchStart_);
                    this.$drawerShadow_.on('touchmove',this.boundOnTouchMove_);
                    this.$drawerShadow_.on('touchend',this.boundOnTouchEnd);
                }
                this.drawerWidth = this.$drawerSurface_.width();
                this.setDrawerClass_();
                (this.config.show && config!=='string')?this.show():'';
            }
        };

        MaterialDrawer.prototype.show = function () {
            if(this.isShown_ || this.isAnimating_)
                return;
            this.$drawer_.trigger(Event.SHOW);
            this.$drawer_.addClass(this.Classes_.DRAWER_ANIMATING).addClass(this.Classes_.IS_VISIBLE);
            this.isAnimating_ = true;
            this.isShown_ = true;
            this.setBodyClass_();
            this.$drawer_.on('transitionend', this.boundOnTransitionEnd_);
        };
        MaterialDrawer.prototype['show'] = MaterialDrawer.prototype.show;

        MaterialDrawer.prototype.hide = function () {
            //|| (this.config.permanent && $(window).width()>959)
            if(!this.isShown_ || this.isAnimating_)
                return;
            this.$drawer_.trigger(Event.HIDE);
            this.isShown_ = false;
            this.setBodyClass_();
            this.$drawer_.addClass(this.Classes_.DRAWER_ANIMATING)
                .removeClass(this.Classes_.IS_VISIBLE);
            this.$drawer_.on('transitionend', this.boundOnTransitionEnd_)
        };
        MaterialDrawer.prototype['hide'] = MaterialDrawer.prototype.hide;

        MaterialDrawer.prototype.toggle = function () {
            this.isShown_? this.hide() : this.show();
        };
        MaterialDrawer.prototype['toggle'] = MaterialDrawer.prototype.toggle;

        MaterialDrawer.prototype.setBodyClass_ = function(){
            var $body = $('body');
            console.log(this.isShown_);
            if(this.isShown_){
                $body.addClass(this.Classes_.BODY_CLASS);
                if(this.config.permanent){
                    this.$drawer_.addClass(this.config.BODY_PERMANENT);
                    if(this.config.fullHeight){
                        $body.addClass(this.Classes_.BODY_PERMANENT_FULL_HEIGHT);
                        this.$drawer_.addClass(this.Classes_.PERMANENT_FULL_HEIGHT)
                    }
                    if(this.config.miniVariant){
                        this.$drawer_.addClass(this.Classes_.PERMANENT_MINI_VARIANT)
                    }
                }
            }else{
                $body.removeClass(this.Classes_.BODY_CLASS);
            }
        };

        MaterialDrawer.prototype.ignoreClick_ = function (e) {
            e.stopPropagation();
        };

        MaterialDrawer.prototype.onTouchStart_ = function (e) {
            if(!this.$drawer_.hasClass(this.Classes_.IS_VISIBLE))
                return;
            this.startX_ = e.originalEvent.touches[0].pageX;
            this.currentX_ = this.startX_;
            this.touchingDrawer_ = true;
            requestAnimationFrame(this.update_);
        };

        MaterialDrawer.prototype.onTouchMove_ = function (e) {
            if(!this.touchingDrawer_)
                return;
            this.currentX_ = e.originalEvent.touches[0].pageX;
        };

        MaterialDrawer.prototype.onTouchEnd_ = function (e) {
            if(!this.touchingDrawer_)
                return;
            this.touchingDrawer_ = false;
            var translateX = Math.min(0,this.currentX_ - this.startX_);
            this.$drawerSurface_.css('transform','');
            this.$drawerShadow_.css('opacity','');
            if((translateX < 0) && (translateX <  -140))
            {
                this.hide();
            }else {
                this.$drawer_.addClass(this.Classes_.DRAWER_ANIMATING);
                this.$drawer_.on('transitionend', this.boundOnTransitionEnd_)
            }
        };

        MaterialDrawer.prototype.onTransitionEnd_ = function () {
            this.$drawer_.removeClass(this.Classes_.DRAWER_ANIMATING);
            this.isAnimating_ = false;
            this.$drawerSurface_.unbind('transitionend',this.boundOnTransitionEnd_);
            if(this.isShown_){
                this.$drawer_.trigger(Event.SHOWN);
                this.$drawerSurface_.attr('aria-hidden', false);
            } else{
                this.$drawer_.trigger(Event.HIDDEN);
                this.$drawerSurface_.attr('aria-hidden', true);
            }
        };

        MaterialDrawer.prototype.update_ = function () {
            if(!this.touchingDrawer_)
                return;
            requestAnimationFrame(this.update_);
            var translateX = Math.min(0, this.currentX_ - this.startX_);
            var opacityPercentage = 0;
            if(Math.abs(translateX) <= this.drawerWidth){
                opacityPercentage = (this.drawerWidth - Math.abs(translateX))/(this.drawerWidth);
            }
            this.$drawerSurface_.css('transform','translateX('+translateX+'px');
            this.$drawerShadow_.css('opacity',opacityPercentage);
        };

        MaterialDrawer.prototype.onSwipe_ = function(){
            this.show();
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