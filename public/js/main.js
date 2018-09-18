$(document).ready(function(){


    var isGeneratedSomething = false;
    var numberOfSlides = 1; //current number of slides shown
    var slidesLimit = 10; // maximum number of slides, it should be equal to to
    var outputHtml; // here we will store generated html for our banner
    var backgroundArray = []; //we will use this array to send backgrounds data to the server
    var generatedFolderName;
    var SLIDER_WIDTH;
    var SLIDER_HEIGHT;
    var sliderContent = []; // we will use this array to store and than save to json each separate slide content

    var load_old_banner = localStorage.getItem('load-old-banner');
    var banner_to_load = localStorage.getItem('banner-to-load');

    var bannerLinkTrigger = $('.js-template-list-item.selected').data('link');




    if(bannerLinkTrigger == true){
        $('.js-content-field-wrapper').addClass('withLink');
    }else{
        $('.js-content-field-wrapper').removeClass('withLink');
    }


    //LOADING OLD BANNER IF localStorage.load-old-banner == 'true'


    if(load_old_banner == 'true'){
        localStorage.setItem('load-old-banner', 'false');

        $.getJSON('../../banners_html.json'  , function (data) {
            var data = data['banners_html'];
            var index;
            var toggle = false;
            for(var x=0;x < data.length; x++){
                if(data[x].folder_name == banner_to_load){
                    var index = x;
                    toggle = true;
                    break;
                }
            }

            if(toggle){
                $.ajax({
                    type : 'POST',
                    url : '/copyImagesFromOutput',
                    data : {folderName : banner_to_load},
                    success : function(response){

                    },
                    error : function(err){
                        console.log(err);
                        alert('Error while downloading info to edit banner -> ' + banner_to_load);
                    }
                });

                var outputData = data[index];
                var outputContent = outputData.slides_content;
                var legalNote = data[index].legal_note;
                var legalNoteType = data[index].legalNoteType;



                if(legalNote.length > 0){
                    if(legalNoteType == 'short'){
                        $('.js-legal-note-short').val(legalNote);
                        $('.js-input-legal-label').addClass('active');
                    }else if(legalNoteType == 'long'){
                        $('.js-short-legalNotes').toggleClass('hide');
                        $('.js-long-legalNotes').toggleClass('hide');
                        $('.js-custom-checkboxes').toggleClass('disabled');
                        $('.js-legal-notes-trigger').addClass('active');
                        $('.js-legal-note-long').val(legalNote);
                        $('.js-longLegalNote-label').addClass('active');
                    }
                }


                var templateType = outputData.template;
                $('.js-template-list-item').removeClass('selected');

                $('.js-template-list-item[data-type=' + templateType + ']').addClass('selected');
                $('.js-template').html($('.js-template-list-item[data-type=' + templateType + ']').html());

                numberOfSlides = outputContent.length;


                $('.js-title').val(outputData.title);
                $('.js-title').parent().find('.js-input-floating-label').addClass('active');
                $('.js-size-select[data-width=' + outputData.width + ']').addClass('selected');
                for(var z = 0; z < outputContent.length; z++){
                    var id = z+1;
                    $('.content-fields-single[data-id=' + id + ']').removeClass('hide');
                    $('.js-select-main-background[data-id=' + id +']').addClass('active');
                    $('.js-main-background-name[data-id=' + id + ']').html(outputContent[z].mainImage);
                    $('.js-input-file-gray-img[data-id=' + id +']').removeClass('hide');

                    $('.js-main-text[data-id=' + id + ']').val(outputContent[z].mainText);
                    $('.js-additional-text[data-id=' + id + ']').val(outputContent[z].additionalText);
                    $('.js-input-floating-label[data-inputid=' + id +']').addClass('active');
                    $('.js-input-floating-label[data-inputid2=' + id +']').addClass('active');

                    $('.js-main-image-preview[data-id=' + id + ']').removeClass('hide');
                    var mainUrl =  'url(./public/img/' + outputContent[z].mainImage + ')';

                    $('.js-main-image-preview[data-id=' + id + ']').css('background-image' , mainUrl);


                    if(outputContent[z].additionalImage != undefined){
                        $('.js-input-floating-label[data-inputid=' + id + ']').css('transition-duration' , '0s');
                        $('.js-input-floating-label[data-inputid2=' + id + ']').css('transition-duration' , '0s');
                        $('.js-input-floating-label[data-inputid=' + id + ']').toggleClass('animated');
                        $('.js-input-floating-label[data-inputid2=' + id + ']').toggleClass('animated');
                        $('.js-custom-checkboxes[data-id=' + id + ']').toggleClass('disabled');
                        $('.js-disable-anim-movableElement[data-id=' + id + ']').toggleClass('active');
                        $('.js-anim-custom-checkbox[data-id=' + id + ']').toggleClass('active');
                        $('.js-content-field-wrapper[data-id=' + id + ']').toggleClass('active');
                        $('.js-select-anim-background[data-id=' + id + ']').toggleClass('hide-opacity');
                        $('.js-anim-file-wrapper[data-id=' + id + ']').toggleClass('hide-opacity');
                        $('.js-input-floating-label[data-inputid=' + id + ']').css('transition-duration' , '0.2s');
                        $('.js-input-floating-label[data-inputid2=' + id + ']').css('transition-duration' , '0.2s');



                        $('.js-select-anim-background[data-id=' + id + ']').addClass('active');
                        $('.js-anim-background-name[data-id=' + id + ']').html(outputContent[z].additionalImage);

                        $('.js-anim-image-preview[data-id=' + id + ']').removeClass('hide');
                        var animUrl = 'url(./public/img/' + outputContent[z].additionalImage + ')';
                        $('.js-anim-image-preview[data-id=' + id + ']').css('background-image' , animUrl);

                    }
                }
            }
        });
    }







    //hide droped menu on outside click
    $('body').on('click' , function(e){
        var classes = e.target.attributes[0].nodeValue;

        //banner template
        var firstCheck = classes.indexOf('js-template-list-item');
        var secondCheck = classes.indexOf('settings-template');
        if(firstCheck < 0  && secondCheck < 0){
            $('.js-template-list').addClass('hide');
        }

        //banner font
        var fontCheck = classes.indexOf('js-font-item');
        var fontCheck2 = classes.indexOf('js-select-font');

        if(fontCheck < 0 && fontCheck2 < 0){
            $('.js-font-list').addClass('hide');
        }
    });








    $('.js-delete-slide').on('click' , function(){
        var id = $(this).data('id');
        $('.js-content-field-wrapper[data-id=' + id + ']').addClass('hide');
    });



    $('.js-select-font').on('click' , function(){
        $('.js-font-list').toggleClass('hide');
    });


    $('.js-font-item').on('click'  , function(){
        $('.js-font-item').removeClass('selected');
        $(this).addClass('selected');

        $('.js-font-list').toggleClass('hide');
        $('.js-select-font').html($(this).html());
    });



    $('.js-template-list-item').on('click' , function(){
        $('.js-template-list-item').removeClass('selected');
        $(this).addClass('selected');
        var templateName = $(this).html();
        $('.js-template').html(templateName);
        $('.js-template-list').toggleClass('hide');
        if($(this).data('link') == true){
            $('.js-content-field-wrapper').addClass('withLink');
        }else{
            $('.js-content-field-wrapper').removeClass('withLink');
        }
    });


    $('.js-template').on('click' , function(){
        $('.js-template-list').toggleClass('hide');
    });


    $('.js-legal-note-long').on('focusin' , function(){
        $('.js-longLegalNote-label').addClass('active');
    });


    $('.js-legal-note-long').on('focusout' , function(){
        if($(this).val().length <= 0){
            $('.js-longLegalNote-label').removeClass('active');
        }
    });


    $('.js-input').on('focusin',function(e){
        if($(this).data('inputid2')){
            $(this).parent().find('.label-2').addClass('active');
        }else if($(this).data('inputid') != 99 && $(this).data('inputid') != undefined){
            $(this).parent().find('.label-1').addClass('active');
        }else if($(this).data('id') == 97){
            $(this).parent().find('.js-input-legal-label').addClass('active');
        }
        else{
            $(this).parent().find('.js-input-floating-label').addClass('active');
        }
    });


    $('.js-input').on('focusout',function(e){
        if($(this).val() <= 0){
            if($(this).data('id') == 97){
                $(this).parent().find('.js-input-legal-label').removeClass('active');
            }else{
                $(this).parent().find('.js-input-floating-label').removeClass('active');
            }
        }
    });



    $('.js-search-title-input').on('focusin',function(){
        $(this).parent().find('.js-search-label').addClass('active');
    });
    $('.js-search-title-input').on('focusout',function(){
        if($(this).val()<=0){
            $(this).parent().find('.js-search-label').removeClass('active');
        }
    });





    $('.js-search-title-input').on('input' , function(){
        var value = $(this).val().toLowerCase();

        $('.js-size-select').removeClass('selected');
        if(value.length <= 0){
            $('.js-search-label').removeClass('active');
        }else{
            $('.js-search-label').addClass('active');
        }

        $('.js-preview-item').each(function(){
            var title = $(this).data('title').toLowerCase();
            var result = title.indexOf(value);

            if(result < 0){
                $(this).addClass('hide');
            }else{
                $(this).removeClass('hide');
            }
        });
    });

    $('.js-content-field-wrapper[data-id=' + numberOfSlides + ']').removeClass('hide');


    // ?????????
    if(localStorage.size != undefined){
        $('.js-generate').css('pointer-events' , 'all');
    }



    //we used it when saving images was not automatical



    $('.js-main-header').on('click' , function(){
        location.reload();
    });


    $('.js-open-history').on('click' , function(){
        if(!$('.js-content').hasClass('hide')){
            $(this).html('Close banner history');
            $('.js-size-settings-wrapper>h2').html('Banners History');
        }else{
            $('.js-size-settings-wrapper>h2').html('select banner size');
            $(this).html('Open banner history');
        }

        $('.js-size-settings-wrapper>h2').toggleClass('history');
        $('.js-size-settings-wrapper>h3').toggleClass('hide');


        $('.js-big-plus').toggleClass('hide');

        $('.js-template-list').addClass('hide');

        $('.js-search').toggleClass('hide');
        $('.js-size-select').removeClass('selected');
        $('.js-size-settings-wrapper').toggleClass('active');
        $('.js-template').toggleClass('hide');
        $('.js-select-template-header').toggleClass('hide');
        $('.js-content').toggleClass('hide');
        $('.js-preview-wrapper').toggleClass('hide');
        $('.js-hide-when-history').toggleClass('hide');

    });


    $('.js-delete-filters').on('click' , function(){
        $('.js-search-title-input').val('');
        $('.js-size-select').removeClass('selected');
        $('.js-preview-item').removeClass('hide');
    });


    $.getJSON('../../banners_html.json'  , function (data) {
        var items = [];
        data = data['banners_html'];

        for(var x = 0; x < data.length  ; x++){
            var folderName = data[x].folder_name;
            folderName = folderName.substring(0,folderName.length-4);
            var tmp = data[x].html.replace(/.\/img/g,"./output/" + folderName + '/img');
            var tmp = tmp.replace(/js-banner/g," ");
            var time = data[x].date;
            var time = '<p class="date">' + time + "</p>";
            var width = data[x].width;
            var height = data[x].height;
            var titleOriginal = data[x].title;
            var blure = '';


            if(height >= 400){
                blure = "<div class='blure blure-height'></div>";
            }else if(width > 450){
                blure = "<div class='blure blure-width'></div>";
            }

            var html = $('.js-preview').html();
            var title = "<h4>" + data[x].title + "</h4>";
            var deleteButton = "<div class='js-delete-slider preview-deleteButton' data-name='" + data[x].folder_name  + "'><i class='fas fa-times delete'></i></div>";
            var editButton = "<div class='js-edit-slider preview-editButton' data-name='" + data[x].folder_name  + "'><i class='fas fa-edit edit'></i></div>";

            //var html = html + "<div class='flex preview-content-item js-preview-item' data-title='" + titleOriginal + "' data-height='" + height + "' data-width='" + width + "'><div class='time-del'>" + "<div class='del-edit-wrapper'>" + deleteButton + editButton +"</div>" + time +  "</div><a href='https://young-reef-52192.herokuapp.com/output/"  + data[x].folder_name + "'>" + title +  tmp + "</a>" +  blure + "</div>";

            $('.js-preview').append("<div class='flex preview-content-item js-preview-item' data-title='" + titleOriginal + "' data-height='" + height + "' data-width='" + width + "'><div class='time-del'>" + "<div class='del-edit-wrapper'>" + deleteButton + editButton +"</div>" + time +  "</div><a href='https://young-reef-52192.herokuapp.com/output/"  + data[x].folder_name + "'>" + title +  tmp + "</a>" +  blure + "</div>");

            //$('.js-preview').html(html);
        }

        //in history page some links appeared somewhy, so I used this script to delete unnecessary content
        $('.-wrapper').children('a:first-child').remove();
        var content = [];
        $('.banner').each(function(){
            content.push($(this).children('a').html());
        });
        var index = 0;
        $('.banner').each(function(){
            if(content[index] != undefined){
                $(this).empty();
                $(this).html(content[index]);
            }
            index++;
        });
    });

    $('.js-preview').on('click' , '.js-edit-slider' ,  function(e){
        var folderName = e.currentTarget.attributes[1].nodeValue;
        localStorage.setItem('load-old-banner' , true);
        localStorage.setItem('banner-to-load' , folderName);
        location.reload();
    });


    $('.js-preview').on('click' , '.js-delete-slider' ,  function(e){
        var folderName = e.currentTarget.attributes[1].nodeValue;
        trigger = confirm('Are you sure that you want to delete this banner?');
        if(trigger){
            $.ajax({
                type : 'POST',
                url : '/deleteBanner',
                data : {folderName : folderName},
                success : function(response){
                    alert('Item Deleted!');
                    location.reload();
                },
                error : function(err){
                    location.reload();
                }
            });
        }
    });


    $('.js-size-select').on('click' , function(){

        if(!$('.js-template').hasClass('hide')){
            var id = $(this).data('id');
            $('.js-size-select').removeClass('selected');
            $(this).addClass('selected');
            $('.js-generate').css('pointer-events','all');
        }else if($(this).hasClass('selected')){
            $('.js-preview-item').removeClass('hide');
            $(this).removeClass('selected');
        }else{
            $('.js-size-select').removeClass('selected');
            $(this).addClass('selected');
            var width = $(this).data('width');
            var height = $(this).data('height');
            $('.js-preview-item').addClass('hide');
            $('.js-preview-item[data-width=' + width + '][data-height=' + height +']').removeClass('hide');
        }


        var width  = $('.js-size-select.selected').data('width');
        var height  = $('.js-size-select.selected').data('height');
        SLIDER_WIDTH = width;
        SLIDER_HEIGHT = height;
    });

    $('.js-disable-anim').on('click' , function(){
        var id = $(this).data('id');

        if(id == 98){
            $('.js-short-legalNotes').toggleClass('hide');
            $('.js-long-legalNotes').toggleClass('hide');
        }


        $('.js-input-floating-label[data-inputid=' + id + ']').css('transition-duration' , '0s');
        $('.js-input-floating-label[data-inputid2=' + id + ']').css('transition-duration' , '0s');


        $('.js-input-floating-label[data-inputid=' + id + ']').toggleClass('animated');
        $('.js-input-floating-label[data-inputid2=' + id + ']').toggleClass('animated');



        $('.js-custom-checkboxes[data-id=' + id + ']').toggleClass('disabled');
        $('.js-disable-anim-movableElement[data-id=' + id + ']').toggleClass('active');
        $('.js-anim-custom-checkbox[data-id=' + id + ']').toggleClass('active');
        $('.js-content-field-wrapper[data-id=' + id + ']').toggleClass('active');

        $('.js-select-anim-background[data-id=' + id + ']').toggleClass('hide-opacity');
        $('.js-anim-file-wrapper[data-id=' + id + ']').toggleClass('hide-opacity');

        $('.js-input-floating-label[data-inputid=' + id + ']').css('transition-duration' , '0.2s');
        $('.js-input-floating-label[data-inputid2=' + id + ']').css('transition-duration' , '0.2s');

    });

    $('.js-select-main-background').mouseover(function(){
        var id = $(this).data('id');
        if($(this).val().length <= 0){
            $('.js-input-file-yellow-img[data-id=' + id + ']').removeClass('hide');
        }
    });
    $('.js-select-main-background').mouseleave(function(){
        var id = $(this).data('id');
        $('.js-input-file-yellow-img[data-id=' + id + ']').addClass('hide');
    });

    $('.js-select-anim-background').mouseover(function(){
        var id = $(this).data('id');
        if($(this).val().length <= 0){
            $('.js-input-file-anim-yellow-img[data-id=' + id + ']').removeClass('hide');
        }
    });
    $('.js-select-anim-background').mouseleave(function(){
        var id = $(this).data('id');
        $('.js-input-file-anim-yellow-img[data-id=' + id + ']').addClass('hide');
    });



    // Image preview functionality

    //MAIN

    var selectMainBackgroundArray = document.getElementsByClassName('js-select-main-background');

    for(var x=0;x < selectMainBackgroundArray.length; x++){
        selectMainBackgroundArray[x].addEventListener('change', readURlMain, true);
    }


    function readURlMain(){
        var file = $(this)[0].files[0];
        var id = $(this).data('id');
        var reader = new FileReader();


        $('.js-main-image-preview[data-id=' + id +']').removeClass('hide');

        reader.onloadend = function(){
            $('.js-main-image-preview[data-id=' + id + ']').css('background-image' , 'url(' + reader.result  +')');
        };
        if(file){
            reader.readAsDataURL(file);
        }else{
        }
    }

    //ANIM
    var selectAnimBackgroundArray = document.getElementsByClassName('js-select-anim-background');

    for(var x=0;x < selectAnimBackgroundArray.length; x++){
        selectAnimBackgroundArray[x].addEventListener('change', readURlAnim, true);
    }


    function readURlAnim(){
        var file = $(this)[0].files[0];
        var id = $(this).data('id');
        var reader = new FileReader();

        $('.js-anim-image-preview[data-id=' + id +']').removeClass('hide');

        reader.onloadend = function(){
            $('.js-anim-image-preview[data-id=' + id + ']').css('background-image' , 'url(' + reader.result  +')');
        };
        if(file){
            reader.readAsDataURL(file);
        }else{
        }
    }


    $('.js-select-main-background').change(function(){
        var id = $(this).data('id');
        var value = $(this).val(),
            path = value.split("\\"),
            file = path[path.length-1];

        $('.js-input-file-gray-img[data-id=' + id +']').removeClass('hide');
        $(this).addClass('active');
        $('.js-main-background-name[data-id=' + id + ']').closest('.js-main-background-name').html(file);
    });

    $('.js-select-anim-background').change(function(){
        var id = $(this).data('id');
        var value = $(this).val(),
            path = value.split("\\"),
            file = path[path.length-1];

        $('.js-input-file-anim-gray-img[data-id=' + id +']').removeClass('hide');


        $(this).addClass('active');
        $('.js-anim-background-name[data-id=' + id + ']').closest('.js-anim-background-name').html(file);
    });


    //  ADD SLIDE

    $('.js-add-slide').on('click' , function(){
        $('.js-remove-slide').removeClass('hide');
        numberOfSlides++;
        //if($('.js-content-field-wrapper[data-id=' + numberOfSlides + ']').length != 0){
        if(numberOfSlides < slidesLimit){
            $('.js-content-field-wrapper[data-id=' + numberOfSlides + ']').removeClass('hide');
        }else{
            alert('You exceed max. number of slides');
        }
        if(numberOfSlides > 1){
            $('.js-remove-slide').removeClass('hide');
        }
        if(numberOfSlides == slidesLimit){
            //$(this).addClass('hide');
        }
    });

    // REMOVE SLIDE

    $('.js-remove-slide').on('click' , function(){
        $('.js-add-slide').removeClass('hide');
        if(numberOfSlides != 1){
            $('.js-content-field-wrapper[data-id=' + numberOfSlides + ']').addClass('hide');
            numberOfSlides--;
        }
        if(numberOfSlides == 1){
            $(this).addClass('hide');
        }
    });


    function activateSlider(autoplaySpeed){
        if(autoplaySpeed){
            $('.js-banner-wrapper').slick({
                dots: false,
                arrows : true,
                infinite: true,
                autoplay: true,
                autoplaySpeed : autoplaySpeed,
                slideToShow : 1,
                prevArrow: $('.js-arrow-left'),
                nextArrow: $('.js-arrow-right')
            });
        }else{
            $('.js-banner-wrapper').slick({
                dots: false,
                arrows : true,
                infinite: true,
                autoplay: true,
                slideToShow : 1,
                prevArrow: $('.js-arrow-left'),
                nextArrow: $('.js-arrow-right')
            });
        }
    }



    function loopImages(main,anim,id){
        var trigger = false;

        let timerId = setTimeout(function tick() {
            trigger = !trigger;
            assignNewBackground(main,anim,trigger,id);

            timerId = setTimeout(tick, 1000);
        }, 1000);
    }


    function assignNewBackground(main,anim,trigger,id){
        if(trigger == true){
            trigger = false;
            $('.js-banner[data-id=' + id + ']').css('background-image','url("../public/img/' +  main + '")');
        }else if(trigger == false){
            trigger = true;
            $('.js-banner[data-id=' + id + ']').css('background-image','url("../public/img/' + anim + '")');
        }
    }

    function appendSliderPreview(x){
        $('.js-banner-wrapper').append('<a href="#" class="js-slide-link"><div class="banner js-banner" data-animated="false" data-id="' + x + '"><p class="js-banner-main-text" data-id="' + x + '"></p><p class="js-banner-additional-text" data-id="' + x + '"></p></div></a>');
    }


    function appendSliderPreviewWithLink(x){
        $('.js-banner-wrapper').append('<a href="#" class="js-slide-link"><div class="banner js-banner" data-animated="false" data-id="' + x + '"><p class="js-banner-main-text" data-id="' + x + '"></p><p class="js-banner-additional-text" data-id="' + x + '"></p><span class="link">Sign in</span></div></a>');
    }



    $('.js-generate').on('click' , function(){

        if(isGeneratedSomething){
            $('.js-outputContent').html('<div class="js-banner-wrapper output-slider" data-duration=""></div>');
        }
        var sizeID = $('.js-size-select.selected').data('id');
        var title  = $('.js-title').val();
        isGeneratedSomething = true;
        var width  = $('.js-size-select.selected').data('width');
        var height  = $('.js-size-select.selected').data('height');
        var trigger = true;
        SLIDER_WIDTH = width;
        SLIDER_HEIGHT = height;
        var legalNote;
        bannerLinkTrigger = $('.js-template-list-item.selected').data('link');

        if(!$('.js-legal-notes-trigger').hasClass('active')){
            legalNote = $('.js-legal-note-short').val();
            legalNote = "<div class='legalNote legalNote-short w-" + width + " '><p>" + legalNote + '</p></div>';
        }else{
            legalNote = $('.js-legal-note-long').val();
            legalNote = "<div class='legalNote legalNote-long  w-" + width + " '><p>" + legalNote + '</p></div>';
        }





        if(numberOfSlides <=1 ){
            $('.js-output-arrows').addClass('hide');
        }


        var templateType = $('.js-template-list-item.selected').data('type');


        if(width == undefined){
            alert('Please select banner size!');
            return ;
        }


        $('.js-banner-wrapper').css('width',width);
        $('.js-banner-wrapper').addClass(templateType);

        //check if all fields are filled
        if(title <= 0){
            alert('Title is empty, fill it , please!');
            return ;
            trigger=false;
        }
        if($('.js-legal-note-short').val().length == 0 && $('.js-legal-note-long').val().length == 0  ){
            alert('All legal notes fields are empty!');
            return ;
            trigger=false;
        }


        for(var i = 1; i <=numberOfSlides; i++){
            if(!$('.js-content-field-wrapper[data-id=' + i + ']').hasClass('hide')){


                if($('.js-content-field-wrapper[data-id=' + i + ']>.js-main-text').val().length <= 0   ){
                    alert('Main Text field is empty on slide №' + i);
                    trigger=false;
                    return ;
                }else if($('.js-content-field-wrapper[data-id=' + i + ']>.js-additional-text').val().length <= 0 ){
                    alert('Additional Text field is empty on slide №' + i);
                    trigger=false;
                    return ;
                }else if($('.js-main-background-name[data-id=' + i + ']').html().length <= 0){
                    alert('Add main background on slide №' + i);
                    trigger=false;
                    return ;
                }else if($('.js-anim-custom-checkbox[data-id=' + i + ']').hasClass('active')){
                    if($('.js-anim-background-name[data-id=' + i + ']').html().length <= 0){
                        alert('Add animation background on slide №' + i);
                        trigger=false;
                        return ;
                    }
                }
            }

        }



        if(trigger){
            $('.js-output-wrapper').removeClass('hide');
            $('#images-form').ajaxSubmit({
                contentType: 'multipart/form-data',
                success: function(response){

                    for(var x = 1; x <= slidesLimit;x++){
                        if(!$('.js-content-field-wrapper[data-id=' + x + ']').hasClass('hide')) {
                            //append slider with new slide and passing data-ID

                            if(bannerLinkTrigger == true){
                                appendSliderPreviewWithLink(x);
                            }else{
                                appendSliderPreview(x);
                            }


                            //working with text
                            var mainText = $('.js-main-text[data-id=' + x + ']').val();
                            var additionalText = $('.js-additional-text[data-id=' + x + ']').val();
                            $('.js-banner-main-text[data-id=' + x + ']').html(mainText);
                            $('.js-banner-additional-text[data-id=' + x + ']').html(additionalText);

                            //extracting images names
                            var mainImageName = $('.js-main-background-name[data-id=' + x +']').text();


                            if (!$('.js-select-anim-background[data-id=' + x + ']').hasClass('hide-opacity')) {


                                var animImageName = $('.js-anim-background-name[data-id=' + x +']').text();

                                loopImages(mainImageName, animImageName, x);
                                $('.js-banner[data-id=' + x + ']').css('background-image', 'url("../public/img/' + mainImageName + '")');
                                $('.js-banner[data-id=' + x + ']').attr('data-animated', animImageName);

                                var slideContent = {
                                    number : x,
                                    mainText : mainText,
                                    additionalText : additionalText,
                                    mainImage : mainImageName,
                                    additionalImage : animImageName
                                };
                                sliderContent.push(slideContent);
                            } else {
                                $('.js-banner[data-id=' + x + ']').css('background-image', 'url("../public/img/' + mainImageName + '")');
                                var slideContent = {
                                    number : x,
                                    mainText : mainText,
                                    additionalText : additionalText,
                                    mainImage : mainImageName
                                };
                                sliderContent.push(slideContent);
                            }

                            var backgroundSet = {
                                main: mainImageName,
                                anim: animImageName,
                                id: x
                            };
                            backgroundArray.push(backgroundSet);
                        }
                    }

                    $('.js-banner').css('width',width);
                    $('.js-banner').css('height',height);
                    $('.js-banner').css('font-family' , $('.js-font-item.selected').data('family'));
                    $('.js-banner').addClass('width-' + width);
                    $('.js-banner-wrapper').addClass('width-' + width);

                    if($('.js-legal-notes-trigger').hasClass('active')){
                        $('.js-banner-wrapper').addClass('long-legal-notes');
                    }






                    if($('.js-slide-duration').val().length != 0){
                        var duration =  $('.js-slide-duration').val();
                        //here we add slide duration to slider wrapper, no know this value in generated folder

                        $('.js-banner-wrapper').attr('data-duration' , duration);
                        outputHtml = $('.js-outputContent').html();
                        activateSlider(duration);

                    }else{
                        outputHtml = $('.js-outputContent').html();
                        activateSlider();
                    }



                    $.ajax({
                        type : 'POST',
                        url : '/',
                        data : {title : title , bannerHtml : outputHtml , backgroundSet : JSON.stringify(backgroundArray) , legalNote : legalNote },
                        success : function(response){
                            generatedFolderName = response;
                            $('.js-loader').addClass('hide');
                            $('.js-outputContent').removeClass('hide-opacity');
                        },
                        error : function(err){
                            alert('Error while generating');
                            console.log(err);
                        }
                    });

                } //END OF AJAX SUBMIT
            });




            $('.js-download').removeClass('hide');
            $('html,body').animate({scrollTop: document.body.scrollHeight},"fast");

        }
    });



    $('.js-download').on('click' , function(){
        var title = $('.js-title').val();
        var templateType = $('.js-template-list-item.selected').data('type');

        var legalNote;
        var legalNoteType;

        if($('.js-legal-notes-trigger').hasClass('active')){
            legalNote = $('.js-legal-note-long').val();
            legalNoteType = 'long';
        }else{
            legalNote = $('.js-legal-note-short').val();
            legalNoteType = 'short';
        }


        $.ajax({
            type : 'POST',
            url : '/download',
            data : {
                generatedFolderName : generatedFolderName ,
                outputHtml : outputHtml , title : title ,
                height : SLIDER_HEIGHT ,
                width : SLIDER_WIDTH ,
                template : templateType ,
                slidesContent : JSON.stringify(sliderContent),
                legalNote : legalNote,
                legalNoteType : legalNoteType
            },
            success : function(response){
                setTimeout(
                    function(){
                        window.location.href = 'https://young-reef-52192.herokuapp.com/output/' + response;
                    }, 600);
            },
            error : function(err){
                alert('Error while downloading folder');
                console.log(err);
            }
        });


    });


    $('.js-show-avaialable-imgs').on('click' , function(){
        $('.js-available-images').toggleClass('hide');
        $(this).toggleClass('selected');
    });

    $('.js-delete-single-img').on('click' , function(){
        var name = $(this).data('name');

        trigger = confirm('Are you sure that you want to delete ' +  name  + " image?");

        if(trigger == true){
            $.ajax({
                type : 'POST',
                url : '/deleteSingleImg',
                data : {name : name},
                success : function(response){
                    console.log('Image : ' + name + " was deleted successfully");
                    location.reload();
                },
                error : function(err){
                    alert('Error while deleting folders');
                    console.log(err);
                }
            });
        }else{
            location.reload();
        }
    });



    $('.output-slider>.banner').addClass('z');



});






























