'use strict';

/** 
To avoid Same Origin Policy, set this flag up for testing.
You should run the following command before testing::

    word='<WORD_FOR_TESTING>' && wget -O debug/$word.html "http://cdict.info/wwwcdict.php?word=$word"
*/
var DEBUG = 0;



//==================== util functions ====================
var openurl = function(url, params, method, callback) {
    if(typeof params === 'undefined') params = {};
    if(typeof method === 'undefined') method = 'GET';
    
    var xhr = new XMLHttpRequest({
        mozSystem: true
    });
     
    var qs = [];
    for(var key in params)  {
        qs.push(encodeURIComponent(key)+'='+encodeURIComponent(params[key]));
    }
    var url_full = url + '?' + qs.join('&');

    xhr.open(method, url_full, true);
    //xhr.responseType = 'html';
    xhr.timeout = 30000;
    xhr.onload = function(e) {
        if (xhr.status === 200 || xhr.status === 400 || xhr.status === 0) {
            if(typeof callback === 'function') {
                window.setTimeout(function() {
                    callback(xhr.response);
                }, 0);
            }
        }
        else {
            console.error('[openurl] error with status = ', xhr.status);
        }
    }; // onload

    xhr.ontimeout = function(e) {
        console.error('[openurl] ontimeout', e);
    }; // ontimeout

    xhr.onerror = function(e) {
        console.error('[openurl] onerror', e);
    }; // onerror

    xhr.send();
}


//==================== other funcs ====================

var change_orientation = function() {
    //set $('#lookup').outerWidth(true) == 100%
    $('#lookup').width($('body').width()-6);
    
    //set $('means').outerHeight(true) + $('#lookup').outerHeight(true) == 100%
    $('#means').height($('body').height()-$('#lookup').outerHeight(true));
}

var lookup_update = function(word, callback) {
    var url = 'http://cdict.info/wwwcdict.php';
    var params = {word: word};
    
    if(DEBUG) {
        url = '/debug/' + word + '.html';
        params = {};
    }
    
    openurl(url, params, 'GET', function(data) {
        var rbox = $(data).find('.resultbox');
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

