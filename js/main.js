'use strict';

var DEBUG = 0;
var sound_id = '';

//==================== other funcs ====================

var change_orientation = function() {
    //set $('#lookup').outerWidth(true) == 100%
    $('#lookup').width($('body').width()-6);
    
    //set $('means').outerHeight(true) + $('#lookup').outerHeight(true) == 100%
    $('#means').height($('body').height()-$('#lookup').outerHeight(true));
}

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
        
        var reobj = rbox.html().match(/javascript:play\('([^']*)'\)/);
        if(reobj != null) {
            sound_id = reobj[1];
            console.log(sound_id);
        }else{
            console.log("can't play");
        }
        
        $('#means').html(rbox);
        $('.xbox, .bartop').remove();
        
        //  //re-css the html
        //  var html = $('#means').html();
        //  
        //  // header
        //  html = html.replace(/(〈[^〉]*〉)/g, '<h1>$1</h1>');
        //  
        //  // classify
        //  html = html.replace(/(\[[^\]]*\])/g, '<div class="classify">$1</div>');
        //  html = html.replace(/(〔[^〕]*〕)/g, '<div class="classify">$1</div>');
        //  
        //  // type
        //  html = html.replace(/(【[^】]*】)/g, '<div class="type">$1</div>');
        //  
        //  // level-1 means
        //  html = html.replace(/<br>\d/g, '<div class="level-1">$1</div>');
        //  
        //  $('#means').html(html);
        //  $('br').remove();
        
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
        $('#means').html("Can't connect to Internet.");
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

var favorite_get = function() {
    return JSON.parse(localStorage.getItem('favorite'));
};


//==================== DOM events ====================

var lookup_id;

$('#lookup').on('input', function() {
    var word = $('#lookup').val();
    
    window.clearTimeout(lookup_id);
    lookup_id = window.setTimeout(function() {
        lookup_update(word);
    }, 1000); //1 sec
});


$('#fav-save').click(function() {
    var word = $('#lookup').val();
    console.log('saving: ', word);
    favorite_add(word);
});

$('#fav-show').click(function() {
    var a = favorite_get();
    console.log(a);
    $('#means').html(a);
});

$('#play').click(function() {
    new Audio('http://cdict.info/enwave.php?'+sound_id).play();
});

$('#font-add').click(function() {
    var fs = parseInt($('body').css('font-size'));
    fs += 5;
    $('body').css('font-size', fs+'px');
});

$('#font-minus').click(function() {
    var fs = parseInt($('body').css('font-size'));
    fs -= 5;
    $('body').css('font-size', fs+'px');
});

$(window).resize(function() {
    change_orientation();
});


//==================== onload main ====================

$(function main() {
    
    change_orientation();
    favorite_init();
    
    if(DEBUG) {
        console.warn('In debug mode.');
        $('#lookup').val('test');
        lookup_update('test');
    }
    
    console.log('こんにちは世界');
});

