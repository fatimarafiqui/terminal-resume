$(document).ready(function(){
	$(".shell-wrap").fadeIn(2000);
	if($(document).width() > 740) {
		$(".icons").show();
	}
	$.getJSON('https://freegeoip.net/json/?callback=?',function(data) {
		$(function() {
			var ip =  '127.0.0.1';
			if(typeof data.ip !== 'undefined') {
				ip = data.ip;
			}
			var domain = window.location.hostname;
			var terminal_prompt = domain + ":~ root$";
			var title = "webserver@" + domain + " ~/root";
			localTime = new Date();
			timestamp = localTime.toLocaleString();
			var w = $('.shell-wrap').width() - 20;
			var h = $(document).height() < 400 ? 300 : 400;
			var anim = false;
			var titleText = $(".shell-top-bar .title");
			titleText.text(title);
			
			function typed(finish_typing) {
				return function(term, message, delay, finish) {
					anim = true;
					var prompt = term.get_prompt();
					var c = 0;
					if (message.length > 0) {
						term.set_prompt('');
						var interval = setInterval(function() {
							term.insert(message[c++]);
							if (c == message.length) {
								clearInterval(interval);
								// execute in next interval
								setTimeout(function() {
									// swap command with prompt
									finish_typing(term, message, prompt);
									anim = false
									finish && finish();
								}, delay);
							}
						}, delay);
					}
				};
			}
			var typed_prompt = typed(function(term, message, prompt) {
				// swap command with prompt
				term.set_command('');
				term.set_prompt(message + ' ');
			});
			var typed_message = typed(function(term, message, prompt) {
				term.set_command('');
				term.echo(message, {raw:true});
				term.set_prompt(prompt);
			});
			function progress(percent, width) {
			    var size = Math.round(width*percent/100);
			    var left = '', taken = '', i;
			    for (i=size; i--;) {
			        taken += '=';
			    }
			    if (taken.length > 0) {
			        taken = taken.replace(/=$/, '>');
			    }
			    for (i=width-size; i--;) {
			        left += ' ';
			    }
			    return '[' + taken + left + '] ' + percent + '%';
			}
			
			function updateTitle(term, response) {
				titleText.text(title + "/" + response.title);
				if (response.title != '') {
					terminal_prompt = domain + ":~ " + response.title + "$";
				} else {
					terminal_prompt = domain + ":~ root$";
				}
				term.set_prompt(terminal_prompt + ' ');
				if(response.msg == '') {
					return;
				}
				if(response.status) {
					term.echo('<span class="white">' + response.msg + '</span>', {raw:true});
				} else {
					term.echo('<span class="red">' + response.msg + '</span>', {raw:true});
				}
			};
			
			var animation = false;
			var timer;
			var prompt;
			var string;
			
			$('#shell-body').terminal(function(cmd, term) {
				cmd = cmd.trim();
				if (cmd.length == 0) {
					return false;
				}
				var finish = false;
				//term.set_prompt(terminal_prompt);
				var i = 0, size = Math.floor(w/11);
				prompt = term.get_prompt();
				string = progress(0, size);
				term.set_prompt(progress);
				animation = true;
				term.focus();
				var args = {command: cmd};
				args = $(this).serialize() + "&" + $.param(args);
				if(cmd != 'clear') {
					term.set_prompt(string);
					$.ajax({
						type: "POST",
						dataType: "json",
						url: "http://fatimarafiqui.com/resume/commands.php",
						data: args,
						success: function(result) {
							if (result.animate) {
								(function loop() {
								    string = progress(i++, size);
								    term.set_prompt(string);
								    if (i < 100) {
								        timer = setTimeout(loop, 10);
								    } else {
								    	if(result.status) {
								        	term.echo(progress(i, size) + ' [[b;green;]ok]').set_prompt(prompt);
								        } else {
								        	term.echo(progress(i, size) + ' [[b;red;]ERROR]').set_prompt(prompt);
								     	}
								        animation = false;
									updateTitle(term, result);
								    }
								})();
							} else {
								animation = false;
								updateTitle(term, result);
							}
						}
					});
				}
			}, {
				name: 'xxx',
				greetings: null,
				width: w,
				height: h,
				onInit: function(term) {
					var msg_line1 = "Linux " + domain + " 3.2.0-4-amd64 #1 SMP Debian 3.2.60-1+deb7u3 x86_64";
					var msg_line2 = "Last login: " + timestamp + " from " + ip;
					typed_message(term, msg_line1, 50, function() {
						typed_message(term, msg_line2, 50, function() {
							typed_prompt(term, terminal_prompt, 50);
						});
					});
				},
				keydown: function(e) {
					if (anim) {
						return false;
					}
					if (animation) {
					    if (e.which == 68 && e.ctrlKey) { // CTRL+D
					        clearTimeout(timer);
					        animation = false;
					        term.echo(string + ' [[b;red;]FAIL]')
					        .set_prompt(prompt);
					    }
					    return false;
					}
				}
			});
		});
	});
});
                            
                            
