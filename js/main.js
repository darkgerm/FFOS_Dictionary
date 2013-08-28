'use strict';

var DEBUG = 0;
var sound_dom = null;

//==================== lookup main ====================

var lookup_update = function(word, callback) {
    var url = '/cdict/wwwcdict.php';
    var params = {word: word};
    
    $.ajax({
        type: 'GET',
        url: url,
        data: params,
    })
    .done(function(data) {
        var rbox = $(data).find('.resultbox');
        
        //find and load the sound
        var reobj = rbox.html().match(/javascript:play\('([^']*)'\)/);
        if(reobj != null) {
            var sound_id = reobj[1];
            sound_dom = new Audio('http://cdict.info/enwave.php?'+sound_id);
            $('#play').attr('active', 'true');
        }else{
            sound_dom = null;
            $('#play').attr('active', 'false');
        }
        
        $('#content').html(rbox);
        $('.xbox, .bartop').remove();
        if(rbox.html().match(/找不到相關中英文資料/)) {
            $('#content').html(
                '<div class="resultbox"><center>找不到相關中英文資料</center><div>'
            );
        }
        if(rbox.html().match(/找不到相關片語資料/)) {
            $('#content').html(
                '<div class="resultbox"><center>找不到相關片語資料</center><div>'
            );
        }
        
        $('.resultbox').each(function(idx, elem) {
            var html = $(this).html();
            html = html.replace(/<br>/g, '\n');
            html = html.trim();
            html = html.replace(/\n  /g, '\n&nbsp;&nbsp;');
            html = html.replace(/\n /g, '\n&nbsp;');
            html = html.replace(/\n/g, '<br>');
            $(this).html(html);
        });
    })
    .error(function() {
        $('#content').html("Can't connect to Internet.");
        sound_dom = null;
        $('#play').attr('active', 'false');
    });
}


//==================== localStorage ====================

/** Favorite format: A JSON list, ordered by alphabeta.
ex:
    '["at","cat","category"]'
*/
var favorite_init = function() {
    var fav = localStorage.getItem('favorite');
    
    if(DEBUG) fav=null;
    
    if(fav==null) {
        localStorage.setItem('favorite', '[]');
    }
};

var favorite_get = function() {
    return JSON.parse(localStorage.getItem('favorite'));
};

var favorite_add = function(word) {
    var fav = favorite_get();
    //assume hist is already init.
    
    if(fav.indexOf(word) == -1) {
        //haven't add, add it
        fav.push(word);
        fav.sort();
    }
    localStorage.setItem('favorite', JSON.stringify(fav));
};

var favorite_del = function(word) {
    var fav = favorite_get();
    var idx = fav.indexOf(word);
    if(idx != -1) {
        fav.splice(idx, 1);
        localStorage.setItem('favorite', JSON.stringify(fav));
    }
    gen_fav_list();
};

var gen_fav_list = function() {
    $('#fav-list').html('');
    $.each(favorite_get(), function(i,v) {
        var html = '<li onclick="lookup_update(\''+v+'\');" >'
            + '<div class="del" onclick="favorite_del(\''+v+'\')">X</div>'
            + v + '</li>'
        $('#fav-list').append(html);
    });
}


//==================== DOM events ====================

var lookup_id;
$('#lookup').on('input', function() {
    window.clearTimeout(lookup_id);
    $('#fav-add').attr('active', 'false');
    
    var word = $('#lookup').val();
    word = decodeURI(word);
    $('#lookup').val(word);
    
    //when input return empty
    if(word == '') {
        $('#content').html('');
        sound_dom = null;
        $('#play').attr('active', 'false');
        return;
    }
    
    lookup_id = window.setTimeout(function() {
    
        lookup_update(word);
        if(favorite_get().indexOf(word) == -1) {
            $('#fav-add').attr('active', 'true');
        }
        
    }, 1000); //1 sec
});

var menu_state = 0;  /* 0:hide 1:show */
$('#menu').click(function() {
    if(menu_state == 0) {           //show
        menu_state = 1;
        $('#menu').css('border-style', 'inset');
        
    }else{                          //hide
        menu_state = 0;
        $('#menu').css('border-style', 'outset');
    }
    $('#menu-list').slideToggle('slow');
});

var fav_state = 0;
$('#fav-show').click(function() {
    if(fav_state == 0) {           //show
        fav_state = 1;
        $('#fav-show').css('border-style', 'inset');
        
    }else{                          //hide
        fav_state = 0;
        $('#fav-show').css('border-style', 'outset');
    }
    $('#fav-list').slideToggle('slow');
});


$('#fav-add').click(function() {
    var word = $('#lookup').val();
    if(word == '') return;  //do not save empty
    
    favorite_add(word);
    $('#fav-add').attr('active', 'false');
    gen_fav_list();
});



$('#play').click(function() {
    if(sound_dom) sound_dom.play();
});


var font_resize = function(delta) {
    var percent = parseInt($('#font-size').html());
    percent += delta;
    if(percent < 50 || 200 < percent) return;
    $('#font-size').html(percent+'%');
    $('#content').css('font-size', percent+'%');
};

$('#font-add').click(function() {
    font_resize(10);
});

$('#font-minus').click(function() {
    font_resize(-10);
});


var change_orientation = function() {
    //set $('#content').outerHeight(true) + $('#lookup').outerHeight(true) == 100%
    $('#content').height($('body').height()-$('#lookup').outerHeight(true));
}

$(window).resize(function() {
    change_orientation();
});


//==================== onload main ====================

$(function main() {
    
    change_orientation();
    favorite_init();
    gen_fav_list();
    
    if(DEBUG) {
        console.warn('In debug mode.');
        $('#lookup').val('test');
        lookup_update('test');
    }
    
    console.log('こんにちは世界');
});

