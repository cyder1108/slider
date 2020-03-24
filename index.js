"use strict";
const EventEmitter = require("events").EventEmitter
const $ = require("jquery")
const _ = require("lodash")
module.exports = class Slider extends EventEmitter {

  constructor(wrapper) {
    super();
    this.wrapper = wrapper;
    this.$wrapper = $(this.wrapper);
    this.current    = 0;
    this.displayNum = 3;
    this.slideUnit  = 1;
    this.space      = 30;
    this.itemWidth = 0;
    this.slideTerm = 300;
    this.prevButton = document.createElement('div');
    this.nextButton = document.createElement('div');
  }

  init() {
    this.$inner = this.$wrapper.children();
    this.$items = this.$inner.children();
    this.itemWidth = this.itemWidth || this.calcItemWidth();
    this.adjustInnerStyles();
    this.adjustItemStyles();

    this.$prevButton = $(this.prevButton);
    this.$prevButton.on( "click", () => this.clickPrevButton() );

    this.$nextButton = $(this.nextButton);
    this.$nextButton.on( 'click', () => this.clickNextButton() );

    if( this.allowFlickSlide ) {
      this.bindFlickActions();
    }
  }

  slide(term = this.slideTerm) {
    if( term > this.slideTerm ){
      term = this.slideTerm;
    }
    this.$inner.animate({
      marginLeft: `${this.offsetLeft()}px`
    }, term);

    this.$items.each( (i,el) => {
      if( this.current <= i && i < this.current + this.displayNum ) {
        $(el).addClass("is-active").removeClass("is-inactive");
      } else {
        $(el).addClass("is-inactive").removeClass("is-active");
      }
    });
  }

  slideToPrev(term = this.slideTerm) {
    this.current -= this.slideUnit;
    if( this.current < 0 ) {
      this.current = 0;
    }
    this.slide(term);
  }

  slideToNext(term = this.slideTerm) {
    let last = this.current;
    this.current += this.slideUnit;
    if( this.current >= this.$items.length ) {
      this.current = last;
    }
    this.slide(term);
  }

  offsetLeft() {
    return this.current * (this.itemWidth + this.space) * -1;
  }

  calcItemWidth() {
    return ( this.$wrapper.width() + this.space ) / this.displayNum - this.space;
  }

  adjustInnerStyles() {
    this.$inner.css({ display: "flex" });
    this.$inner.width( ( this.itemWidth + this.space ) * this.$items.length - this.space );
  }

  adjustItemStyles() {
    this.$items.css({
      marginRight: this.space,
      boxSizing: "border-box",
      minWidth: `${this.itemWidth}px`,
      maxWidth: `${this.itemWidth}px`,
    });
  }

  clickPrevButton() {
    this.slideToPrev()
  }

  clickNextButton() {
    this.slideToNext()
  }

  bindFlickActions() {
    this.flickstart   = { time: null, x: null, y: null }
    this.flickcurrent = { time: null, x: null, y: null }
    this.flicklast    = { time: null, x: null, y: null }
    this.flickvelocity = 0
    this.flicklength   = 0
    this.flickcanceled = false

    this.$inner.on( 'touchstart', (e) => {
      this.flickcanceled = false
      this.flickstart   = { time: (+new Date), x: e.touches[0].clientX, y: e.touches[0].clientY }
      this.flickcurrent = { time: this.flickstart.time, x: this.flickstart.x }
      this.flicklast    = { time: this.flickcurrent.time, x: this.flickcurrent.x }
    });

    this.$inner.on( 'touchmove', (e) => {
      if( !this.flickcanceled ) {
        this.flickcurrent = { time: (+new Date), x: e.touches[0].clientX, y: e.touches[0].clientY };
        let term   = this.flickcurrent.time - this.flicklast.time;
        let length = this.flickcurrent.x - this.flicklast.x;
        this.flickvelocity = length / term;
        this.flicklength   = -( this.flickstart.x - this.flickcurrent.x );

        if( Math.abs( this.flickstart.x - this.flickcurrent.x) > Math.abs( this.flickstart.y - this.flickcurrent.y) ) {
          e.preventDefault()
          this.$inner.css({marginLeft: `${this.offsetLeft() + this.flicklength}px` });
        } else {
          this.flickcanceled = true;
          this.slide();
        }

        this.flicklast = { time: this.flickcurrent.time, x: this.flickcurrent.x, y: this.flickcurrent.y };
      }
    });

    this.$inner.on( 'touchend', (e) => {
      if( !this.flickcanceled ) {
        this.flickstart   = { time: null, x: null };
        this.flickcurrent = { time: null, x: null };
        this.flicklast    = { time: null, x: null };

        if( this.flickvelocity < -.5 || this.flicklength < -( this.itemWidth / 2 ) ) {
          var animatelength = this.itemWidth + this.space;
          var animateterm = animatelength / Math.abs(this.flickvelocity);
          this.slideToNext( animateterm );
        } else if( this.flickvelocity > .5 || this.flicklength > ( this.itemWidth / 2 ) ) {
          var animatelength = this.itemWidth + this.space;
          var animateterm = animatelength / Math.abs(this.flickvelocity);
          this.slideToPrev( animateterm );
        } else {
          this.slide();
        }

        this.flickvelocity = 0;
        this.flicklength   = 0;
      }
    });
  }

  flickLength() { return  -( this.flickstart.x - this.flickcurrent.x ); }
}
