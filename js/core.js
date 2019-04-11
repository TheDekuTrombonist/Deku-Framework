/*!
 * Deku Framework Core JavaScript
 *
 * @package Deku Framework
 * @author The Deku Trombonist
 * @copyright 2019
 *
 * @version 1.0
 */

var Deku = Deku || {};

Deku.Utils = Deku.Utils || {};

(function($, window, document, undefined)
{
	
	// https://gist.github.com/maccman/4414792
	// https://blog.alexmaccaw.com/css-transitions
	// http://benalman.com/news/2010/03/jquery-special-events
	// https://github.com/twbs/bootstrap/blob/master/js/transition.js#L50
	(function()
	{
		var supportedTransition = (function()
		{
			var el = document.createElement('div');

			var transitionEndEvents = {
				transition: 'transitionend',
				WebkitTransition: 'webkitTransitionEnd',
				MozTransition: 'transitionend',
				OTransition: 'oTransitionEnd otransitionend'
			};
	
			for (var property in transitionEndEvents)
			{
				if (el.style[property] !== undefined)
				{
					return { end: transitionEndEvents[property] };
				}
			}
			
			return false;
		})();
		
		$.support.transition = supportedTransition;
		
		if ($.support.transition)
		{
			$.event.special.dekuTransitionEnd = {
				bindType: $.support.transition.end,
				delegateType: $.support.transition.end,
				handle: function(e)
				{
					if ($(e.target).is(this))
					{
						return e.handleObj.handler.apply(this, arguments);
					}
				}
			};
		}
	})();
	
	// Add jQuery plugins
	$.fn.extend({
		
		// Gets the CSS transition duration in milliseconds for the first element
		'cssTransitionDuration' : function()
		{
			var duration = 0;
			
			if (!$.support.transition)
			{
				return duration;
			}
			
			// Don't need to call .first() because .css() only returns for first element
			var rawCSS = this.css('transition-duration');
			
			if (!rawCSS)
			{
				return duration;
			}
			
			var result = /^(\d*\.\d+|\d+)(s|ms)/.exec(rawCSS);
			
			if (result)
			{
				duration = Math.round(parseFloat(result[1]) * (result[2] == 's' ? 1000 : 1));
			}
			
			return duration;
		},
		
		'oneTransitionEnd' : function(callback)
		{
			var isCalled = false, $el = this, duration = this.cssTransitionDuration();
			
			this.one('dekuTransitionEnd', function()
			{
				if (!isCalled)
				{
					isCalled = true;
					return callback.apply(this, arguments);
				}
				return;
			});
			
			setTimeout(
				function()
				{
					if (!isCalled)
					{
						$el.trigger('dekuTransitionEnd');
					}
				},
				duration + 20
			);
		},
		
		'focusWithoutScrolling' : function()
		{
			// https://stackoverflow.com/a/41919971
			var el = this[0],
				scrollPositions = [];
			
			var	parent = el.parentNode;
			
			while (parent)
			{
				scrollPositions.push([parent, parent.scrollLeft, parent.scrollTop]);
				parent = parent.parentNode;
			}
	
			el.focus();
	
			scrollPositions.forEach(function(item)
			{
				var el = item[0];
	
				// Check first to avoid triggering unnecessary `scroll` events
				if (el.scrollLeft !== item[1])
				{
					el.scrollLeft = item[1];
				}
	
				if (el.scrollTop !== item[2])
				{
					el.scrollTop = item[2];
				}
			});
			
			return this;
		
		},
	});
	
	Deku.config = {
		url: '/',
	};
	
	var keyCode = Object.freeze(
	{
	  tab      : 9,
	  enter    : 13,
	  esc      : 27,
	  space    : 32,
	  pageup   : 33,
	  pagedown : 34,
	  end      : 35,
	  home     : 36,
	  left     : 37,
	  up       : 38,
	  right    : 39,
	  down     : 40,
	});
	
	Deku.Utils.keyCode = function()
	{
		return keyCode;
	};
	
	(function()
	{
    	var counter = 0;
		
    	Deku.Utils.uniqueId = function()
		{
        	return 'dekuId-' + counter++;
    	};
	})();
	
	Deku.Utils.getURLPath = function()
	{
		return window.location.pathname.split('/');
	};
	
	Deku.Utils.ucFirst = function(string)
	{
    	return string.charAt(0).toUpperCase() + string.slice(1);
	};
	
	Deku.Utils.measureScrollbar = function(reCalculate)
	{
		var scrollbarOffset = false;
		
		if (reCalculate != false || scrollbarOffset === false)
		{
			var $el = $('<div class="scrollbarMeasure" />');
			$el.appendTo('body');
			
			scrollbarOffset = $el[0].offsetWidth - $el[0].clientWidth;
			$el.remove();
		}
		
		return scrollbarOffset;
	};
	
	Deku.Utils.transitionClass = function($el, cssClass, addingClass, callback, preCallback)
	{
		var toggleFunc = addingClass ? 'addClass' : 'removeClass',
			cb = function(e)
			{
				$(this).removeClass('isTransitioning');

				if (typeof callback === 'function')
				{
					callback.apply(this, e);
				}
			};

		$el.addClass('isTransitioning');

		if (typeof preCallback === 'function')
		{
			preCallback.call();
		}

		$el[0].offsetWidth;

		$el[toggleFunc](cssClass).oneTransitionEnd(cb);
	};
	
	Deku.Utils.decodeEntities = function(encodedString)
	{
	  var textArea = document.createElement('textarea');
	  textArea.innerHTML = encodedString;
	  
	  return textArea.value;
	};
	
	
	Deku.registerjQueryPlugin = function(pluginName, pluginClass, getters, defaults)
	{
		$.fn[pluginName] = function(options)
		{
			var args = arguments;
	
			if (options === undefined || typeof options === 'object')
			{
				// Creates a new plugin instance, for each selected element, and
				// stores a reference withint the element's data
				return this.each(function()
				{
					if (!$.data(this, pluginName))
					{
						$.data(this, pluginName, new pluginClass(this, options));
					}
				});
			}
			else if (typeof options === 'string')
			{
				// Call a public plug-in method for each selected element.
				if (Array.prototype.slice.call(args, 1).length == 0 && $.inArray(options, $.fn[pluginName].getters) != -1)
				{
					// If the user does not pass any arguments and the method allows to
					// work as a getter then break the chainability so we can return a value
					// instead the element reference.
					var instance = $.data(this[0], pluginName);
					return instance[options].apply(instance, Array.prototype.slice.call(args, 1));
				}
				else
				{
					// Invoke the specified method on each selected element
					return this.each(function()
					{
						var instance = $.data(this, pluginName);
						if (instance instanceof pluginClass && typeof instance[options] === 'function')
						{
							instance[options].apply(instance, Array.prototype.slice.call(args, 1));
							
							if (options === 'destroy')
							{
								$.removeData(this, pluginName);
							}
						}
					});
				}
			}
		};
		
		$.fn[pluginName].defaults = defaults;
		$.fn[pluginName].getters = getters;
	};
	
	// Deku Focus Loop
	(function()
	{
		var pluginName      = 'dekuFocusLoop',
			CONTAINER_CLASS = 'js-focusLoop',
			GUARD_CLASS     = 'js-focusLoop-guard',
			getters         = [],
			defaults        = {};
	
		function focusLoop(el)
		{
			var $el = el instanceof $ ? el : $(el);
			$el.addClass(CONTAINER_CLASS);
			
			var $startGuard = createGuard('start'),
				$endGuard = createGuard('end');
			
			$startGuard.prependTo($el);
			$endGuard.appendTo($el);
			
			this.focusFirst = function()
			{
				$endGuard.focus();
			};
			
			this.destroy = function()
			{
				$startGuard.remove();
				$endGuard.remove();
			};
			
			function eventHandler(e)
			{
				var $focusTarget,
					$tabbable = $el.find(':tabbable');
				
				if (e.data.trigger === 'start')
				{
					$focusTarget = $tabbable.not($endGuard).last();
				}
				else if (e.data.trigger === 'end')
				{
					$focusTarget = $tabbable.not($startGuard).first();
				}
				
				$focusTarget.focus();
			}
			
			function createGuard(triggerName)
			{
				return $('<div tabindex="0"></div').addClass(GUARD_CLASS).on('focus', {trigger: triggerName}, eventHandler);
			}
		};
		
		Deku.registerjQueryPlugin(pluginName, focusLoop, getters, defaults);
	})();
	
	
	// Swipe jQuery plugin
	(function()
	{
		var SUPPORTS_TOUCH = 'ontouchstart' in window,
		SUPPORTS_POINTER_IE10 = window.navigator.msPointerEnabled && !window.navigator.pointerEnabled && !SUPPORTS_TOUCH,
		SUPPORTS_POINTER = (window.navigator.pointerEnabled || window.navigator.msPointerEnabled) && !SUPPORTS_TOUCH;
		
		var defaults = {
			maxTime: 300,
			minDistance: 75,
			angleThreshold: 20, // degrees travelled in perpendicular direction
			excludedChildren: '',
			onSwipeLeft: [],
			onSwipeRight: []
		};

		$.fn.swipe = function(params)
		{
			var $this = $(this);
			var instance = $this.data('dekuSwipe');

			if (instance && typeof params === 'object')
			{
				instance['updateOptions'].call(instance, params);
			}
			else if (!instance && typeof params === 'object')
			{
				return init.call($this, params);
			}
	
			return $this;
		};

		function init(options)
		{
			options = $.extend({}, defaults, options);
			
			return this.each(function()
			{
				var $this = $(this);
	
				var instance = $this.data('dekuSwipe');

				if (!instance)
				{
					instance = new dekuSwipe(this, options);
					$this.data('dekuSwipe', instance);
				}
			});
		}

		// Only detects horizontal swipes
		function dekuSwipe(element, options)
		{
			var options = $.extend({}, options);
			
			var START_EV = SUPPORTS_POINTER ? (SUPPORTS_POINTER_IE10 ? 'MSPointerDown' : 'pointerdown') : 'touchstart',
				END_EV = SUPPORTS_POINTER ? (SUPPORTS_POINTER_IE10 ? 'MSPointerUp' : 'pointerup') : 'touchend';
	  
			var start,
				startTime,
				end,
				endTime,
				direction,
				distance;
	
			var $element = $(element);
	
			$element.on(START_EV, beginSwipe);
			$element.on(END_EV, endSwipe);

			if (!$.isArray(options['onSwipeLeft']))
			{
				options['onSwipeLeft'] = Array(options['onSwipeLeft']);
			}
	
			if (!$.isArray(options['onSwipeRight']))
			{
				options['onSwipeRight'] = Array(options['onSwipeRight']);
			}
	
			this.updateOptions = function(newOptions)
			{
				var newOptions = $.extend({}, newOptions);
				
				if ('onSwipeLeft' in newOptions)
				{
					addNewCallbacks('onSwipeLeft', newOptions);
					delete newOptions['onSwipeLeft'];
				}
	
				if ('onSwipeRight' in newOptions)
				{
					addNewCallbacks('onSwipeRight', newOptions);
					delete newOptions['onSwipeRight'];
				}
				
				options = $.extend(options, newOptions);
			};
			
			function beginSwipe(e)
			{
				if (options.excludedChildren !== '' && $(e.target).closest(options.excludedChildren, $element).length > 0)
				{
					return;
				}
	
				distance = 0;
				start = getCoordinates(e);
				startTime = getTimestamp();
			}
	
			function endSwipe(e)
			{
				end = getCoordinates(e);
				endTime = getTimestamp();
				calculateDirectionAndDistance();
	
				if (!isWithinTimeLimit() || !isValidDistance() || !isWithinThreshold())
				{
					return;
				}
				
				fireCallbacks();
			}
	
			function getCoordinates(e)
			{
				var obj = e.changedTouches[0];
	
				return {x: obj.pageX, y: obj.pageY};
			}
	
			function getTimestamp()
			{
				return new Date().getTime();
			}
	
			function isWithinTimeLimit()
			{
				var timeDiff = endTime - startTime;

				return (timeDiff > 0 && timeDiff < options.maxTime);
			}
	
			function calculateDirectionAndDistance()
			{
				if (start.x > end.x)
				{
					distance = start.x - end.x;
					direction = 'left';
				}
				else
				{
					distance = end.x - start.x;
					direction = 'right';
				}
			}

			function isValidDistance()
			{
				var ratio = window.devicePixelRatio || 1;
				return (Math.abs(distance) * ratio >= options.minDistance);
			}

			function isWithinThreshold()
			{
				var dy = start.y - end.y;
				
				if (dy < 0)
				{
					dy = dy * -1;
				}
				
				// Threshold is in degrees.
				return Math.atan(dy/distance) * (180/Math.PI) <= options.angleThreshold;
				
				//return Math.abs(dy) * ratio <= options.distanceThreshold;
			}

			function fireCallbacks()
			{
				var evt = 'onSwipe' + direction[0].toUpperCase() + direction.slice(1);
				
				for (var i = 0; i < options[evt].length; i++)
				{
					options[evt][i].call(element, start, end);
				}
			}

			function addNewCallbacks(cbName, newOptions)
			{
				if (!$.isArray(newOptions[cbName]))
				{
					newOptions[cbName] = [newOptions[cbName]];
				}

				options[cbName] = options[cbName].concat(newOptions[cbName]);
			}
		}
	})();
	
	
	// Deku Accordion jQuery Plugin
	(function()
	{
		var CONTAINER_CLASS		= 'js-accordion',
			TRIGGER_CLASS		= 'js-accordion-trigger',
			TARGET_CLASS		= 'js-accordion-target',
			TRANSITION_CLASS 	= 'isTransitioning',
			OPEN_CLASS  		= 'isOpen',
			OPEN_EVENT			= 'accordion:open',
			CLOSE_EVENT			= 'accordion:close';
		
		function openCloseAccordion(opening, instant, $container, $trigger)
		{
			var toggleFunc = opening ? 'addClass' : 'removeClass',
				$trigger = $trigger || $container.find('.' + TRIGGER_CLASS),
				$target = $container.find(' > .' + TARGET_CLASS),
				arrowRotation = opening ? 180 : 0;
			
			// Nothing to do...
			if (opening && $container.hasClass(OPEN_CLASS) || !opening && !$container.hasClass(OPEN_CLASS))
			{
				return;
			}
			
			if (instant)
			{
				$trigger.find('.svgArrow-arrow').attr('transform', 'rotate(' + arrowRotation + ')');
				$container[toggleFunc](OPEN_CLASS);
			}
			else
			{
				if (opening)
				{
					$target.css('max-height', 0);
					
					$container.addClass(TRANSITION_CLASS).oneTransitionEnd(function()
					{
						$target.css('max-height', '');
						$container.removeClass(TRANSITION_CLASS);
					});
					
					$container[0].offsetWidth; // Redraw
					
					$target.css('max-height', $target[0].scrollHeight + 'px');
					$container.addClass(OPEN_CLASS);
				}
				else
				{
					$target.css('max-height', $target[0].scrollHeight + 'px');
					$container.addClass(TRANSITION_CLASS);
					
					$container[0].offsetWidth; // Redraw
					
					$container.removeClass(OPEN_CLASS).oneTransitionEnd(function()
					{
						$target.css('max-height', '');
						$container.removeClass(TRANSITION_CLASS);
					});
					$target.css('max-height', 0);
				}
				
				$trigger.find('.svgArrow-arrow').stop().animate({'svgTransform': 'rotate(' + arrowRotation + ')'}, $container.cssTransitionDuration());
			}
			
			// Trigger event
			if (opening)
			{
				$container.trigger(OPEN_EVENT);
			}
			else
			{
				$container.trigger(CLOSE_EVENT);
			}
			
		};

		$(document).on('click', '.' + TRIGGER_CLASS, function(e)
		{
			$this = $(e.currentTarget);
			$container = $this.closest('.' + CONTAINER_CLASS);
			
			// Are we hiding or showing?
			if ($container.hasClass(OPEN_CLASS))
			{
				openCloseAccordion(false, false, $container, $this);
				e.preventDefault();
			}
			else
			{
				openCloseAccordion(true, false, $container, $this);
				e.preventDefault();
			}
			
			
		});
		
		// Revise this...
		$(document).on('keypress', '.' + TRIGGER_CLASS, function(e)
		{
			if (e.which === 13)
			{
				$(e.currentTarget).click();
				e.preventDefault();
			}
    	});
		
		$.fn.dekuAccordion = function(operation, instant)
		{
			var opening;
			
			if (operation == 'open')
			{
				opening = true;
			}
			else if (operation == 'close')
			{
				opening = false;
			}
			else
			{
				return;
			}
			
			if (arguments.length < 2)
			{
				instant = false;
			}
			
			this.each(function(){
				var $this = $(this);
				
				if (!$this.hasClass(CONTAINER_CLASS))
				{
					return;
				}
				
				openCloseAccordion(opening, instant, $this);
			});
		};
		
	})();
	
		
	(function()
	{
		var MODAL_CLASS              = 'modal',
			BACKDROP_CLASS           = 'modalBackdrop',
			CLOSER_CLASS             = 'js-modal-close',
			AUTOFOCUS_CLASS          = 'js-modal-autoFocus',
			SCROLLBAR_PADDING_TARGET = 'js-scrollbarPaddingTarget',
			OPEN_CLASS               = 'isModalOpen';

		// Handles focusing and UI changes
		var modalManager = (function()
		{
			var openModals         = [],
				$previousFocusedEl = null,
				
				openModal = function(newModal)
				{
					if (!openModals.length)
					{
						$previousFocusedEl = $(document.activeElement);
					}
					else
					{
						// If it's already open, then remove it from its old position
						if (index = $.inArray(newModal, openModals) !== -1)
						{
							openModals.splice(index, 1);
						}
					}
	
					openModals.push(newModal);
					newModal.focusResume();
					refreshLayout();
				},
				
				closeModal = function(closedModal)
				{
					var index = $.inArray(closedModal, openModals);
	
					if (index !== -1)
					{
						openModals.splice(index, 1);
					}
					
					refreshLayout();
					
					if (!openModals.length)
					{
						if ($previousFocusedEl && $previousFocusedEl.is(':visible'))
						{
							$previousFocusedEl.focusWithoutScrolling();
						}
						else
						{
							$(document.activeElement).blur();
						}
					}
					else
					{
						openModals[openModals.length - 1].focusResume();
					}
				},

				refreshLayout = function()
				{
					if (openModals.length)
					{
						var val = Deku.Utils.measureScrollbar();
	
						$('body').addClass(OPEN_CLASS).css('margin-right', val);
						$('.' + SCROLLBAR_PADDING_TARGET).css('padding-right', val);
					}
					else
					{
						$('body').removeClass(OPEN_CLASS).css('margin-right', '');
						$('.' + SCROLLBAR_PADDING_TARGET).css('padding-right', '');
					}
				},

				closeAllModals = function()
				{
					while (openModals.length)
					{
						closeCurrentModal();
					}
				},

				closeCurrentModal = function()
				{
					var currentModal = getCurrentModal();
					
					if (currentModal)
					{
						currentModal.close();
					}
				},
			
				getCurrentModal = function()
				{
					return openModals.length ? openModals[openModals.length - 1] : false;
				};

			$(document).on('focusin.dekuModalManager.focusWatcher', function(e)
			{
				var $target = $(e.target),
					currentModal = getCurrentModal();
				
				if (currentModal)
				{
					if (!$target.parents('#' + currentModal.getBackdropID()).length)
					{
						currentModal.focusFirst();
					}
				}
				else
				{
					$previousFocusedEl = $target;
				}
			});

			return {
				'openModal': openModal,
				'closeModal': closeModal,
				'closeAllModals': closeAllModals,
				'closeCurrentModal': closeCurrentModal,
			};
		})();
		
		Deku.Modal = {};
		
		Deku.Modal.closeAllModals = modalManager.closeAllModals;
		
		Deku.Modal.closeCurrentModal = modalManager.closeCurrentModal;
		
		Deku.Modal.create =  function($element){$element.dekuModal();};
		
		Deku.Modal.template = function(options)
		{
			var defaults = {
				alignment: 'center',
				title: '',
				titleAlignment: 'center',
				headingType: 'plainBlue',
				headerExtra: null,
				content: null,
				alwaysScrollContent: false,
				autoHeight: false,
			};
			
			var opt = $.extend({}, defaults, options);
			
			var $modal = $('<div class="modal contentBox" tabindex="-1"></div'),
				$header = $('<div class="modal-header"></div>'),
				$content = $('<div class="modal-content"></div>');
			
			if (opt.headingType)
			{
				opt.headingType = 'heading--' + opt.headingType;
			}
			
			if (opt.titleAlignment)
			{
				opt.titleAlignment = 'heading-text--' + opt.titleAlignment;
			}
			
			$header.append(
				$('<div class="heading"></div>').addClass(opt.headingType).append(
					$('<h3 class="heading-text"></h3>').addClass(opt.titleAlignment).text(opt.title)
				).append($('<a class="heading-button js-modal-close -disableUserSelect" tabindex="0"><svg class="svgCross" viewBox="0 0 26 26"><use xlink:href="#svgDef-cross" class="svgCross-cross"></use></svg></a>'))
			);
			
			if (opt.headerExtra && opt.headerExtra instanceof $)
			{
				$header.append(opt.headerExtra);
			}
			
			if (opt.content && opt.content instanceof $)
			{
				$content.append(opt.content);
			}
			
			$modal.append($header)
				  .append($content);
			
			$modal.addClass('modal--' +opt.alignment);
			
			if (opt.alwaysScrollContent)
			{
				$modal.addClass('modal--alwaysScrollContent');
			}
			
			if (opt.autoHeight)
			{
				$modal.addClass('modal--autoHeight');
			}
			
			return $modal;
		};
		
		Deku.Modal.errorTemplate = function(msg)
		{
			return $('<div class="modalError"><h3 class="modalError-title">Error!</h3></div>').append(
				$('<p class="modalError-text"></p>').text(msg)
			);
		};
		
		Deku.Modal.loadingTemplate = function()
		{
			return $('<div class="modalLoading"><svg class="svgLoading" viewBox="0 0 32 32"><use class="svgLoading-line1" xlink:href="#svgDef-loading-line1"/><use class="svgLoading-line2" xlink:href="#svgDef-loading-line2"/><use class="svgLoading-line3" xlink:href="#svgDef-loading-line3"/><use class="svgLoading-line4" xlink:href="#svgDef-loading-line4"/><use class="svgLoading-line5" xlink:href="#svgDef-loading-line5"/><use class="svgLoading-line6" xlink:href="#svgDef-loading-line6"/><use class="svgLoading-line7" xlink:href="#svgDef-loading-line7"/><use class="svgLoading-line8" xlink:href="#svgDef-loading-line8"/></svg><p class="modalLoading-text">Loading...</p></div>');
		};
	
		
		function dekuModal(modal)
		{
			var self           = this,
				isOpen         = false,
				$modal		   = $(modal),
				$lastFocusedEl;
				
			var $backdrop = $modal.parent('.' + BACKDROP_CLASS);
			if ($backdrop.length)
			{
				if (!$backdrop.attr('id'))
				{
					$backdrop.attr('id', Deku.Utils.uniqueId());
				}
			}
			else
			{
				$backdrop = $('<div></div>')
					.addClass(BACKDROP_CLASS)
					.attr('id', Deku.Utils.uniqueId())
					.append($modal);
			}

			$backdrop.appendTo('body')
					 .dekuFocusLoop()
					 .on('click.dekuModal', backdropClose);

			$modal.attr('aria-role', 'dialog')
				  .attr('aria-modal', 'true')
				  .on('click.dekuModal', '.' + CLOSER_CLASS, onClickClose)
				  .on('keypress.dekuModal', '.' + CLOSER_CLASS, onKeyboardClose)
				  .on('keyup.dekuModal', onEscClose)
				  .on('focusin.dekuModal', onFocusIn);

			this.open = function()
			{
				if (isOpen)
				{
					return;
				}
				
				isOpen = true;
				$backdrop.appendTo('body');
				Deku.Utils.transitionClass($backdrop, 'isVisible', true, false, function(){modalManager.openModal(self);});
			};

			this.close = function()
			{
				if (!isOpen)
				{
					return;
				}
				
				isOpen = false;
				modalManager.closeModal(self);
				Deku.Utils.transitionClass($backdrop, 'isVisible', false);
			};

			this.focusFirst = function()
			{
				if (!isOpen)
				{
					return;
				}

				$backdrop.dekuFocusLoop('focusFirst');
			};

			this.focusResume = function()
			{
				if (!isOpen)
				{
					return;
				}
				
				if ($lastFocusedEl && !$.contains(document.body, $lastFocusedEl[0]))
				{
					$lastFocusedEl = null;
				}
				
				var $target = $lastFocusedEl;

				if (!$target)
				{
					var $focusable = $modal.find(':focusable');
					
					// First try the autofocus override
					$target = $focusable.filter('.' + AUTOFOCUS_CLASS).first();

					if (!$target.length)
					{
						// Next try find a focusable element, but not the close button
						$target = $focusable.filter(':not(.' + CLOSER_CLASS + ')').first();
						if (!$target.length)
						{
							
							// If all else fails, just get the close button
							// If by this point there is nothing focusable, it's not our problem
							$target = $focusable.first();
						}
					}
				}
				
				$target.focusWithoutScrolling();
			};
			
			this.getBackdropID = function()
			{
				return $backdrop.attr('id');
			};
			
			this.isOpen = function()
			{
				return isOpen;
			};

			function onClickClose(e)
			{
				self.close();
			};

			function onKeyboardClose(e)
			{
				if ((e.which === keyCode.enter || e.which === keyCode.space) && !e.altKey)
				{
					$lastFocusedEl = null;
					self.close();
				}
			};
	
			function onEscClose(e)
			{
				if (e.which === keyCode.esc && !e.altKey)
				{
					self.close();
				}
			};
	
			function backdropClose(e)
			{
				var $this = $(this);

				if ($this.is(e.target))
				{
					self.close();
				}
			};
	
			function onFocusIn(e)
			{
				$this = $(e.target);
				if (!$this.hasClass(CLOSER_CLASS) && !$this.is($modal))
				{
					$lastFocusedEl = $this;
				}
			};
		}
		
		Deku.registerjQueryPlugin('dekuModal', dekuModal, ['isOpen', 'getBackdropID'], {});
	})();
	
}( jQuery, window, document ));