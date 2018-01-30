(function ($) {
	// Settings
	var repeat = localStorage.repeat || 0,
		shuffle = localStorage.shuffle || 'false',
		continous = true,
		autoplay = true,
		playlist = [{
			"title": "Heart To Heart",
			"artist": "藤田淳平"
		}, {
			"title": "風の住む街",
			"artist": "磯村由纪子"
		}, {
			"title": "渔舟唱晚 (cut版)",
			"artist": "浦琦璋"
		}, {
			"title": "初めて恋をした记忆 ~ピアノ伴奏~ - instrumental",
			"artist": "松尾早人"
		}, {
			"title": "新闻联播片尾曲-文武贝重新制作",
			"artist": "文武贝"
		}, {
			"title": "Promise",
			"artist": "山岡晃"
		}, {
			"title": "故乡の原风景",
			"artist": "宗次郎"
		}, {
			"title": "いつも何度でも",
			"artist": "宗次郎"
		}, {
			"title": "明日晴れるかな(Piano & Strings Version)",
			"artist": "吉川慶"
		}, {
			"title": "千と千寻の神隠し・メドレー",
			"artist": "久木田薫"
		}, {
			"title": "火宵の月・テーマ~ピアノソロ",
			"artist": "中村由利子"
		}, {
			"title": "With An Orchid",
			"artist": "Yanni"
		}, {
			"title": "Rain, Totoro Forest",
			"artist": "The Nature Sounds Society Japan"
		}, {
			"title": "Just Blue",
			"artist": "Space"
		}, {
			"title": "The truth that you leave",
			"artist": "Pianoboy高至豪"
		}, {
			"title": "Only Wish",
			"artist": "Nicholas Cheung"
		}, {
			"title": "Sundial Dreams",
			"artist": "Kevin Kern"
		}, {
			"title": "My Soul",
			"artist": "July"
		}, {
			"title": "Because of You",
			"artist": "Josh Vietti"
		}, {
			"title": "Down By the Salley Gardens",
			"artist": "Joanie Madden"
		}, {
			"title": "Legends of the Fall The Ludlows",
			"artist": "James Horner"
		}, {
			"title": "Variations on the Kanon Variations On The Kanon by Pachelbel",
			"artist": "George Winston"
		}, {
			"title": "Re...Japanesque",
			"artist": "DAISHI DANCE"
		}, {
			"title": "Journey",
			"artist": "Capo Productions"
		}, {
			"title": "Refrain",
			"artist": "Anan Ryoko"
		}, ]

	// Load playlist
	for (var i = 0; i < playlist.length; i++) {
		var item = playlist[i];
		$('#playlist').append('<li>' + item.title + ' - ' + item.artist + '</li>');
	}

	var time = new Date(),
		currentTrack = shuffle === 'true' ? time.getTime() % playlist.length : 0,
		trigger = false,
		audio, timeout, isPlaying, playCounts;

	var play = function () {
		audio.play();
		$('.playback').addClass('playing');
		timeout = setInterval(updateProgress, 500);
		isPlaying = true;
	}

	var pause = function () {
		audio.pause();
		$('.playback').removeClass('playing');
		clearInterval(updateProgress);
		isPlaying = false;
	}

	// Update progress
	var setProgress = function (value) {
		var currentSec = parseInt(value % 60) < 10 ? '0' + parseInt(value % 60) : parseInt(value % 60),
			ratio = value / audio.duration * 100;

		$('.timer').html(parseInt(value / 60) + ':' + currentSec);
		$('.progress .pace').css('width', ratio + '%');
		$('.progress .slider a').css('left', ratio + '%');
	}

	var updateProgress = function () {
		setProgress(audio.currentTime);
	}

	// Progress slider
	$('.progress .slider').slider({
		step: 0.1,
		slide: function (event, ui) {
			$(this).addClass('enable');
			setProgress(audio.duration * ui.value / 100);
			clearInterval(timeout);
		},
		stop: function (event, ui) {
			audio.currentTime = audio.duration * ui.value / 100;
			$(this).removeClass('enable');
			timeout = setInterval(updateProgress, 500);
		}
	});

	// Volume slider
	var setVolume = function (value) {
		audio.volume = localStorage.volume = value;
		$('.volume .pace').css('width', value * 100 + '%');
		$('.volume .slider a').css('left', value * 100 + '%');
	}

	var volume = localStorage.volume || 0.5;
	$('.volume .slider').slider({
		max: 1,
		min: 0,
		step: 0.01,
		value: volume,
		slide: function (event, ui) {
			setVolume(ui.value);
			$(this).addClass('enable');
			$('.mute').removeClass('enable');
		},
		stop: function () {
			$(this).removeClass('enable');
		}
	}).children('.pace').css('width', volume * 100 + '%');

	$('.mute').click(function () {
		if ($(this).hasClass('enable')) {
			setVolume($(this).data('volume'));
			$(this).removeClass('enable');
		} else {
			$(this).data('volume', audio.volume).addClass('enable');
			setVolume(0);
		}
	});

	// Switch track
	var switchTrack = function (i) {
		if (i < 0) {
			track = currentTrack = playlist.length - 1;
		} else if (i >= playlist.length) {
			track = currentTrack = 0;
		} else {
			track = i;
		}

		$('audio').remove();
		loadMusic(track);
		if (isPlaying == true) play();
	}

	// Shuffle
	var shufflePlay = function () {
		var time = new Date(),
			lastTrack = currentTrack;
		currentTrack = time.getTime() % playlist.length;
		if (lastTrack == currentTrack) ++currentTrack;
		switchTrack(currentTrack);
	}

	// Fire when track ended
	var ended = function () {
		pause();
		audio.currentTime = 0;
		playCounts++;
		if (continous == true) isPlaying = true;
		if (repeat == 1) {
			play();
		} else {
			if (shuffle === 'true') {
				shufflePlay();
			} else {
				if (repeat == 2) {
					switchTrack(++currentTrack);
				} else {
					if (currentTrack < playlist.length) switchTrack(++currentTrack);
				}
			}
		}
	}

	var beforeLoad = function () {
		var endVal = this.seekable && this.seekable.length ? this.seekable.end(0) : 0;
		$('.progress .loaded').css('width', (100 / (this.duration || 1) * endVal) + '%');
	}

	// Fire when track loaded completely
	var afterLoad = function () {
		if (autoplay == true) play();
	}

	var random = Math.floor(1 + Math.random() * 9);
	$('#background').css('background-image', 'url(./img/bg' + random + '.webp)');
	// Load track
	var loadMusic = function (i) {
		var item = playlist[i],
			newaudio = $('<audio>').html('<source src="./music/' + item.artist + ' - ' + item.title + '.mp3">').appendTo('#player');

		$('.cover').html('<img src="./img/bg' + random + '.webp" alt="' + item.title + '">');
		$('.tag').html('<strong>' + item.title + '</strong><span class="artist">' + item.artist + '</span>');
		$('#playlist li').removeClass('playing').eq(i).addClass('playing');
		if ($('#playlist li').eq(i).offset().top > 600) {
			$('body').scrollTo('li.playing', {
				duration: 1500
			});
		}
		$('title').text(item.title + " - " + item.artist);
		audio = newaudio[0];
		audio.volume = $('.mute').hasClass('enable') ? 0 : volume;
		audio.addEventListener('progress', beforeLoad, false);
		audio.addEventListener('durationchange', beforeLoad, false);
		audio.addEventListener('canplay', afterLoad, false);
		audio.addEventListener('ended', ended, false);

		// change background image
		// $('#background').css('background-image', 'url(./img/bg' + random + '.webp)');
	}

	loadMusic(currentTrack);
	$('.playback').on('click', function () {
		if ($(this).hasClass('playing')) {
			pause();
		} else {
			play();
		}
	});
	$('.rewind').on('click', function () {
		if (shuffle === 'true') {
			shufflePlay();
		} else {
			switchTrack(--currentTrack);
		}
	});
	$('.fastforward').on('click', function () {
		if (shuffle === 'true') {
			shufflePlay();
		} else {
			switchTrack(++currentTrack);
		}
	});
	$('#playlist li').each(function (i) {
		var _i = i;
		$(this).on('click', function () {
			switchTrack(_i);
		});
	});

	if (shuffle === 'true') $('.shuffle').addClass('enable');
	if (repeat == 1) {
		$('.repeat').addClass('once');
	} else if (repeat == 2) {
		$('.repeat').addClass('all');
	}

	$('.repeat').on('click', function () {
		if ($(this).hasClass('once')) {
			repeat = localStorage.repeat = 2;
			$(this).removeClass('once').addClass('all');
		} else if ($(this).hasClass('all')) {
			repeat = localStorage.repeat = 0;
			$(this).removeClass('all');
		} else {
			repeat = localStorage.repeat = 1;
			$(this).addClass('once');
		}
	});

	$('.shuffle').on('click', function () {
		if ($(this).hasClass('enable')) {
			shuffle = localStorage.shuffle = 'false';
			$(this).removeClass('enable');
		} else {
			shuffle = localStorage.shuffle = 'true';
			$(this).addClass('enable');
		}
	});
	// 监听键盘事件
	$(document).keydown(function (event) {
		if (event.keyCode == 37) {
			if (shuffle === 'true') {
				shufflePlay();
			} else {
				switchTrack(--currentTrack);
			}
		} else if (event.keyCode == 39) {
			if (shuffle === 'true') {
				shufflePlay();
			} else {
				switchTrack(++currentTrack);
			}
		} else if (event.keyCode == 32) {
			event.preventDefault();
			if ($('.playback').hasClass('playing')) {
				pause();
			} else {
				play();
			}
		}
	});
})(jQuery);