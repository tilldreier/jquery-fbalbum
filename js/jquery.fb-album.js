/**
 * jQuery fbalbum plugin
 * This jQuery plugin was inspired and based on Lightbox 2 by Lokesh Dhakar (http://www.huddletogether.com/projects/lightbox2/)
 * and adapted to me for use like a plugin from jQuery.
 * @name jquery-fbalbum.js
 * @author Till Dreier
 * @version 0.1 Alpha
 * @date June 27, 2012
 * @category jQuery plugin
 * @copyright (c) 2012 Till Dreier
 * @license CCAttribution-ShareAlike 2.5 Brazil - http://creativecommons.org/licenses/by-sa/2.5/br/deed.en_US
 * @example Visit http://teamhoermann.ch/Fotos
 */

(function($) {
	$.fn.fbalbum = function(opts) {
		opts = $.extend({
			pageId : null,
			id : $(this).attr("id"),
			lb : {},
			albumThumbWidth:167,
			albumThumbHeight:111,
			albumRows:3,
			photoThumbWidth:161,
			photoThumbHeight:120,
			exclude : []
		}, opts);

		var offset = 0;
		var photoOffset = 0;
		var albumId = "";
		var headerArray = new Array();

		function loadAlbums() {
			$('#fb-album-header').html("");
			if($('#fb-albums-all').length != 0) {
				$('#fb-albums-all').fadeIn(1000);
			} else {
				$("<div>", {
					id : "fb-albums-all"
				}).appendTo("#fb-album-content");

				albumCall();
			}
		}

		function albumCall() {
			FB.api(opts.pageId + '/albums', {
				limit : 20,
				offset : offset * 20
			}, function(response) {
				for(var i in response.data) {
					var album = response.data[i];
					if($.inArray(album.id, opts.exclude) == -1) {
						var countTxt = album.count + " ";
						if(album.count > 1) {
							countTxt += "Fotos";
						} else {
							countTxt += "Foto";
						}
						var clear="";
						var mod=$('.albumThumb').length%opts.albumRows;
						if(mod==0){
							clear=";clear:both";
						}
						var html = '<div class="albumThumb fbLink" style="width:'+opts.photoThumbWidth+'px;height:'+opts.photoThumbHeight+'px" title="' + album.name + '" href="#album-' + album.id + '">';
						html += '<span class="albumThumbWrap">';
						html += '<i id="fb-album-thumb-' + album.cover_photo + '" style="width:'+opts.photoThumbWidth+'px;height:'+opts.photoThumbHeight+'px;"></i>';
						html += '</span>';
						html += '</div>';
						html += '<div class="albumDetails" style="width:'+opts.photoThumbWidth+'px;">';
						html += '<div class="albumText">';
						html += '<div class="fbLink" href="#album-' + album.id + '"><strong>' + album.name + '</strong></div>';
						html += '<div class="albumCount">' + countTxt + '</div>';
						html += '</div>';
						$("<div>", {
							"class" : "albumWrapper",
							style:clear,
							html : html
						}).appendTo("#fb-albums-all").fadeIn(1000,function(){$('.fbLink').live('click',function(e){
						checkAnchor($(this).attr('href'));
					});});
						
					
					

						FB.api(album.cover_photo, function(response) {
							var img = 'http://src.sencha.io/'+(opts.albumThumbWidth+10)+'/' + response.source;
							/*for(var i in response.images) {
								image = response.images[i];
								if(image.height > 111 && image.width > 167) {
									img = image.source;
								} else {
									break;
								}
							}*/
							$("#fb-album-thumb-" + response.id).css("background-image", "url(" + img + ")");
						});
					}
				}
				if(response.data.length > 0) {
					offset++;
					albumCall();
				}
			});
		}

		function showAlbum() {
			if($('#fb-album-' + albumId).length != 0) {
				$('#fb-album-' + albumId).fadeIn(1000);
				$('#fb-album-header').html(headerArray[albumId]);
					
				$('.fbLink').bind('click',function(e){
					checkAnchor($(this).attr('href'));
				});
			} else {
				FB.api(albumId, function(response) {
					var albname=response.name;
					var desc="";
					if(response.description){
						desc+=response.description;
					}
					if(response.location){
						if(desc!=""){
							desc+=' ';
						}	
						desc+='(Aufgenommen in '+response.location+')';
					}
					if(desc!=''){
						desc='<p>'+desc+'</p>';
					}
					header='<span href="#" class="fbLink" ><< Zur&uuml;ck</span> - <b>' + albname + '</b>'+desc;
					headerArray[albumId]=header;
					$('#fb-album-header').html(header);
					$("<div>", {
						id : 'fb-album-' + albumId,
						"class" : 'album'
					}).appendTo("#fb-album-content");
					photoOffset = 0;
					photoCall();
					
					$('.fbLink').live('click',function(e){
						checkAnchor($(this).attr('href'));
					});
				});
			}
		}

		function photoCall() {
			FB.api(albumId + '/photos', {
				limit : 25,
				offset : photoOffset * 25
			}, function(response) {
				for(var i in response.data) {
					var photo = response.data[i];

					var img = "";
					for(var j in photo.images) {
						image = photo.images[j];
						if(image.height > 100 && image.width > 150) {
							img = image.source;
						} else {
							break;
						}
					}
					var name = "";
					if(photo.name) {
						name = photo.name;
					}

					var html = '<a class="photoThumb ' + albumId + '" style="width:'+opts.photoThumbWidth+'px;height:'+opts.photoThumbHeight+'px" title="' + name + '" href="' + photo.source + '">';
					html += '<span class="photoThumbWrap">';
					html += '<i style="width:'+opts.photoThumbWidth+'px;height:'+opts.photoThumbHeight+'px;background-image:url(http://src.sencha.io/'+(opts.photoThumbWidth+10)+'/' + photo.source + ')"></i>';
					html += '</span>';
					html += '</a>';
					$("<div>", {
						id : 'fb-photo-' + photo.id,
						"class" : "photoWrapper",
						html : html
					}).appendTo('#fb-album-' + albumId).fadeIn(1000);
				}
				if(response.data.length > 0) {
					photoOffset++;
					photoCall();
				} else {
					$('a.' + albumId).lightBox(opts.lb);
				}
			});
		}

		function checkAnchor(href) {
			var anchor = href.split('-');
			if(anchor[0] == '#album') {
				if($('#fb-albums-all').length != 0) {
					$('#fb-albums-all').hide();
				}
				if(albumId!=anchor[1]){
					albumId=anchor[1];
					showAlbum();
				}
			} else {
				$('.album').hide();
				loadAlbums();
			}
		}


		$("<div>", {
			id : "fb-album-header"
		}).appendTo("#" + opts.id);

		$("<div>", {
			id : "fb-album-content"
		}).appendTo("#" + opts.id);

		$("<div>", {
			"class" : "fb-album-footer",
			style : 'clear:both',
			html : 'Free jQuery Facebook photo plugin provided by <a href="https://github.com/tilldreier/jquery-fbalbum" target="_blank" >Till Dreier</a> - Photos from <a target="_blank" href="http://www.facebook.com/' + opts.pageId + '">facebook.com/' + opts.pageId + '</a>'
		}).appendTo("#" + opts.id);
		
		$('.album').hide();
		loadAlbums();

		
		/*checkAnchor();
		$(window).bind('hashchange', function() {
			checkAnchor();
		});*/
	}
})(jQuery);
