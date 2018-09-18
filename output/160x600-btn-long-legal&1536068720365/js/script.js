$(document).ready(function() {

    $('.js-banner-wrapper').slick({
        dots: false,
        arrows : false,
        infinite: true,
        autoplay: true,
        slideToShow : 1
    });


    function loopImages(main,anim,id){
        var trigger = false;

        let timerId = setTimeout(function tick() {
            trigger = !trigger;
            assignNewBackground(main,anim,trigger,id);

            timerId = setTimeout(tick, 1000);
        }, 1000);

    }


    function assignNewBackground(main ,anim, trigger, id){
        if(trigger == true){
            trigger = false;
            $('.js-banner[data-id=' + id + ']').css('background-image',main);
        }else if(trigger == false){
            trigger = true;
            $('.js-banner[data-id=' + id + ']').css('background-image','url("./img/' + anim + '")');
        }
    }

    $( ".js-banner" ).each(function( index ) {
        var anim = $(this).data('animated');
        var id = $(this).data('id');
        var background = $(this).css('background-image');
        if(anim != false){
            loopImages(background,anim,id);
        }

    });

    function legalSlider(){
        $('.legalNote>p').css('transition-duration' , '13s');
        $('.legalNote>p').css('margin-left' , -differnce);
        setTimeout(function(){
            $('.legalNote>p').css('transition-duration' , '0s');
            $('.legalNote>p').css('margin-left' , 5);
            setTimeout(function(){
                legalSlider();
            },100);
        }, 13000);
    }


    if($('.js-banner-wrapper').hasClass('long-legal-notes') && !$('.legalNote-long').hasClass('w-120') && !$('.legalNote-long').hasClass('w-160')){
        var innerLength = $('.legalNote>p').css('width');
        var width  = $('.legalNote').css('width');
        innerLength = innerLength.substring(0,innerLength.length - 2);
        width = width.substring(0,width.length - 2);
        innerLength = parseInt(innerLength);
        width = parseInt(width);
        var differnce = innerLength - width;
        differnce = differnce + 20;
        legalSlider();
    }








});











