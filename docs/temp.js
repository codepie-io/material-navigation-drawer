(function ($) {

    "use strict";

    let DATA_KEY = 'ca.drawer';
    let EVENT_KEY = DATA_KEY + '.';

    let Event = {
        HIDE: EVENT_KEY + 'hide',
        HIDDEN: EVENT_KEY + 'hidden',
        SHOW: EVENT_KEY + 'show',
        SHOWN: EVENT_KEY + 'shown',
        CLICK_DISMISS: EVENT_KEY + 'click.dismiss'
    };

    let Selector = {
        DIALOG: '.md-drawer',
        DATA_TOGGLE: '[data-toggle="drawer"]'
    };

    let MaterialDrawer = function () {

        let MaterialDrawer = function (element, config) {
            this.$button = $(element);
            this.painted = false
            this.init_(config)
        };

        MaterialDrawer.prototype.VERSION = '1.0';

        MaterialDrawer.prototype.Default = {
            'darkColor': '#fff',
            'darkBackground': '#212121',
            'lightColor': '#212121',
            'lightBackground': '#fff'
        };


        MaterialDrawer.prototype.init_ = function (config) {
            this.config = $.extend({}, this.Default, config);
            this.$button.on('click', this.toggle.bind(this))
        };

        MaterialDrawer.prototype.toggle = function () {
            console.log(this.VERSION)
            this.painted ? this.paintLight() : this.paintDark();
        }

        MaterialDrawer.prototype.paintLight = function () {
            $('body').css({'color': this.config.lightColor, 'background-color': this.config.lightBackground})
            this.painted = false;
        }

        MaterialDrawer.prototype.paintDark = function () {
            $('body').css({'color': this.config.darkColor, 'background-color': this.config.darkBackground})
            this.painted = true;
        }



        MaterialDrawer.Plugin_ = function Plugin_(config) {
            return this.each(function () {
                let $this = $(this);
                let data = $this.data(DATA_KEY);
                if (!data) {
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

    $.fn.MaterialDrawer = MaterialDrawer.Plugin_;
    $.fn.MaterialDrawer.Constructor = MaterialDrawer;
    $.fn.MaterialDrawer.noConflict = function () {
        $.fn.MaterialDrawer = MaterialDrawer;
        return MaterialDrawer.Plugin_;
    };
}(jQuery));