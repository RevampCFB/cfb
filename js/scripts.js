// File#: _1_anim-menu-btn
// Usage: codyhouse.co/license
(function () {
    var menuBtns = document.getElementsByClassName('js-anim-menu-btn');
    if (menuBtns.length > 0) {
        for (var i = 0; i < menuBtns.length; i++) {
            (function (i) {
                initMenuBtn(menuBtns[i]);
            })(i);
        }

        function initMenuBtn(btn) {
            btn.addEventListener('click', function (event) {
                event.preventDefault();
                var status = !btn.classList.contains('anim-menu-btn--state-b');
                btn.classList.toggle('anim-menu-btn--state-b', status);
                // emit custom event
                var event = new CustomEvent('anim-menu-btn-clicked', {
                    detail: status
                });
                btn.dispatchEvent(event);
            });
        };
    }
}());
// File#: _2_flexi-header
// Usage: codyhouse.co/license
(function () {
    var flexHeader = document.getElementsByClassName('js-f-header');
    if (flexHeader.length > 0) {
        var menuTrigger = flexHeader[0].getElementsByClassName('js-anim-menu-btn')[0],
            firstFocusableElement = getMenuFirstFocusable();

        // we'll use these to store the node that needs to receive focus when the mobile menu is closed 
        var focusMenu = false;

        resetFlexHeaderOffset();
        setAriaButtons();

        menuTrigger.addEventListener('anim-menu-btn-clicked', function (event) {
            toggleMenuNavigation(event.detail);
        });

        // listen for key events
        window.addEventListener('keyup', function (event) {
            // listen for esc key
            if ((event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape')) {
                // close navigation on mobile if open
                if (menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger)) {
                    focusMenu = menuTrigger; // move focus to menu trigger when menu is close
                    menuTrigger.click();
                }
            }
            // listen for tab key
            if ((event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab')) {
                // close navigation on mobile if open when nav loses focus
                if (menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger) && !document.activeElement.closest('.js-f-header')) menuTrigger.click();
            }
        });

        // detect click on a dropdown control button - expand-on-mobile only
        flexHeader[0].addEventListener('click', function (event) {
            var btnLink = event.target.closest('.js-f-header__dropdown-control');
            if (!btnLink) return;
            !btnLink.getAttribute('aria-expanded') ? btnLink.setAttribute('aria-expanded', 'true') : btnLink.removeAttribute('aria-expanded');
        });

        // detect mouseout from a dropdown control button - expand-on-mobile only
        flexHeader[0].addEventListener('mouseout', function (event) {
            var btnLink = event.target.closest('.js-f-header__dropdown-control');
            if (!btnLink) return;
            // check layout type
            if (getLayout() == 'mobile') return;
            btnLink.removeAttribute('aria-expanded');
        });

        // close dropdown on focusout - expand-on-mobile only
        flexHeader[0].addEventListener('focusin', function (event) {
            var btnLink = event.target.closest('.js-f-header__dropdown-control'),
                dropdown = event.target.closest('.f-header__dropdown');
            if (dropdown) return;
            if (btnLink && btnLink.hasAttribute('aria-expanded')) return;
            // check layout type
            if (getLayout() == 'mobile') return;
            var openDropdown = flexHeader[0].querySelector('.js-f-header__dropdown-control[aria-expanded="true"]');
            if (openDropdown) openDropdown.removeAttribute('aria-expanded');
        });

        // listen for resize
        var resizingId = false;
        window.addEventListener('resize', function () {
            clearTimeout(resizingId);
            resizingId = setTimeout(doneResizing, 500);
        });

        function getMenuFirstFocusable() {
            var focusableEle = flexHeader[0].getElementsByClassName('f-header__nav')[0].querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'),
                firstFocusable = false;
            for (var i = 0; i < focusableEle.length; i++) {
                if (focusableEle[i].offsetWidth || focusableEle[i].offsetHeight || focusableEle[i].getClientRects().length) {
                    firstFocusable = focusableEle[i];
                    break;
                }
            }

            return firstFocusable;
        };

        function isVisible(element) {
            return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
        };

        function doneResizing() {
            if (!isVisible(menuTrigger) && flexHeader[0].classList.contains('f-header--expanded')) {
                menuTrigger.click();
            }
            resetFlexHeaderOffset();
        };

        function toggleMenuNavigation(bool) { // toggle menu visibility on small devices
            document.getElementsByClassName('f-header__nav')[0].classList.toggle('f-header__nav--is-visible', bool);
            flexHeader[0].classList.toggle('f-header--expanded', bool);
            menuTrigger.setAttribute('aria-expanded', bool);
            if (bool) firstFocusableElement.focus(); // move focus to first focusable element
            else if (focusMenu) {
                focusMenu.focus();
                focusMenu = false;
            }
        };

        function resetFlexHeaderOffset() {
            // on mobile -> update max height of the flexi header based on its offset value (e.g., if there's a fixed pre-header element)
            document.documentElement.style.setProperty('--f-header-offset', flexHeader[0].getBoundingClientRect().top + 'px');
        };

        function setAriaButtons() {
            var btnDropdown = flexHeader[0].getElementsByClassName('js-f-header__dropdown-control');
            for (var i = 0; i < btnDropdown.length; i++) {
                var id = 'f-header-dropdown-' + i,
                    dropdown = btnDropdown[i].nextElementSibling;
                if (dropdown.hasAttribute('id')) {
                    id = dropdown.getAttribute('id');
                } else {
                    dropdown.setAttribute('id', id);
                }
                btnDropdown[i].setAttribute('aria-controls', id);
            }
        };

        function getLayout() {
            return getComputedStyle(flexHeader[0], ':before').getPropertyValue('content').replace(/\'|"/g, '');
        };
    }
}());
// File#: _1_scrolling-animations
// Usage: codyhouse.co/license
(function () {
    var ScrollFx = function (element, scrollableSelector) {
        this.element = element;
        this.options = [];
        this.boundingRect = this.element.getBoundingClientRect();
        this.windowHeight = window.innerHeight;
        this.scrollingFx = [];
        this.animating = [];
        this.deltaScrolling = [];
        this.observer = [];
        this.scrollableSelector = scrollableSelector; // if the scrollable element is not the window 
        this.scrollableElement = false;
        initScrollFx(this);
        // ToDo - option to pass two selectors to target the element start and stop animation scrolling values -> to be used for sticky/fixed elements
    };

    function initScrollFx(element) {
        // do not animate if reduced motion is on
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        // get scrollable element
        setScrollableElement(element);
        // get animation params
        var animation = element.element.getAttribute('data-scroll-fx');
        if (animation) {
            element.options.push(extractAnimation(animation));
        } else {
            getAnimations(element, 1);
        }
        // set Intersection Observer
        initObserver(element);
        // update params on resize
        initResize(element);
    };

    function setScrollableElement(element) {
        if (element.scrollableSelector) element.scrollableElement = document.querySelector(element.scrollableSelector);
    };

    function initObserver(element) {
        for (var i = 0; i < element.options.length; i++) {
            (function (i) {
                element.scrollingFx[i] = false;
                element.deltaScrolling[i] = getDeltaScrolling(element, i);
                element.animating[i] = false;

                element.observer[i] = new IntersectionObserver(
                    function (entries, observer) {
                        scrollFxCallback(element, i, entries, observer);
                    }, {
                        rootMargin: (element.options[i][5] - 100) + "% 0px " + (0 - element.options[i][4]) + "% 0px"
                    }
                );

                element.observer[i].observe(element.element);

                // set initial value
                setTimeout(function () {
                    animateScrollFx.bind(element, i)();
                })
            })(i);
        }
    };

    function scrollFxCallback(element, index, entries, observer) {
        if (entries[0].isIntersecting) {
            if (element.scrollingFx[index]) return; // listener for scroll event already added
            // reset delta
            resetDeltaBeforeAnim(element, index);
            triggerAnimateScrollFx(element, index);
        } else {
            if (!element.scrollingFx[index]) return; // listener for scroll event already removed
            window.removeEventListener('scroll', element.scrollingFx[index]);
            element.scrollingFx[index] = false;
        }
    };

    function triggerAnimateScrollFx(element, index) {
        element.scrollingFx[index] = animateScrollFx.bind(element, index);
        (element.scrollableElement) ?
        element.scrollableElement.addEventListener('scroll', element.scrollingFx[index]): window.addEventListener('scroll', element.scrollingFx[index]);
    };

    function animateScrollFx(index) {
        // if window scroll is outside the proper range -> return
        if (getScrollY(this) < this.deltaScrolling[index][0]) {
            setCSSProperty(this, index, this.options[index][1]);
            return;
        }
        if (getScrollY(this) > this.deltaScrolling[index][1]) {
            setCSSProperty(this, index, this.options[index][2]);
            return;
        }
        if (this.animating[index]) return;
        this.animating[index] = true;
        window.requestAnimationFrame(updatePropertyScroll.bind(this, index));
    };

    function updatePropertyScroll(index) { // get value
        // check if this is a theme value or a css property
        if (isNaN(this.options[index][1])) {
            // this is a theme value to update
            (getScrollY(this) >= this.deltaScrolling[index][1]) ?
            setCSSProperty(this, index, this.options[index][2]): setCSSProperty(this, index, this.options[index][1]);
        } else {
            // this is a CSS property
            var value = this.options[index][1] + (this.options[index][2] - this.options[index][1]) * (getScrollY(this) - this.deltaScrolling[index][0]) / (this.deltaScrolling[index][1] - this.deltaScrolling[index][0]);
            // update css property
            setCSSProperty(this, index, value);
        }

        this.animating[index] = false;
    };

    function setCSSProperty(element, index, value) {
        if (isNaN(value)) {
            // this is a theme value that needs to be updated
            setThemeValue(element, value);
            return;
        }
        if (element.options[index][0] == '--scroll-fx-skew' || element.options[index][0] == '--scroll-fx-scale') {
            // set 2 different CSS properties for the transformation on both x and y axis
            element.element.style.setProperty(element.options[index][0] + '-x', value + element.options[index][3]);
            element.element.style.setProperty(element.options[index][0] + '-y', value + element.options[index][3]);
        } else {
            // set single CSS property
            element.element.style.setProperty(element.options[index][0], value + element.options[index][3]);
        }
    };

    function setThemeValue(element, value) {
        // if value is different from the theme in use -> update it
        if (element.element.getAttribute('data-theme') != value) {
            element.element.classList.add('scroll-fx--theme-transition');
            element.element.offsetWidth;
            element.element.setAttribute('data-theme', value);
            element.element.addEventListener('transitionend', function cb() {
                element.element.removeEventListener('transitionend', cb);
                element.element.classList.remove('scroll-fx--theme-transition');
            });
        }
    };

    function getAnimations(element, index) {
        var option = element.element.getAttribute('data-scroll-fx-' + index);
        if (option) {
            // multiple animations for the same element - iterate through them
            element.options.push(extractAnimation(option));
            getAnimations(element, index + 1);
        }
        return;
    };

    function extractAnimation(option) {
        var array = option.split(',').map(function (item) {
            return item.trim();
        });
        var propertyOptions = getPropertyValues(array[1], array[2]);
        var animation = [getPropertyLabel(array[0]), propertyOptions[0], propertyOptions[1], propertyOptions[2], parseInt(array[3]), parseInt(array[4])];
        return animation;
    };

    function getPropertyLabel(property) {
        var propertyCss = '--scroll-fx-';
        for (var i = 0; i < property.length; i++) {
            propertyCss = (property[i] == property[i].toUpperCase()) ?
                propertyCss + '-' + property[i].toLowerCase() :
                propertyCss + property[i];
        }
        if (propertyCss == '--scroll-fx-rotate') {
            propertyCss = '--scroll-fx-rotate-z';
        } else if (propertyCss == '--scroll-fx-translate') {
            propertyCss = '--scroll-fx-translate-x';
        }
        return propertyCss;
    };

    function getPropertyValues(val1, val2) {
        var nbVal1 = parseFloat(val1),
            nbVal2 = parseFloat(val2),
            unit = val1.replace(nbVal1, '');
        if (isNaN(nbVal1)) {
            // property is a theme value
            nbVal1 = val1;
            nbVal2 = val2;
            unit = '';
        }
        return [nbVal1, nbVal2, unit];
    };

    function getDeltaScrolling(element, index) {
        // this retrieve the max and min scroll value that should trigger the animation
        var topDelta = getScrollY(element) - (element.windowHeight - (element.windowHeight + element.boundingRect.height) * element.options[index][4] / 100) + element.boundingRect.top,
            bottomDelta = getScrollY(element) - (element.windowHeight - (element.windowHeight + element.boundingRect.height) * element.options[index][5] / 100) + element.boundingRect.top;
        return [topDelta, bottomDelta];
    };

    function initResize(element) {
        var resizingId = false;
        window.addEventListener('resize', function () {
            clearTimeout(resizingId);
            resizingId = setTimeout(resetResize.bind(element), 500);
        });
        // emit custom event -> elements have been initialized
        var event = new CustomEvent('scrollFxReady');
        element.element.dispatchEvent(event);
    };

    function resetResize() {
        // on resize -> make sure to update all scrolling delta values
        this.boundingRect = this.element.getBoundingClientRect();
        this.windowHeight = window.innerHeight;
        for (var i = 0; i < this.deltaScrolling.length; i++) {
            this.deltaScrolling[i] = getDeltaScrolling(this, i);
            animateScrollFx.bind(this, i)();
        }
        // emit custom event -> elements have been resized
        var event = new CustomEvent('scrollFxResized');
        this.element.dispatchEvent(event);
    };

    function resetDeltaBeforeAnim(element, index) {
        element.boundingRect = element.element.getBoundingClientRect();
        element.windowHeight = window.innerHeight;
        element.deltaScrolling[index] = getDeltaScrolling(element, index);
    };

    function getScrollY(element) {
        if (!element.scrollableElement) return window.scrollY;
        return element.scrollableElement.scrollTop;
    }

    window.ScrollFx = ScrollFx;

    var scrollFx = document.getElementsByClassName('js-scroll-fx');
    for (var i = 0; i < scrollFx.length; i++) {
        (function (i) {
            var scrollableElement = scrollFx[i].getAttribute('data-scrollable-element');
            new ScrollFx(scrollFx[i], scrollableElement);
        })(i);
    }
}());
if (!Util)

function Util() {};

Math.easeOutQuart = function (t, b, c, d) {
    t /= d;
    t--;
    return -c * (t * t * t * t - 1) + b;
};


// File#: _1_overscroll-section
// Usage: codyhouse.co/license
(function () {
    var OverscrollSection = function (element) {
        this.element = element;
        this.stickyContent = this.element.getElementsByClassName('js-overscroll-section__sticky-content');
        this.scrollContent = this.element.getElementsByClassName('js-overscroll-section__scroll-content');
        this.scrollingFn = false;
        this.scrolling = false;
        this.resetOpacity = false;
        this.disabledClass = 'overscroll-section--disabled';
        initOverscrollSection(this);
    };

    function initOverscrollSection(element) {
        // set position of sticky element
        setTop(element);
        // create a new node - to be inserted before the scroll element
        createPrevElement(element);
        // on resize -> reset element top position
        element.element.addEventListener('update-overscroll-section', function () {
            setTop(element);
            setPrevElementTop(element);
        });
        // set initial opacity value
        animateOverscrollSection.bind(element)();
        // change opacity of layer
        var observer = new IntersectionObserver(overscrollSectionCallback.bind(element));
        observer.observe(element.prevElement);
    };

    function createPrevElement(element) {
        if (element.scrollContent.length == 0) return;
        var newElement = document.createElement("div");
        newElement.setAttribute('aria-hidden', 'true');
        element.element.insertBefore(newElement, element.scrollContent[0]);
        element.prevElement = element.scrollContent[0].previousElementSibling;
        element.prevElement.style.opacity = '0';
        setPrevElementTop(element);
    };

    function setPrevElementTop(element) {
        element.prevElementTop = element.prevElement.getBoundingClientRect().top + window.scrollY;
    };

    function overscrollSectionCallback(entries) {
        if (entries[0].isIntersecting) {
            if (this.scrollingFn) return; // listener for scroll event already added
            overscrollSectionInitEvent(this);
        } else {
            if (!this.scrollingFn) return; // listener for scroll event already removed
            window.removeEventListener('scroll', this.scrollingFn);
            updateOpacityValue(this, 0);
            this.scrollingFn = false;
        }
    };

    function overscrollSectionInitEvent(element) {
        element.scrollingFn = overscrollSectionScrolling.bind(element);
        window.addEventListener('scroll', element.scrollingFn);
    };

    function overscrollSectionScrolling() {
        if (this.scrolling) return;
        this.scrolling = true;
        window.requestAnimationFrame(animateOverscrollSection.bind(this));
    };

    function animateOverscrollSection() {
        if (this.stickyContent.length == 0) return;
        setPrevElementTop(this);
        if (parseInt(this.stickyContent[0].style.top) != window.innerHeight - this.stickyContent[0].offsetHeight) {
            setTop(this);
        }
        if (this.prevElementTop - window.scrollY < window.innerHeight * 2 / 3) {
            var opacity = Math.easeOutQuart(window.innerHeight * 2 / 3 + window.scrollY - this.prevElementTop, 0, 1, window.innerHeight * 2 / 3);
            if (opacity > 0) {
                this.resetOpacity = false;
                updateOpacityValue(this, opacity);
            } else if (!this.resetOpacity) {
                this.resetOpacity = true;
                updateOpacityValue(this, 0);
            }
        } else {
            updateOpacityValue(this, 0);
        }
        this.scrolling = false;
    };

    function updateOpacityValue(element, value) {
        element.element.style.setProperty('--overscroll-section-opacity', value);
    };

    function setTop(element) {
        if (element.stickyContent.length == 0) return;
        var translateValue = window.innerHeight - element.stickyContent[0].offsetHeight;
        element.stickyContent[0].style.top = translateValue + 'px';
        // check if effect should be disabled
        element.element.classList.toggle(element.disabledClass, translateValue > 2);
    };

    //initialize the OverscrollSection objects
    var overscrollSections = document.getElementsByClassName('js-overscroll-section');
    var stickySupported = CSS.supports('position', 'sticky') || CSS.supports('position', '-webkit-sticky'),
        intObservSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype),
        reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (overscrollSections.length > 0 && stickySupported && !reducedMotion && intObservSupported) {
        var overscrollSectionsArray = [];
        for (var i = 0; i < overscrollSections.length; i++) {
            (function (i) {
                overscrollSectionsArray.push(new OverscrollSection(overscrollSections[i]));
            })(i);
        }

        var resizingId = false,
            customEvent = new CustomEvent('update-overscroll-section');

        window.addEventListener('resize', function () {
            clearTimeout(resizingId);
            resizingId = setTimeout(doneResizing, 100);
        });

        // wait for font to be loaded
        document.fonts.onloadingdone = function (fontFaceSetEvent) {
            doneResizing();
        };

        function doneResizing() {
            for (var i = 0; i < overscrollSectionsArray.length; i++) {
                (function (i) {
                    overscrollSectionsArray[i].element.dispatchEvent(customEvent)
                })(i);
            };
        };
    }
}());
if (!Util) function Util() {}

Util.addClass = function (el, className) {
  var classList = className.split(" ");
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(" "));
};

Util.removeClass = function (el, className) {
  var classList = className.split(" ");
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(" "));
};

Util.getIndexInArray = function (array, el) {
  return Array.prototype.indexOf.call(array, el);
};

Util.osHasReducedMotion = function () {
  if (!window.matchMedia) return false;
  var matchMediaObj = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (matchMediaObj) return matchMediaObj.matches;
  return false;
};

// File#: _1_reveal-effects
// Usage: codyhouse.co/license
(function () {
  var fxElements = document.getElementsByClassName("reveal-fx");
  var intersectionObserverSupported =
    "IntersectionObserver" in window &&
    "IntersectionObserverEntry" in window &&
    "intersectionRatio" in window.IntersectionObserverEntry.prototype;
  if (fxElements.length > 0) {
    // deactivate effect if Reduced Motion is enabled
    if (Util.osHasReducedMotion() || !intersectionObserverSupported) {
      fxRemoveClasses();
      return;
    }
    //on small devices, do not animate elements -> reveal all
    if (fxDisabled(fxElements[0])) {
      fxRevealAll();
      return;
    }

    var fxRevealDelta = 120; // amount (in pixel) the element needs to enter the viewport to be revealed - if not custom value (data-reveal-fx-delta)

    var viewportHeight = window.innerHeight,
      fxChecking = false,
      fxRevealedItems = [],
      fxElementDelays = fxGetDelays(), //elements animation delay
      fxElementDeltas = fxGetDeltas(); // amount (in px) the element needs enter the viewport to be revealed (default value is fxRevealDelta)

    // add event listeners
    window.addEventListener("load", fxReveal);
    window.addEventListener("resize", fxResize);
    window.addEventListener("restartAll", fxRestart);

    // observe reveal elements
    var observer = [];
    initObserver();

    function initObserver() {
      for (var i = 0; i < fxElements.length; i++) {
        observer[i] = new IntersectionObserver(
          function (entries, observer) {
            if (entries[0].isIntersecting) {
              fxRevealItemObserver(entries[0].target);
              observer.unobserve(entries[0].target);
            }
          },
          { rootMargin: "0px 0px -" + fxElementDeltas[i] + "px 0px" }
        );

        observer[i].observe(fxElements[i]);
      }
    }

    function fxRevealAll() {
      // reveal all elements - small devices
      for (var i = 0; i < fxElements.length; i++) {
        Util.addClass(fxElements[i], "reveal-fx--is-visible");
      }
    }

    function fxResize() {
      // on resize - check new window height and reveal visible elements
      if (fxChecking) return;
      fxChecking = true;
      !window.requestAnimationFrame
        ? setTimeout(function () {
            fxReset();
          }, 250)
        : window.requestAnimationFrame(fxReset);
    }

    function fxReset() {
      viewportHeight = window.innerHeight;
      fxReveal();
    }

    function fxReveal() {
      // reveal visible elements
      for (var i = 0; i < fxElements.length; i++) {
        (function (i) {
          if (fxRevealedItems.indexOf(i) != -1) return; //element has already been revelead
          if (fxElementIsVisible(fxElements[i], i)) {
            fxRevealItem(i);
            fxRevealedItems.push(i);
          }
        })(i);
      }
      fxResetEvents();
      fxChecking = false;
    }

    function fxRevealItem(index) {
      if (fxElementDelays[index] && fxElementDelays[index] != 0) {
        // wait before revealing element if a delay was added
        setTimeout(function () {
          Util.addClass(fxElements[index], "reveal-fx--is-visible");
        }, fxElementDelays[index]);
      } else {
        Util.addClass(fxElements[index], "reveal-fx--is-visible");
      }
    }

    function fxRevealItemObserver(item) {
      var index = Util.getIndexInArray(fxElements, item);
      if (fxRevealedItems.indexOf(index) != -1) return; //element has already been revelead
      fxRevealItem(index);
      fxRevealedItems.push(index);
      fxResetEvents();
      fxChecking = false;
    }

    function fxGetDelays() {
      // get anmation delays
      var delays = [];
      for (var i = 0; i < fxElements.length; i++) {
        delays.push(
          fxElements[i].getAttribute("data-reveal-fx-delay")
            ? parseInt(fxElements[i].getAttribute("data-reveal-fx-delay"))
            : 0
        );
      }
      return delays;
    }

    function fxGetDeltas() {
      // get reveal delta
      var deltas = [];
      for (var i = 0; i < fxElements.length; i++) {
        deltas.push(
          fxElements[i].getAttribute("data-reveal-fx-delta")
            ? parseInt(fxElements[i].getAttribute("data-reveal-fx-delta"))
            : fxRevealDelta
        );
      }
      return deltas;
    }

    function fxDisabled(element) {
      // check if elements need to be animated - no animation on small devices
      return !(
        window
          .getComputedStyle(element, "::before")
          .getPropertyValue("content")
          .replace(/'|"/g, "") == "reveal-fx"
      );
    }

    function fxElementIsVisible(element, i) {
      // element is inside viewport
      return fxGetElementPosition(element) <= viewportHeight - fxElementDeltas[i];
    }

    function fxGetElementPosition(element) {
      // get top position of element
      return element.getBoundingClientRect().top;
    }

    function fxResetEvents() {
      if (fxElements.length > fxRevealedItems.length) return;
      // remove event listeners if all elements have been revealed
      window.removeEventListener("load", fxReveal);
      window.removeEventListener("resize", fxResize);
    }

    function fxRemoveClasses() {
      // Reduced Motion on or Intersection Observer not supported
      while (fxElements[0]) {
        // remove all classes starting with 'reveal-fx--'
        var classes = fxElements[0]
          .getAttribute("class")
          .split(" ")
          .filter(function (c) {
            return c.lastIndexOf("reveal-fx--", 0) !== 0;
          });
        fxElements[0].setAttribute("class", classes.join(" ").trim());
        Util.removeClass(fxElements[0], "reveal-fx");
      }
    }

    function fxRestart() {
      // restart the reveal effect -> hide all elements and re-init the observer
      if (
        Util.osHasReducedMotion() ||
        !intersectionObserverSupported ||
        fxDisabled(fxElements[0])
      ) {
        return;
      }
      // check if we need to add the event listensers back
      if (fxElements.length <= fxRevealedItems.length) {
        window.addEventListener("load", fxReveal);
        window.addEventListener("resize", fxResize);
      }
      // remove observer and reset the observer array
      for (var i = 0; i < observer.length; i++) {
        if (observer[i]) observer[i].disconnect();
      }
      observer = [];
      // remove visible class
      for (var i = 0; i < fxElements.length; i++) {
        Util.removeClass(fxElements[i], "reveal-fx--is-visible");
      }
      // reset fxRevealedItems array
      fxRevealedItems = [];
      // restart observer
      initObserver();
    }
  }
})();

// File#: _1_table
// Usage: codyhouse.co/license
(function () {
    function initTable(table) {
        checkTableLayour(table); // switch from a collapsed to an expanded layout
        table.classList.add('table--loaded'); // show table

        // custom event emitted when window is resized
        table.addEventListener('update-table', function (event) {
            checkTableLayour(table);
        });
    };

    function checkTableLayour(table) {
        var layout = getComputedStyle(table, ':before').getPropertyValue('content').replace(/\'|"/g, '');
        table.classList.toggle(tableExpandedLayoutClass, layout != 'collapsed');
    };

    var tables = document.getElementsByClassName('js-table'),
        tableExpandedLayoutClass = 'table--expanded';
    if (tables.length > 0) {
        var j = 0;
        for (var i = 0; i < tables.length; i++) {
            var beforeContent = getComputedStyle(tables[i], ':before').getPropertyValue('content');
            if (beforeContent && beforeContent != '' && beforeContent != 'none') {
                (function (i) {
                    initTable(tables[i]);
                })(i);
                j = j + 1;
            } else {
                tables[i].classList.add('table--loaded');
            }
        }

        if (j > 0) {
            var resizingId = false,
                customEvent = new CustomEvent('update-table');
            window.addEventListener('resize', function (event) {
                clearTimeout(resizingId);
                resizingId = setTimeout(doneResizing, 300);
            });

            function doneResizing() {
                for (var i = 0; i < tables.length; i++) {
                    (function (i) {
                        tables[i].dispatchEvent(customEvent)
                    })(i);
                };
            };

            (window.requestAnimationFrame) // init table layout
            ?
            window.requestAnimationFrame(doneResizing): doneResizing();
        }
    }
}());
// File#: _1_countup
// Usage: codyhouse.co/license
(function () {
  var CountUp = function (opts) {
    this.options = extendProps(CountUp.defaults, opts);
    this.element = this.options.element;
    this.initialValue = parseFloat(this.options.initial);
    this.finalValue = parseFloat(this.element.textContent);
    this.deltaValue = parseFloat(this.options.delta);
    this.intervalId;
    this.animationTriggered = false;
    this.srClass = "sr-only";
    initCountUp(this);
  };

  CountUp.prototype.reset = function () {
    // reset element to its initial value
    window.cancelAnimationFrame(this.intervalId);
    this.element.textContent = this.initialValue;
  };

  CountUp.prototype.restart = function () {
    // restart element animation
    countUpAnimate(this);
  };

  function initCountUp(countup) {
    // reset initial value
    countup.initialValue = getCountupStart(countup);

    // reset countUp for SR
    initCountUpSr(countup);

    // listen for the element to enter the viewport -> start animation
    var observer = new IntersectionObserver(countupObserve.bind(countup), { threshold: [0, 0.1] });
    observer.observe(countup.element);

    // listen to events
    countup.element.addEventListener("countUpReset", function () {
      countup.reset();
    });
    countup.element.addEventListener("countUpRestart", function () {
      countup.restart();
    });
  }

  function countUpShow(countup) {
    // reveal countup after it has been initialized
    countup.element.closest(".countup").classList.add("countup--is-visible");
  }

  function countupObserve(entries, observer) {
    // observe countup position -> start animation when inside viewport
    if (entries[0].intersectionRatio.toFixed(1) > 0 && !this.animationTriggered) {
      countUpAnimate(this);
    }
  }

  function countUpAnimate(countup) {
    // animate countup
    countup.element.textContent = countup.initialValue;
    countUpShow(countup);
    window.cancelAnimationFrame(countup.intervalId);
    var currentTime = null;

    function runCountUp(timestamp) {
      if (!currentTime) currentTime = timestamp;
      var progress = timestamp - currentTime;
      if (progress > countup.options.duration) progress = countup.options.duration;
      var val = getValEaseOut(
        progress,
        countup.initialValue,
        countup.finalValue - countup.initialValue,
        countup.options.duration
      );
      countup.element.textContent = getCountUpValue(val, countup);
      if (progress < countup.options.duration) {
        countup.intervalId = window.requestAnimationFrame(runCountUp);
      } else {
        countUpComplete(countup);
      }
    }

    countup.intervalId = window.requestAnimationFrame(runCountUp);
  }

  function getCountUpValue(val, countup) {
    // reset new countup value to proper decimal places+separator
    if (countup.options.decimal) {
      val = parseFloat(val.toFixed(countup.options.decimal));
    } else {
      val = parseInt(val);
    }
    if (countup.options.separator) val = val.toLocaleString("en");
    return val;
  }

  function countUpComplete(countup) {
    // emit event when animation is over
    countup.element.dispatchEvent(new CustomEvent("countUpComplete"));
    countup.animationTriggered = true;
  }

  function initCountUpSr(countup) {
    // make sure countup is accessible
    // hide elements that will be animated to SR
    countup.element.setAttribute("aria-hidden", "true");
    // create new element with visible final value - accessible to SR only
    var srValue = document.createElement("span");
    srValue.textContent = countup.finalValue;
    srValue.classList.add(countup.srClass);
    countup.element.parentNode.insertBefore(srValue, countup.element.nextSibling);
  }

  function getCountupStart(countup) {
    return countup.deltaValue > 0 ? countup.finalValue - countup.deltaValue : countup.initialValue;
  }

  function getValEaseOut(t, b, c, d) {
    t /= d;
    return -c * t * (t - 2) + b;
  }

  var extendProps = function () {
    // Variables
    var extended = {};
    var deep = false;
    var i = 0;
    var length = arguments.length;

    // Check if a deep merge
    if (Object.prototype.toString.call(arguments[0]) === "[object Boolean]") {
      deep = arguments[0];
      i++;
    }

    // Merge the object into the extended object
    var merge = function (obj) {
      for (var prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
          // If deep merge and property is an object, merge properties
          if (deep && Object.prototype.toString.call(obj[prop]) === "[object Object]") {
            extended[prop] = extend(true, extended[prop], obj[prop]);
          } else {
            extended[prop] = obj[prop];
          }
        }
      }
    };

    // Loop through each object and conduct a merge
    for (; i < length; i++) {
      var obj = arguments[i];
      merge(obj);
    }

    return extended;
  };

  CountUp.defaults = {
    element: "",
    separator: false,
    duration: 3000,
    decimal: false,
    initial: 0,
    delta: 0,
  };

  window.CountUp = CountUp;

  //initialize the CountUp objects
  var countUp = document.getElementsByClassName("js-countup");
  if (countUp.length > 0) {
    for (var i = 0; i < countUp.length; i++) {
      (function (i) {
        var separator = countUp[i].getAttribute("data-countup-sep")
            ? countUp[i].getAttribute("data-countup-sep")
            : false,
          duration = countUp[i].getAttribute("data-countup-duration")
            ? countUp[i].getAttribute("data-countup-duration")
            : CountUp.defaults.duration,
          decimal = countUp[i].getAttribute("data-countup-decimal")
            ? countUp[i].getAttribute("data-countup-decimal")
            : false,
          initial = countUp[i].getAttribute("data-countup-start")
            ? countUp[i].getAttribute("data-countup-start")
            : 0,
          delta = countUp[i].getAttribute("data-countup-delta")
            ? countUp[i].getAttribute("data-countup-delta")
            : 0;
        new CountUp({
          element: countUp[i],
          separator: separator,
          duration: duration,
          decimal: decimal,
          initial: initial,
          delta: delta,
        });
      })(i);
    }
  }
})();

// File#: _1_swipe-content
(function () {
  var SwipeContent = function (element) {
    this.element = element;
    this.delta = [false, false];
    this.dragging = false;
    this.intervalId = false;
    initSwipeContent(this);
  };

  function initSwipeContent(content) {
    content.element.addEventListener("mousedown", handleEvent.bind(content));
    content.element.addEventListener("touchstart", handleEvent.bind(content), { passive: true });
  }

  function initDragging(content) {
    //add event listeners
    content.element.addEventListener("mousemove", handleEvent.bind(content));
    content.element.addEventListener("touchmove", handleEvent.bind(content), { passive: true });
    content.element.addEventListener("mouseup", handleEvent.bind(content));
    content.element.addEventListener("mouseleave", handleEvent.bind(content));
    content.element.addEventListener("touchend", handleEvent.bind(content));
  }

  function cancelDragging(content) {
    //remove event listeners
    if (content.intervalId) {
      !window.requestAnimationFrame
        ? clearInterval(content.intervalId)
        : window.cancelAnimationFrame(content.intervalId);
      content.intervalId = false;
    }
    content.element.removeEventListener("mousemove", handleEvent.bind(content));
    content.element.removeEventListener("touchmove", handleEvent.bind(content));
    content.element.removeEventListener("mouseup", handleEvent.bind(content));
    content.element.removeEventListener("mouseleave", handleEvent.bind(content));
    content.element.removeEventListener("touchend", handleEvent.bind(content));
  }

  function handleEvent(event) {
    switch (event.type) {
      case "mousedown":
      case "touchstart":
        startDrag(this, event);
        break;
      case "mousemove":
      case "touchmove":
        drag(this, event);
        break;
      case "mouseup":
      case "mouseleave":
      case "touchend":
        endDrag(this, event);
        break;
    }
  }

  function startDrag(content, event) {
    content.dragging = true;
    // listen to drag movements
    initDragging(content);
    content.delta = [parseInt(unify(event).clientX), parseInt(unify(event).clientY)];
    // emit drag start event
    emitSwipeEvents(content, "dragStart", content.delta, event.target);
  }

  function endDrag(content, event) {
    cancelDragging(content);
    // credits: https://css-tricks.com/simple-swipe-with-vanilla-javascript/
    var dx = parseInt(unify(event).clientX),
      dy = parseInt(unify(event).clientY);

    // check if there was a left/right swipe
    if (content.delta && (content.delta[0] || content.delta[0] === 0)) {
      var s = getSign(dx - content.delta[0]);

      if (Math.abs(dx - content.delta[0]) > 30) {
        s < 0
          ? emitSwipeEvents(content, "swipeLeft", [dx, dy])
          : emitSwipeEvents(content, "swipeRight", [dx, dy]);
      }

      content.delta[0] = false;
    }
    // check if there was a top/bottom swipe
    if (content.delta && (content.delta[1] || content.delta[1] === 0)) {
      var y = getSign(dy - content.delta[1]);

      if (Math.abs(dy - content.delta[1]) > 30) {
        y < 0
          ? emitSwipeEvents(content, "swipeUp", [dx, dy])
          : emitSwipeEvents(content, "swipeDown", [dx, dy]);
      }

      content.delta[1] = false;
    }
    // emit drag end event
    emitSwipeEvents(content, "dragEnd", [dx, dy]);
    content.dragging = false;
  }

  function drag(content, event) {
    if (!content.dragging) return;
    // emit dragging event with coordinates
    !window.requestAnimationFrame
      ? (content.intervalId = setTimeout(function () {
          emitDrag.bind(content, event);
        }, 250))
      : (content.intervalId = window.requestAnimationFrame(emitDrag.bind(content, event)));
  }

  function emitDrag(event) {
    emitSwipeEvents(this, "dragging", [
      parseInt(unify(event).clientX),
      parseInt(unify(event).clientY),
    ]);
  }

  function unify(event) {
    // unify mouse and touch events
    return event.changedTouches ? event.changedTouches[0] : event;
  }

  function emitSwipeEvents(content, eventName, detail, el) {
    var trigger = false;
    if (el) trigger = el;
    // emit event with coordinates
    var event = new CustomEvent(eventName, {
      detail: { x: detail[0], y: detail[1], origin: trigger },
    });
    content.element.dispatchEvent(event);
  }

  function getSign(x) {
    if (!Math.sign) {
      return (x > 0) - (x < 0) || +x;
    } else {
      return Math.sign(x);
    }
  }

  window.SwipeContent = SwipeContent;

  //initialize the SwipeContent objects
  var swipe = document.getElementsByClassName("js-swipe-content");
  if (swipe.length > 0) {
    for (var i = 0; i < swipe.length; i++) {
      (function (i) {
        new SwipeContent(swipe[i]);
      })(i);
    }
  }
})();

// File#: _2_chart
// Usage: codyhouse.co/license
Math.easeOutQuart = function (t, b, c, d) {
  t /= d;
  t--;
  return -c * (t * t * t * t - 1) + b;
};

(function () {
  var Chart = function (opts) {
    this.options = extendProps(Chart.defaults, opts);
    this.element = this.options.element.getElementsByClassName("js-chart__area")[0];
    this.svgPadding = this.options.padding;
    this.topDelta = this.svgPadding;
    this.bottomDelta = 0;
    this.leftDelta = 0;
    this.rightDelta = 0;
    this.legendHeight = 0;
    this.yChartMaxWidth = 0;
    this.yAxisHeight = 0;
    this.xAxisWidth = 0;
    this.yAxisInterval = []; // used to store min and max value on y axis
    this.xAxisInterval = []; // used to store min and max value on x axis
    this.datasetScaled = []; // used to store set data converted to chart coordinates
    this.datasetScaledFlat = []; // used to store set data converted to chart coordinates for animation
    this.datasetAreaScaled = []; // used to store set data (area part) converted to chart coordinates
    this.datasetAreaScaledFlat = []; // used to store set data (area part)  converted to chart coordinates for animation
    // columns chart - store if x axis label where rotated
    this.xAxisLabelRotation = false;
    // tooltip
    this.interLine = false;
    this.markers = false;
    this.tooltipOn = this.options.tooltip && this.options.tooltip.enabled;
    this.tooltipClasses =
      this.tooltipOn && this.options.tooltip.classes ? this.options.tooltip.classes : "";
    this.tooltipPosition =
      this.tooltipOn && this.options.tooltip.position ? this.options.tooltip.position : false;
    this.tooltipDelta = 10;
    this.selectedMarker = false;
    this.selectedMarkerClass = "chart__marker--selected";
    this.selectedBarClass = "chart__data-bar--selected";
    this.hoverId = false;
    this.hovering = false;
    // events id
    this.eventIds = []; // will use to store event ids
    // accessibility
    this.categories = this.options.element.getElementsByClassName("js-chart__category");
    this.loaded = false;
    // init chart
    initChartInfo(this);
    initChart(this);
    // if externalDate == true
    initExternalData(this);
  };

  function initChartInfo(chart) {
    // we may need to store store some initial config details before setting up the chart
    if (chart.options.type == "column") {
      setChartColumnSize(chart);
    }
  }

  function initChart(chart) {
    if (chart.options.datasets.length == 0) return; // no data where provided
    if (!intObservSupported) chart.options.animate = false; // do not animate if intersectionObserver is not supported
    // init event ids variables
    intEventIds(chart);
    setChartSize(chart);
    createChartSvg(chart);
    createSrTables(chart); // chart accessibility
    animateChart(chart); // if animate option is true
    resizeChart(chart);
    chart.loaded = true;
  }

  function intEventIds(chart) {
    chart.eventIds["resize"] = false;
  }

  function setChartSize(chart) {
    chart.height = chart.element.clientHeight;
    chart.width = chart.element.clientWidth;
  }

  function createChartSvg(chart) {
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="' +
      chart.width +
      '" height="' +
      chart.height +
      '" class="chart__svg js-chart__svg"></svg>';
    chart.element.innerHTML = svg;
    chart.svg = chart.element.getElementsByClassName("js-chart__svg")[0];

    // create chart content
    switch (chart.options.type) {
      case "pie":
        getPieSvgCode(chart);
        break;
      case "doughnut":
        getDoughnutSvgCode(chart);
        break;
      case "column":
        getColumnSvgCode(chart);
        break;
      default:
        getLinearSvgCode(chart);
    }
  }

  function getLinearSvgCode(chart) {
    // svg for linear + area charts
    setYAxis(chart);
    setXAxis(chart);
    updateChartWidth(chart);
    placexAxisLabels(chart);
    placeyAxisLabels(chart);
    setChartDatasets(chart);
    initTooltips(chart);
  }

  function getColumnSvgCode(chart) {
    // svg for column charts
    setYAxis(chart);
    setXAxis(chart);
    updateChartWidth(chart);
    placexAxisLabels(chart);
    placeyAxisLabels(chart);
    resetColumnChart(chart);
    setColumnChartDatasets(chart);
    initTooltips(chart);
  }

  function setXAxis(chart) {
    // set legend of axis if available
    if (chart.options.xAxis && chart.options.xAxis.legend) {
      var textLegend = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textLegend.textContent = chart.options.xAxis.legend;
      setAttributes(textLegend, {
        class: "chart__axis-legend chart__axis-legend--x js-chart__axis-legend--x",
      });
      chart.svg.appendChild(textLegend);

      var xLegend = chart.element.getElementsByClassName("js-chart__axis-legend--x")[0];

      if (isVisible(xLegend)) {
        var size = xLegend.getBBox(),
          xPosition = chart.width / 2 - size.width / 2,
          yPosition = chart.height - chart.bottomDelta;

        setAttributes(xLegend, { x: xPosition, y: yPosition });
        chart.bottomDelta = chart.bottomDelta + size.height + chart.svgPadding;
      }
    }

    // get interval and create scale
    var xLabels;
    if (
      chart.options.xAxis &&
      chart.options.xAxis.labels &&
      chart.options.xAxis.labels.length > 1
    ) {
      xLabels = chart.options.xAxis.labels;
      chart.xAxisInterval = [0, chart.options.xAxis.labels.length - 1];
    } else {
      xLabels = getChartXLabels(chart); // this function is used to set chart.xAxisInterval as well
    }
    // modify axis labels
    if (chart.options.xAxis && chart.options.xAxis.labelModifier) {
      xLabels = modifyAxisLabel(xLabels, chart.options.xAxis.labelModifier);
    }

    var gEl = document.createElementNS("http://www.w3.org/2000/svg", "g");
    setAttributes(gEl, {
      class: "chart__axis-labels chart__axis-labels--x js-chart__axis-labels--x",
    });

    for (var i = 0; i < xLabels.length; i++) {
      var textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
      var labelClasses =
        chart.options.xAxis && chart.options.xAxis.labels
          ? "chart__axis-label chart__axis-label--x js-chart__axis-label"
          : "hide js-chart__axis-label";
      setAttributes(textEl, { class: labelClasses, "alignment-baseline": "middle" });
      textEl.textContent = xLabels[i];
      gEl.appendChild(textEl);
    }

    if (chart.options.xAxis && chart.options.xAxis.line) {
      var lineEl = document.createElementNS("http://www.w3.org/2000/svg", "line");
      setAttributes(lineEl, {
        class: "chart__axis chart__axis--x js-chart__axis--x",
        "stroke-linecap": "square",
      });
      gEl.appendChild(lineEl);
    }

    var ticksLength = xLabels.length;
    if (chart.options.type == "column") ticksLength = ticksLength + 1;

    for (var i = 0; i < ticksLength; i++) {
      var tickEl = document.createElementNS("http://www.w3.org/2000/svg", "line");
      var classTicks =
        chart.options.xAxis && chart.options.xAxis.ticks
          ? "chart__tick chart__tick-x js-chart__tick-x"
          : "js-chart__tick-x";
      setAttributes(tickEl, { class: classTicks, "stroke-linecap": "square" });
      gEl.appendChild(tickEl);
    }

    chart.svg.appendChild(gEl);
  }

  function setYAxis(chart) {
    // set legend of axis if available
    if (chart.options.yAxis && chart.options.yAxis.legend) {
      var textLegend = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textLegend.textContent = chart.options.yAxis.legend;
      textLegend.setAttribute(
        "class",
        "chart__axis-legend chart__axis-legend--y js-chart__axis-legend--y"
      );
      chart.svg.appendChild(textLegend);

      var yLegend = chart.element.getElementsByClassName("js-chart__axis-legend--y")[0];
      if (isVisible(yLegend)) {
        var height = yLegend.getBBox().height,
          xPosition = chart.leftDelta + height / 2,
          yPosition = chart.topDelta;

        setAttributes(yLegend, { x: xPosition, y: yPosition });
        chart.leftDelta = chart.leftDelta + height + chart.svgPadding;
      }
    }
    // get interval and create scale
    var yLabels;
    if (
      chart.options.yAxis &&
      chart.options.yAxis.labels &&
      chart.options.yAxis.labels.length > 1
    ) {
      yLabels = chart.options.yAxis.labels;
      chart.yAxisInterval = [0, chart.options.yAxis.labels.length - 1];
    } else {
      yLabels = getChartYLabels(chart); // this function is used to set chart.yAxisInterval as well
    }

    // modify axis labels
    if (chart.options.yAxis && chart.options.yAxis.labelModifier) {
      yLabels = modifyAxisLabel(yLabels, chart.options.yAxis.labelModifier);
    }

    var gEl = document.createElementNS("http://www.w3.org/2000/svg", "g");
    setAttributes(gEl, {
      class: "chart__axis-labels chart__axis-labels--y js-chart__axis-labels--y",
    });

    for (var i = yLabels.length - 1; i >= 0; i--) {
      var textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
      var labelClasses =
        chart.options.yAxis && chart.options.yAxis.labels
          ? "chart__axis-label chart__axis-label--y js-chart__axis-label"
          : "hide js-chart__axis-label";
      setAttributes(textEl, { class: labelClasses, "alignment-baseline": "middle" });
      textEl.textContent = yLabels[i];
      gEl.appendChild(textEl);
    }

    if (chart.options.yAxis && chart.options.yAxis.line) {
      var lineEl = document.createElementNS("http://www.w3.org/2000/svg", "line");
      setAttributes(lineEl, {
        class: "chart__axis chart__axis--y js-chart__axis--y",
        "stroke-linecap": "square",
      });
      gEl.appendChild(lineEl);
    }

    var hideGuides =
      chart.options.xAxis &&
      chart.options.xAxis.hasOwnProperty("guides") &&
      !chart.options.xAxis.guides;
    for (var i = 1; i < yLabels.length; i++) {
      var rectEl = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      setAttributes(rectEl, { class: "chart__guides js-chart__guides" });
      if (hideGuides) {
        setAttributes(rectEl, { class: "chart__guides js-chart__guides opacity-0" });
      }
      gEl.appendChild(rectEl);
    }
    chart.svg.appendChild(gEl);
  }

  function updateChartWidth(chart) {
    var labels = chart.element
      .getElementsByClassName("js-chart__axis-labels--y")[0]
      .querySelectorAll(".js-chart__axis-label");

    if (isVisible(labels[0])) {
      chart.yChartMaxWidth = getLabelMaxSize(labels, "width");
      chart.leftDelta =
        chart.leftDelta + chart.svgPadding + chart.yChartMaxWidth + chart.svgPadding;
    } else {
      chart.leftDelta = chart.leftDelta + chart.svgPadding;
    }

    var xLabels = chart.element
      .getElementsByClassName("js-chart__axis-labels--x")[0]
      .querySelectorAll(".js-chart__axis-label");
    if (isVisible(xLabels[0]) && !isVisible(labels[0])) {
      chart.leftDelta = chart.leftDelta + xLabels[0].getBBox().width * 0.5;
    }
  }

  function placeyAxisLabels(chart) {
    var labels = chart.element
      .getElementsByClassName("js-chart__axis-labels--y")[0]
      .querySelectorAll(".js-chart__axis-label");

    var labelsVisible = isVisible(labels[0]);
    var height = 0;
    if (labelsVisible) height = labels[0].getBBox().height * 0.5;

    // update topDelta and set chart height
    chart.topDelta = chart.topDelta + height + chart.svgPadding;
    chart.yAxisHeight = chart.height - chart.topDelta - chart.bottomDelta;

    var yDelta = chart.yAxisHeight / (labels.length - 1);

    var gridRect = chart.element.getElementsByClassName("js-chart__guides"),
      dasharray = "" + chart.xAxisWidth + " " + 2 * (chart.xAxisWidth + yDelta) + "";

    for (var i = 0; i < labels.length; i++) {
      var labelWidth = 0;
      if (labelsVisible) labelWidth = labels[i].getBBox().width;
      // chart.leftDelta has already been updated in updateChartWidth() function
      setAttributes(labels[i], {
        x: chart.leftDelta - labelWidth - 2 * chart.svgPadding,
        y: chart.topDelta + yDelta * i,
      });
      // place grid rectangles
      if (gridRect[i])
        setAttributes(gridRect[i], {
          x: chart.leftDelta,
          y: chart.topDelta + yDelta * i,
          height: yDelta,
          width: chart.xAxisWidth,
          "stroke-dasharray": dasharray,
        });
    }

    // place the y axis
    var yAxis = chart.element.getElementsByClassName("js-chart__axis--y");
    if (yAxis.length > 0) {
      setAttributes(yAxis[0], {
        x1: chart.leftDelta,
        x2: chart.leftDelta,
        y1: chart.topDelta,
        y2: chart.topDelta + chart.yAxisHeight,
      });
    }
    // center y axis label
    var yLegend = chart.element.getElementsByClassName("js-chart__axis-legend--y");
    if (yLegend.length > 0 && isVisible(yLegend[0])) {
      var position = yLegend[0].getBBox(),
        height = position.height,
        yPosition = position.y + 0.5 * (chart.yAxisHeight + position.width),
        xPosition = position.x + height / 4;

      setAttributes(yLegend[0], {
        y: yPosition,
        x: xPosition,
        transform: "rotate(-90 " + (position.x + height) + " " + (yPosition + height / 2) + ")",
      });
    }
  }

  function placexAxisLabels(chart) {
    var labels = chart.element
      .getElementsByClassName("js-chart__axis-labels--x")[0]
      .querySelectorAll(".js-chart__axis-label");
    var ticks = chart.element.getElementsByClassName("js-chart__tick-x");

    // increase rightDelta value
    var labelWidth = 0,
      labelsVisible = isVisible(labels[labels.length - 1]);
    if (labelsVisible) labelWidth = labels[labels.length - 1].getBBox().width;
    if (chart.options.type != "column") {
      chart.rightDelta = chart.rightDelta + labelWidth * 0.5 + chart.svgPadding;
    } else {
      chart.rightDelta = chart.rightDelta + 4;
    }
    chart.xAxisWidth = chart.width - chart.leftDelta - chart.rightDelta;

    var maxHeight = getLabelMaxSize(labels, "height"),
      maxWidth = getLabelMaxSize(labels, "width"),
      xDelta = chart.xAxisWidth / (labels.length - 1);

    if (chart.options.type == "column") xDelta = chart.xAxisWidth / labels.length;

    var totWidth = 0,
      height = 0;
    if (labelsVisible) height = labels[0].getBBox().height;

    for (var i = 0; i < labels.length; i++) {
      var width = 0;
      if (labelsVisible) width = labels[i].getBBox().width;
      // label
      setAttributes(labels[i], {
        y: chart.height - chart.bottomDelta - height / 2,
        x: chart.leftDelta + xDelta * i - width / 2,
      });
      // tick
      setAttributes(ticks[i], {
        y1: chart.height - chart.bottomDelta - maxHeight - chart.svgPadding,
        y2: chart.height - chart.bottomDelta - maxHeight - chart.svgPadding + 5,
        x1: chart.leftDelta + xDelta * i,
        x2: chart.leftDelta + xDelta * i,
      });
      totWidth = totWidth + width + 4;
    }
    // for columns chart -> there's an additional tick element
    if (chart.options.type == "column" && ticks[labels.length]) {
      setAttributes(ticks[labels.length], {
        y1: chart.height - chart.bottomDelta - maxHeight - chart.svgPadding,
        y2: chart.height - chart.bottomDelta - maxHeight - chart.svgPadding + 5,
        x1: chart.leftDelta + xDelta * labels.length,
        x2: chart.leftDelta + xDelta * labels.length,
      });
    }
    //check if we need to rotate chart label -> not enough space
    if (totWidth >= chart.xAxisWidth) {
      chart.xAxisLabelRotation = true;
      rotatexAxisLabels(chart, labels, ticks, maxWidth - maxHeight);
      maxHeight = maxWidth;
    } else {
      chart.xAxisLabelRotation = false;
    }

    chart.bottomDelta = chart.bottomDelta + chart.svgPadding + maxHeight;

    // place the x axis
    var xAxis = chart.element.getElementsByClassName("js-chart__axis--x");
    if (xAxis.length > 0) {
      setAttributes(xAxis[0], {
        x1: chart.leftDelta,
        x2: chart.width - chart.rightDelta,
        y1: chart.height - chart.bottomDelta,
        y2: chart.height - chart.bottomDelta,
      });
    }

    // center x-axis label
    var xLegend = chart.element.getElementsByClassName("js-chart__axis-legend--x");
    if (xLegend.length > 0 && isVisible(xLegend[0])) {
      xLegend[0].setAttribute(
        "x",
        chart.leftDelta + 0.5 * (chart.xAxisWidth - xLegend[0].getBBox().width)
      );
    }
  }

  function rotatexAxisLabels(chart, labels, ticks, delta) {
    // there's not enough horiziontal space -> we need to rotate the x axis labels
    for (var i = 0; i < labels.length; i++) {
      var dimensions = labels[i].getBBox(),
        xCenter = parseFloat(labels[i].getAttribute("x")) + dimensions.width / 2,
        yCenter = parseFloat(labels[i].getAttribute("y")) - delta;

      setAttributes(labels[i], {
        y: parseFloat(labels[i].getAttribute("y")) - delta,
        transform: "rotate(-45 " + xCenter + " " + yCenter + ")",
      });

      ticks[i].setAttribute("transform", "translate(0 -" + delta + ")");
    }
    if (ticks[labels.length])
      ticks[labels.length].setAttribute("transform", "translate(0 -" + delta + ")");
  }

  function setChartDatasets(chart) {
    var gEl = document.createElementNS("http://www.w3.org/2000/svg", "g");
    gEl.setAttribute("class", "chart__dataset js-chart__dataset");
    chart.datasetScaled = [];
    for (var i = 0; i < chart.options.datasets.length; i++) {
      var gSet = document.createElementNS("http://www.w3.org/2000/svg", "g");
      gSet.setAttribute("class", "chart__set chart__set--" + (i + 1) + " js-chart__set");
      chart.datasetScaled[i] = JSON.parse(JSON.stringify(chart.options.datasets[i].data));
      chart.datasetScaled[i] = getChartData(chart, chart.datasetScaled[i]);
      chart.datasetScaledFlat[i] = JSON.parse(JSON.stringify(chart.datasetScaled[i]));
      if (chart.options.type == "area") {
        chart.datasetAreaScaled[i] = getAreaPointsFromLine(chart, chart.datasetScaled[i]);
        chart.datasetAreaScaledFlat[i] = JSON.parse(JSON.stringify(chart.datasetAreaScaled[i]));
      }
      if (!chart.loaded && chart.options.animate) {
        flatDatasets(chart, i);
      }
      gSet.appendChild(
        getPath(chart, chart.datasetScaledFlat[i], chart.datasetAreaScaledFlat[i], i)
      );
      gSet.appendChild(getMarkers(chart, chart.datasetScaled[i], i));
      gEl.appendChild(gSet);
    }

    chart.svg.appendChild(gEl);
  }

  function getChartData(chart, data) {
    var multiSet = data[0].length > 1;
    var points = multiSet ? data : addXData(chart, data); // addXData is used for one-dimension dataset; e.g. [2, 4, 6] rather than [[2, 4], [4, 7]]

    // xOffsetChart used for column chart type onlymodified
    var xOffsetChart = chart.xAxisWidth / (points.length - 1) - chart.xAxisWidth / points.length;
    // now modify the points to coordinate relative to the svg
    for (var i = 0; i < points.length; i++) {
      var xNewCoordinate =
          chart.leftDelta +
          (chart.xAxisWidth * (points[i][0] - chart.xAxisInterval[0])) /
            (chart.xAxisInterval[1] - chart.xAxisInterval[0]),
        yNewCoordinate =
          chart.height -
          chart.bottomDelta -
          (chart.yAxisHeight * (points[i][1] - chart.yAxisInterval[0])) /
            (chart.yAxisInterval[1] - chart.yAxisInterval[0]);
      if (chart.options.type == "column") {
        xNewCoordinate = xNewCoordinate - i * xOffsetChart;
      }
      points[i] = [xNewCoordinate, yNewCoordinate];
    }
    return points;
  }

  function getPath(chart, points, areaPoints, index) {
    var pathCode = chart.options.smooth ? getSmoothLine(points, false) : getStraightLine(points);

    var gEl = document.createElementNS("http://www.w3.org/2000/svg", "g"),
      pathL = document.createElementNS("http://www.w3.org/2000/svg", "path");

    setAttributes(pathL, {
      d: pathCode,
      class:
        "chart__data-line chart__data-line--" +
        (index + 1) +
        " js-chart__data-line--" +
        (index + 1),
    });

    if (chart.options.type == "area") {
      var areaCode = chart.options.smooth
        ? getSmoothLine(areaPoints, true)
        : getStraightLine(areaPoints);
      var pathA = document.createElementNS("http://www.w3.org/2000/svg", "path");
      setAttributes(pathA, {
        d: areaCode,
        class:
          "chart__data-fill chart__data-fill--" +
          (index + 1) +
          " js-chart__data-fill--" +
          (index + 1),
      });
      gEl.appendChild(pathA);
    }

    gEl.appendChild(pathL);
    return gEl;
  }

  function getStraightLine(points) {
    var dCode = "";
    for (var i = 0; i < points.length; i++) {
      dCode =
        i == 0
          ? "M " + points[0][0] + "," + points[0][1]
          : dCode + " L " + points[i][0] + "," + points[i][1];
    }
    return dCode;
  }

  function flatDatasets(chart, index) {
    var bottomY = getBottomFlatDatasets(chart);
    for (var i = 0; i < chart.datasetScaledFlat[index].length; i++) {
      chart.datasetScaledFlat[index][i] = [chart.datasetScaled[index][i][0], bottomY];
    }
    if (chart.options.type == "area") {
      chart.datasetAreaScaledFlat[index] = getAreaPointsFromLine(
        chart,
        chart.datasetScaledFlat[index]
      );
    }
  }

  // https://medium.com/@francoisromain/smooth-a-svg-path-with-cubic-bezier-curves-e37b49d46c74
  function getSmoothLine(points, bool) {
    var dCode = "";
    var maxVal = points.length;
    var pointsLoop = JSON.parse(JSON.stringify(points));
    if (bool) {
      maxVal = maxVal - 3;
      pointsLoop.splice(-3, 3);
    }
    for (var i = 0; i < maxVal; i++) {
      if (i == 0) dCode = "M " + points[0][0] + "," + points[0][1];
      else dCode = dCode + " " + bezierCommand(points[i], i, pointsLoop);
    }
    if (bool) {
      for (var j = maxVal; j < points.length; j++) {
        dCode = dCode + " L " + points[j][0] + "," + points[j][1];
      }
    }
    return dCode;
  }

  function pathLine(pointA, pointB) {
    var lengthX = pointB[0] - pointA[0];
    var lengthY = pointB[1] - pointA[1];

    return {
      length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
      angle: Math.atan2(lengthY, lengthX),
    };
  }

  function pathControlPoint(current, previous, next, reverse) {
    var p = previous || current;
    var n = next || current;
    var smoothing = 0.2;
    var o = pathLine(p, n);

    var angle = o.angle + (reverse ? Math.PI : 0);
    var length = o.length * smoothing;

    var x = current[0] + Math.cos(angle) * length;
    var y = current[1] + Math.sin(angle) * length;
    return [x, y];
  }

  function bezierCommand(point, i, a) {
    var cps = pathControlPoint(a[i - 1], a[i - 2], point);
    var cpe = pathControlPoint(point, a[i - 1], a[i + 1], true);
    return (
      "C " + cps[0] + "," + cps[1] + " " + cpe[0] + "," + cpe[1] + " " + point[0] + "," + point[1]
    );
  }

  function getAreaPointsFromLine(chart, array) {
    var points = JSON.parse(JSON.stringify(array)),
      firstPoint = points[0],
      lastPoint = points[points.length - 1];

    var boottomY = getBottomFlatDatasets(chart);
    points.push([lastPoint[0], boottomY]);
    points.push([chart.leftDelta, boottomY]);
    points.push([chart.leftDelta, firstPoint[1]]);
    return points;
  }

  function getBottomFlatDatasets(chart) {
    var bottom = chart.height - chart.bottomDelta;
    if (chart.options.fillOrigin) {
      bottom =
        chart.height -
        chart.bottomDelta -
        (chart.yAxisHeight * (0 - chart.yAxisInterval[0])) /
          (chart.yAxisInterval[1] - chart.yAxisInterval[0]);
    }
    if (chart.options.type && chart.options.type == "column") {
      bottom = chart.yZero;
    }
    return bottom;
  }

  function getMarkers(chart, points, index) {
    // see if we need to show tooltips
    var gEl = document.createElementNS("http://www.w3.org/2000/svg", "g");
    var xOffset = 0;
    if (chart.options.type == "column") {
      xOffset = (0.5 * chart.xAxisWidth) / points.length;
    }
    for (var i = 0; i < points.length; i++) {
      var marker = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      setAttributes(marker, {
        class: "chart__marker js-chart__marker chart__marker--" + (index + 1),
        cx: points[i][0] + xOffset,
        cy: points[i][1],
        r: 2,
        "data-set": index,
        "data-index": i,
      });
      gEl.appendChild(marker);
    }
    return gEl;
  }

  function addXData(chart, data) {
    var multiData = [];
    for (var i = 0; i < data.length; i++) {
      if (chart.options.xAxis && chart.options.xAxis.range && chart.options.xAxis.step) {
        var xValue = chart.options.xAxis.range[0] + i;
        if (xValue > chart.options.xAxis.range[1]) xValue = chart.options.xAxis.range[1];
        multiData.push([xValue, data[i]]);
      } else {
        multiData.push([i, data[i]]);
      }
    }
    return multiData;
  }

  function createSrTables(chart) {
    // create a table element for accessibility reasons
    var table = '<div class="chart__sr-table sr-only">';
    for (var i = 0; i < chart.options.datasets.length; i++) {
      table = table + createDataTable(chart, i);
    }
    table = table + "</div>";
    chart.element.insertAdjacentHTML("afterend", table);
  }

  function createDataTable(chart, index) {
    var tableTitle =
      chart.categories.length > index
        ? 'aria-label="' + chart.categories.length[index].textContent + '"'
        : "";
    var table = "<table " + tableTitle + "><thead><tr>";
    table =
      chart.options.xAxis && chart.options.xAxis.legend
        ? table + '<th scope="col">' + chart.options.xAxis.legend + "</th>"
        : table + '<th scope="col"></th>';

    table =
      chart.options.yAxis && chart.options.yAxis.legend
        ? table + '<th scope="col">' + chart.options.yAxis.legend + "</th>"
        : table + '<th scope="col"></th>';

    table = table + "</thead><tbody>";
    var multiset = chart.options.datasets[index].data[0].length > 1,
      xAxisLabels =
        chart.options.xAxis && chart.options.xAxis.labels && chart.options.xAxis.labels.length > 1;
    for (var i = 0; i < chart.options.datasets[index].data.length; i++) {
      table = table + "<tr>";
      if (multiset) {
        table =
          table +
          '<td role="cell">' +
          chart.options.datasets[index].data[i][0] +
          '</td><td role="cell">' +
          chart.options.datasets[index].data[i][1] +
          "</td>";
      } else {
        var xValue = xAxisLabels ? chart.options.xAxis.labels[i] : i + 1;
        table =
          table +
          '<td role="cell">' +
          xValue +
          '</td><td role="cell">' +
          chart.options.datasets[index].data[i] +
          "</td>";
      }
      table = table + "</tr>";
    }
    table = table + "</tbody></table>";
    return table;
  }

  function getChartYLabels(chart) {
    var labels = [],
      intervals = 0;
    if (chart.options.yAxis && chart.options.yAxis.range && chart.options.yAxis.step) {
      intervals = Math.ceil(
        (chart.options.yAxis.range[1] - chart.options.yAxis.range[0]) / chart.options.yAxis.step
      );
      for (var i = 0; i <= intervals; i++) {
        labels.push(chart.options.yAxis.range[0] + chart.options.yAxis.step * i);
      }
      chart.yAxisInterval = [chart.options.yAxis.range[0], chart.options.yAxis.range[1]];
    } else {
      var columnChartStacked =
        chart.options.type && chart.options.type == "column" && chart.options.stacked;
      if (columnChartStacked) setDatasetsSum(chart);
      var min = columnChartStacked
        ? getColStackedMinDataValue(chart)
        : getMinDataValue(chart, true);
      var max = columnChartStacked
        ? getColStackedMaxDataValue(chart)
        : getMaxDataValue(chart, true);
      var niceScale = new NiceScale(min, max, 5);
      var intervals = Math.ceil(
        (niceScale.getNiceUpperBound() - niceScale.getNiceLowerBound()) / niceScale.getTickSpacing()
      );

      for (var i = 0; i <= intervals; i++) {
        labels.push(niceScale.getNiceLowerBound() + niceScale.getTickSpacing() * i);
      }
      chart.yAxisInterval = [niceScale.getNiceLowerBound(), niceScale.getNiceUpperBound()];
    }
    return labels;
  }

  function getChartXLabels(chart) {
    var labels = [],
      intervals = 0;
    if (chart.options.xAxis && chart.options.xAxis.range && chart.options.xAxis.step) {
      intervals = Math.ceil(
        (chart.options.xAxis.range[1] - chart.options.xAxis.range[0]) / chart.options.xAxis.step
      );
      for (var i = 0; i <= intervals; i++) {
        var xRange = chart.options.xAxis.range[0] + chart.options.xAxis.step * i;
        if (xRange > chart.options.xAxis.range[1]) xRange = chart.options.xAxis.range[1];
        labels.push(xRange);
      }
      chart.xAxisInterval = [chart.options.xAxis.range[0], chart.options.xAxis.range[1]];
    } else if (
      !chart.options.datasets[0].data[0].length ||
      chart.options.datasets[0].data[0].length < 2
    ) {
      // data sets are passed with a single value (y axis only)
      chart.xAxisInterval = [0, chart.options.datasets[0].data.length - 1];
      for (var i = 0; i < chart.options.datasets[0].data.length; i++) {
        labels.push(i);
      }
    } else {
      var min = getMinDataValue(chart, false);
      var max = getMaxDataValue(chart, false);
      var niceScale = new NiceScale(min, max, 5);
      var intervals = Math.ceil(
        (niceScale.getNiceUpperBound() - niceScale.getNiceLowerBound()) / niceScale.getTickSpacing()
      );

      for (var i = 0; i <= intervals; i++) {
        labels.push(niceScale.getNiceLowerBound() + niceScale.getTickSpacing() * i);
      }
      chart.xAxisInterval = [niceScale.getNiceLowerBound(), niceScale.getNiceUpperBound()];
    }
    return labels;
  }

  function modifyAxisLabel(labels, fnModifier) {
    for (var i = 0; i < labels.length; i++) {
      labels[i] = fnModifier(labels[i]);
    }

    return labels;
  }

  function getLabelMaxSize(labels, dimesion) {
    if (!isVisible(labels[0])) return 0;
    var size = 0;
    for (var i = 0; i < labels.length; i++) {
      var labelSize = labels[i].getBBox()[dimesion];
      if (labelSize > size) size = labelSize;
    }
    return size;
  }

  function getMinDataValue(chart, bool) {
    // bool = true for y axis
    var minArray = [];
    for (var i = 0; i < chart.options.datasets.length; i++) {
      minArray.push(getMin(chart.options.datasets[i].data, bool));
    }
    return Math.min.apply(null, minArray);
  }

  function getMaxDataValue(chart, bool) {
    // bool = true for y axis
    var maxArray = [];
    for (var i = 0; i < chart.options.datasets.length; i++) {
      maxArray.push(getMax(chart.options.datasets[i].data, bool));
    }
    return Math.max.apply(null, maxArray);
  }

  function setDatasetsSum(chart) {
    // sum all datasets -> this is used for column and bar charts
    chart.datasetsSum = [];
    for (var i = 0; i < chart.options.datasets.length; i++) {
      for (var j = 0; j < chart.options.datasets[i].data.length; j++) {
        chart.datasetsSum[j] =
          i == 0
            ? chart.options.datasets[i].data[j]
            : chart.datasetsSum[j] + chart.options.datasets[i].data[j];
      }
    }
  }

  function getColStackedMinDataValue(chart) {
    var min = Math.min.apply(null, chart.datasetsSum);
    if (min > 0) min = 0;
    return min;
  }

  function getColStackedMaxDataValue(chart) {
    var max = Math.max.apply(null, chart.datasetsSum);
    if (max < 0) max = 0;
    return max;
  }

  function getMin(array, bool) {
    var min;
    var multiSet = array[0].length > 1;
    for (var i = 0; i < array.length; i++) {
      var value;
      if (multiSet) {
        value = bool ? array[i][1] : array[i][0];
      } else {
        value = array[i];
      }
      if (i == 0) {
        min = value;
      } else if (value < min) {
        min = value;
      }
    }
    return min;
  }

  function getMax(array, bool) {
    var max;
    var multiSet = array[0].length > 1;
    for (var i = 0; i < array.length; i++) {
      var value;
      if (multiSet) {
        value = bool ? array[i][1] : array[i][0];
      } else {
        value = array[i];
      }
      if (i == 0) {
        max = value;
      } else if (value > max) {
        max = value;
      }
    }
    return max;
  }

  // https://gist.github.com/igodorogea/4f42a95ea31414c3a755a8b202676dfd
  function NiceScale(lowerBound, upperBound, _maxTicks) {
    var maxTicks = _maxTicks || 10;
    var tickSpacing;
    var range;
    var niceLowerBound;
    var niceUpperBound;

    calculate();

    this.setMaxTicks = function (_maxTicks) {
      maxTicks = _maxTicks;
      calculate();
    };

    this.getNiceUpperBound = function () {
      return niceUpperBound;
    };

    this.getNiceLowerBound = function () {
      return niceLowerBound;
    };

    this.getTickSpacing = function () {
      return tickSpacing;
    };

    function setMinMaxPoints(min, max) {
      lowerBound = min;
      upperBound = max;
      calculate();
    }

    function calculate() {
      range = niceNum(upperBound - lowerBound, false);
      tickSpacing = niceNum(range / (maxTicks - 1), true);
      niceLowerBound = Math.floor(lowerBound / tickSpacing) * tickSpacing;
      niceUpperBound = Math.ceil(upperBound / tickSpacing) * tickSpacing;
    }

    function niceNum(range, round) {
      // var exponent = Math.floor(Math.log10(range));
      var exponent = Math.floor(Math.log(range) * Math.LOG10E);
      var fraction = range / Math.pow(10, exponent);
      var niceFraction;

      if (round) {
        if (fraction < 1.5) niceFraction = 1;
        else if (fraction < 3) niceFraction = 2;
        else if (fraction < 7) niceFraction = 5;
        else niceFraction = 10;
      } else {
        if (fraction <= 1) niceFraction = 1;
        else if (fraction <= 2) niceFraction = 2;
        else if (fraction <= 5) niceFraction = 5;
        else niceFraction = 10;
      }

      return niceFraction * Math.pow(10, exponent);
    }
  }

  function initTooltips(chart) {
    if (!intObservSupported) return;

    chart.markers = [];
    chart.bars = []; // this is for column/bar charts only
    var chartSets = chart.element.getElementsByClassName("js-chart__set");
    for (var i = 0; i < chartSets.length; i++) {
      chart.markers[i] = chartSets[i].querySelectorAll(".js-chart__marker");
      if (chart.options.type && chart.options.type == "column") {
        chart.bars[i] = chartSets[i].querySelectorAll(".js-chart__data-bar");
      }
    }

    // create tooltip line
    if (chart.options.yIndicator) {
      var tooltipLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
      setAttributes(tooltipLine, {
        x1: 0,
        y1: chart.topDelta,
        x2: 0,
        y2: chart.topDelta + chart.yAxisHeight,
        transform: "translate(" + chart.leftDelta + " " + chart.topDelta + ")",
        class: "chart__y-indicator js-chart__y-indicator hide",
      });
      chart.svg.insertBefore(
        tooltipLine,
        chart.element.getElementsByClassName("js-chart__dataset")[0]
      );
      chart.interLine = chart.element.getElementsByClassName("js-chart__y-indicator")[0];
    }

    // create tooltip
    if (chart.tooltipOn) {
      var tooltip = document.createElement("div");
      tooltip.setAttribute(
        "class",
        "chart__tooltip js-chart__tooltip hide " + chart.tooltipClasses
      );
      chart.element.appendChild(tooltip);
      chart.tooltip = chart.element.getElementsByClassName("js-chart__tooltip")[0];
    }
    initChartHover(chart);
  }

  function initChartHover(chart) {
    if (!chart.options.yIndicator && !chart.tooltipOn) return;
    // init hover effect
    chart.chartArea = chart.element.getElementsByClassName("js-chart__axis-labels--y")[0];
    chart.eventIds["hover"] = handleEvent.bind(chart);
    chart.chartArea.addEventListener("mouseenter", chart.eventIds["hover"]);
    chart.chartArea.addEventListener("mousemove", chart.eventIds["hover"]);
    chart.chartArea.addEventListener("mouseleave", chart.eventIds["hover"]);
    if (!SwipeContent) return;
    new SwipeContent(chart.element);
    chart.element.addEventListener("dragStart", chart.eventIds["hover"]);
    chart.element.addEventListener("dragging", chart.eventIds["hover"]);
    chart.element.addEventListener("dragEnd", chart.eventIds["hover"]);
  }

  function hoverChart(chart, event) {
    if (chart.hovering) return;
    if (!chart.options.yIndicator && !chart.tooltipOn) return;
    chart.hovering = true;
    var selectedMarker = getSelectedMarker(chart, event);
    if (selectedMarker === false) return;
    if (selectedMarker !== chart.selectedMarker) {
      resetMarkers(chart, false);
      resetBars(chart, false);

      chart.selectedMarker = selectedMarker;
      resetMarkers(chart, true);
      resetBars(chart, true);
      var markerSize = chart.markers[0][chart.selectedMarker].getBBox();

      if (chart.options.yIndicator) {
        chart.interLine.classList.remove("hide");
        chart.interLine.setAttribute(
          "transform",
          "translate(" + (markerSize.x + markerSize.width / 2) + " 0)"
        );
      }

      if (chart.tooltipOn) {
        chart.tooltip.classList.remove("hide");
        setTooltipHTML(chart);
        placeTooltip(chart);
      }
    }
    updateExternalData(chart);
    chart.hovering = false;
  }

  function getSelectedMarker(chart, event) {
    if (chart.markers[0].length < 1) return false;
    var clientX = event.detail.x ? event.detail.x : event.clientX;
    var xposition = clientX - chart.svg.getBoundingClientRect().left;
    var marker = 0,
      deltaX = Math.abs(chart.markers[0][0].getBBox().x - xposition);
    for (var i = 1; i < chart.markers[0].length; i++) {
      var newDeltaX = Math.abs(chart.markers[0][i].getBBox().x - xposition);
      if (newDeltaX < deltaX) {
        deltaX = newDeltaX;
        marker = i;
      }
    }
    return marker;
  }

  function resetTooltip(chart) {
    if (chart.hoverId) {
      window.requestAnimationFrame
        ? window.cancelAnimationFrame(chart.hoverId)
        : clearTimeout(chart.hoverId);
      chart.hoverId = false;
    }
    if (chart.tooltipOn) chart.tooltip.classList.add("hide");
    if (chart.options.yIndicator) chart.interLine.classList.add("hide");
    resetMarkers(chart, false);
    resetBars(chart, false);
    chart.selectedMarker = false;
    resetExternalData(chart);
    chart.hovering = false;
  }

  function resetMarkers(chart, bool) {
    for (var i = 0; i < chart.markers.length; i++) {
      if (chart.markers[i] && chart.markers[i][chart.selectedMarker])
        chart.markers[i][chart.selectedMarker].classList.toggle(chart.selectedMarkerClass, bool);
    }
  }

  function resetBars(chart, bool) {
    // for column/bar chart -> change opacity on hover
    if (!chart.options.type || chart.options.type != "column") return;
    for (var i = 0; i < chart.bars.length; i++) {
      if (chart.bars[i] && chart.bars[i][chart.selectedMarker])
        chart.bars[i][chart.selectedMarker].classList.toggle(chart.selectedBarClass, bool);
    }
  }

  function setTooltipHTML(chart) {
    var selectedMarker = chart.markers[0][chart.selectedMarker];
    chart.tooltip.innerHTML = getTooltipHTML(
      chart,
      selectedMarker.getAttribute("data-index"),
      selectedMarker.getAttribute("data-set")
    );
  }

  function getTooltipHTML(chart, index, setIndex) {
    var htmlContent = "";
    if (chart.options.tooltip.customHTML) {
      htmlContent = chart.options.tooltip.customHTML(index, chart.options, setIndex);
    } else {
      var multiVal = chart.options.datasets[setIndex].data[index].length > 1;
      if (
        chart.options.xAxis &&
        chart.options.xAxis.labels &&
        chart.options.xAxis.labels.length > 1
      ) {
        htmlContent = chart.options.xAxis.labels[index] + " - ";
      } else if (multiVal) {
        htmlContent = chart.options.datasets[setIndex].data[index][0] + " - ";
      }
      htmlContent = multiVal
        ? htmlContent + chart.options.datasets[setIndex].data[index][1]
        : htmlContent + chart.options.datasets[setIndex].data[index];
    }
    return htmlContent;
  }

  function placeTooltip(chart) {
    var selectedMarker = chart.markers[0][chart.selectedMarker];
    var markerPosition = selectedMarker.getBoundingClientRect();
    var markerPositionSVG = selectedMarker.getBBox();
    var svgPosition = chart.svg.getBoundingClientRect();

    if (chart.options.type == "column") {
      tooltipPositionColumnChart(chart, selectedMarker, markerPosition, markerPositionSVG);
    } else {
      tooltipPositionChart(
        chart,
        markerPosition,
        markerPositionSVG,
        svgPosition.left,
        svgPosition.width
      );
    }
  }

  function tooltipPositionChart(
    chart,
    markerPosition,
    markerPositionSVG,
    svgPositionLeft,
    svgPositionWidth
  ) {
    // set top/left/transform of the tooltip for line/area charts
    // horizontal position
    if (markerPosition.left - svgPositionLeft <= svgPositionWidth / 2) {
      chart.tooltip.style.left = markerPositionSVG.x + markerPositionSVG.width + 2 + "px";
      chart.tooltip.style.right = "auto";
      chart.tooltip.style.transform = "translateY(-100%)";
    } else {
      chart.tooltip.style.left = "auto";
      chart.tooltip.style.right = svgPositionWidth - markerPositionSVG.x + 2 + "px";
      chart.tooltip.style.transform = "translateY(-100%)";
    }
    // vertical position
    if (!chart.tooltipPosition) {
      chart.tooltip.style.top = markerPositionSVG.y + "px";
    } else if (chart.tooltipPosition == "top") {
      chart.tooltip.style.top =
        chart.topDelta + chart.tooltip.getBoundingClientRect().height + 5 + "px";
      chart.tooltip.style.bottom = "auto";
    } else {
      chart.tooltip.style.top = "auto";
      chart.tooltip.style.bottom = chart.bottomDelta + 5 + "px";
      chart.tooltip.style.transform = "";
    }
  }

  function tooltipPositionColumnChart(chart, marker, markerPosition, markerPositionSVG) {
    // set top/left/transform of the tooltip for column charts
    chart.tooltip.style.left = markerPositionSVG.x + markerPosition.width / 2 + "px";
    chart.tooltip.style.right = "auto";
    chart.tooltip.style.transform = "translateX(-50%) translateY(-100%)";
    if (!chart.tooltipPosition) {
      if (parseInt(marker.getAttribute("cy")) > chart.yZero) {
        // negative value -> move tooltip below the bar
        chart.tooltip.style.top = markerPositionSVG.y + markerPositionSVG.height + 6 + "px";
        chart.tooltip.style.transform = "translateX(-50%)";
      } else {
        chart.tooltip.style.top = markerPositionSVG.y - 6 + "px";
      }
    } else if (chart.tooltipPosition == "top") {
      chart.tooltip.style.top =
        chart.topDelta + chart.tooltip.getBoundingClientRect().height + 5 + "px";
      chart.tooltip.style.bottom = "auto";
    } else {
      chart.tooltip.style.bottom = chart.bottomDelta + 5 + "px";
      chart.tooltip.style.top = "auto";
      chart.tooltip.style.transform = "translateX(-50%)";
    }
  }

  function animateChart(chart) {
    if (!chart.options.animate) return;
    var observer = new IntersectionObserver(chartObserve.bind(chart), {
      rootMargin: "0px 0px -200px 0px",
    });
    observer.observe(chart.element);
  }

  function chartObserve(entries, observer) {
    // observe chart position -> start animation when inside viewport
    if (entries[0].isIntersecting) {
      triggerChartAnimation(this);
      observer.unobserve(this.element);
    }
  }

  function triggerChartAnimation(chart) {
    if (chart.options.type == "line" || chart.options.type == "area") {
      animatePath(chart, "line");
      if (chart.options.type == "area") animatePath(chart, "fill");
    } else if (chart.options.type == "column") {
      animateRectPath(chart, "column");
    }
  }

  function animatePath(chart, type) {
    var currentTime = null,
      duration = 600;

    var startArray = chart.datasetScaledFlat,
      finalArray = chart.datasetScaled;

    if (type == "fill") {
      startArray = chart.datasetAreaScaledFlat;
      finalArray = chart.datasetAreaScaled;
    }

    var animateSinglePath = function (timestamp) {
      if (!currentTime) currentTime = timestamp;
      var progress = timestamp - currentTime;
      if (progress > duration) progress = duration;
      for (var i = 0; i < finalArray.length; i++) {
        var points = [];
        var path = chart.element.getElementsByClassName(
          "js-chart__data-" + type + "--" + (i + 1)
        )[0];
        for (var j = 0; j < finalArray[i].length; j++) {
          var val = Math.easeOutQuart(
            progress,
            startArray[i][j][1],
            finalArray[i][j][1] - startArray[i][j][1],
            duration
          );
          points[j] = [finalArray[i][j][0], val];
        }
        // get path and animate
        var pathCode = chart.options.smooth
          ? getSmoothLine(points, type == "fill")
          : getStraightLine(points);
        path.setAttribute("d", pathCode);
      }
      if (progress < duration) {
        window.requestAnimationFrame(animateSinglePath);
      }
    };

    window.requestAnimationFrame(animateSinglePath);
  }

  function resizeChart(chart) {
    window.addEventListener("resize", function () {
      clearTimeout(chart.eventIds["resize"]);
      chart.eventIds["resize"] = setTimeout(doneResizing, 300);
    });

    function doneResizing() {
      resetChartResize(chart);
      initChart(chart);
    }
  }

  function resetChartResize(chart) {
    chart.topDelta = 0;
    chart.bottomDelta = 0;
    chart.leftDelta = 0;
    chart.rightDelta = 0;
    chart.dragging = false;
    // reset event listeners
    if (chart.eventIds && chart.eventIds["hover"]) {
      chart.chartArea.removeEventListener("mouseenter", chart.eventIds["hover"]);
      chart.chartArea.removeEventListener("mousemove", chart.eventIds["hover"]);
      chart.chartArea.removeEventListener("mouseleave", chart.eventIds["hover"]);
      chart.element.removeEventListener("dragStart", chart.eventIds["hover"]);
      chart.element.removeEventListener("dragging", chart.eventIds["hover"]);
      chart.element.removeEventListener("dragEnd", chart.eventIds["hover"]);
    }
  }

  function handleEvent(event) {
    switch (event.type) {
      case "mouseenter":
        hoverChart(this, event);
        break;
      case "mousemove":
      case "dragging":
        var self = this;
        self.hoverId = window.requestAnimationFrame
          ? window.requestAnimationFrame(function () {
              hoverChart(self, event);
            })
          : setTimeout(function () {
              hoverChart(self, event);
            });
        break;
      case "mouseleave":
      case "dragEnd":
        resetTooltip(this);
        break;
    }
  }

  function isVisible(item) {
    return item && item.getClientRects().length > 0;
  }

  function initExternalData(chart) {
    if (!chart.options.externalData) return;
    var chartId = chart.options.element.getAttribute("id");
    if (!chartId) return;
    chart.extDataX = [];
    chart.extDataXInit = [];
    chart.extDataY = [];
    chart.extDataYInit = [];
    if (chart.options.datasets.length > 1) {
      for (var i = 0; i < chart.options.datasets.length; i++) {
        chart.extDataX[i] = document.querySelectorAll(
          ".js-ext-chart-data-x--" + (i + 1) + '[data-chart="' + chartId + '"]'
        );
        chart.extDataY[i] = document.querySelectorAll(
          ".js-ext-chart-data-y--" + (i + 1) + '[data-chart="' + chartId + '"]'
        );
      }
    } else {
      chart.extDataX[0] = document.querySelectorAll(
        '.js-ext-chart-data-x[data-chart="' + chartId + '"]'
      );
      chart.extDataY[0] = document.querySelectorAll(
        '.js-ext-chart-data-y[data-chart="' + chartId + '"]'
      );
    }
    // store initial HTML contentent
    storeExternalDataContent(chart, chart.extDataX, chart.extDataXInit);
    storeExternalDataContent(chart, chart.extDataY, chart.extDataYInit);
  }

  function storeExternalDataContent(chart, elements, array) {
    for (var i = 0; i < elements.length; i++) {
      array[i] = [];
      if (elements[i][0]) array[i][0] = elements[i][0].innerHTML;
    }
  }

  function updateExternalData(chart) {
    if (!chart.extDataX || !chart.extDataY) return;
    var marker = chart.markers[0][chart.selectedMarker];
    if (!marker) return;
    var dataIndex = marker.getAttribute("data-index");
    var multiVal = chart.options.datasets[0].data[0].length > 1;
    for (var i = 0; i < chart.options.datasets.length; i++) {
      updateExternalDataX(chart, dataIndex, i, multiVal);
      updateExternalDataY(chart, dataIndex, i, multiVal);
    }
  }

  function updateExternalDataX(chart, dataIndex, setIndex, multiVal) {
    if (!chart.extDataX[setIndex] || !chart.extDataX[setIndex][0]) return;
    var value = "";
    if (chart.options.externalData.customXHTML) {
      value = chart.options.externalData.customXHTML(dataIndex, chart.options, setIndex);
    } else {
      if (
        chart.options.xAxis &&
        chart.options.xAxis.labels &&
        chart.options.xAxis.labels.length > 1
      ) {
        value = chart.options.xAxis.labels[dataIndex];
      } else if (multiVal) {
        htmlContent = chart.options.datasets[setIndex].data[dataIndex][0];
      }
    }
    chart.extDataX[setIndex][0].innerHTML = value;
  }

  function updateExternalDataY(chart, dataIndex, setIndex, multiVal) {
    if (!chart.extDataY[setIndex] || !chart.extDataY[setIndex][0]) return;
    var value = "";
    if (chart.options.externalData.customYHTML) {
      value = chart.options.externalData.customYHTML(dataIndex, chart.options, setIndex);
    } else {
      if (multiVal) {
        value = chart.options.datasets[setIndex].data[dataIndex][1];
      } else {
        value = chart.options.datasets[setIndex].data[dataIndex];
      }
    }
    chart.extDataY[setIndex][0].innerHTML = value;
  }

  function resetExternalData(chart) {
    if (!chart.options.externalData) return;
    for (var i = 0; i < chart.options.datasets.length; i++) {
      if (chart.extDataX[i][0]) chart.extDataX[i][0].innerHTML = chart.extDataXInit[i][0];
      if (chart.extDataY[i][0]) chart.extDataY[i][0].innerHTML = chart.extDataYInit[i][0];
    }
  }

  function setChartColumnSize(chart) {
    chart.columnWidthPerc = 100;
    chart.columnGap = 0;
    if (chart.options.column && chart.options.column.width) {
      chart.columnWidthPerc = parseInt(chart.options.column.width);
    }
    if (chart.options.column && chart.options.column.gap) {
      chart.columnGap = parseInt(chart.options.column.gap);
    }
  }

  function resetColumnChart(chart) {
    var labels = chart.element
        .getElementsByClassName("js-chart__axis-labels--x")[0]
        .querySelectorAll(".js-chart__axis-label"),
      labelsVisible = isVisible(labels[labels.length - 1]),
      xDelta = chart.xAxisWidth / labels.length;

    // translate x axis labels
    if (labelsVisible) {
      moveXAxisLabels(chart, labels, 0.5 * xDelta);
    }
    // set column width + separation gap between columns
    var columnsSpace = (xDelta * chart.columnWidthPerc) / 100;
    if (chart.options.stacked) {
      chart.columnWidth = columnsSpace;
    } else {
      chart.columnWidth =
        (columnsSpace - chart.columnGap * (chart.options.datasets.length - 1)) /
        chart.options.datasets.length;
    }

    chart.columnDelta = (xDelta - columnsSpace) / 2;
  }

  function moveXAxisLabels(chart, labels, delta) {
    // this applies to column charts only
    // translate the xlabels to center them
    if (chart.xAxisLabelRotation) return; // labels were rotated - no need to translate
    for (var i = 0; i < labels.length; i++) {
      setAttributes(labels[i], { x: labels[i].getBBox().x + delta });
    }
  }

  function setColumnChartDatasets(chart) {
    var gEl = document.createElementNS("http://www.w3.org/2000/svg", "g");
    gEl.setAttribute("class", "chart__dataset js-chart__dataset");
    chart.datasetScaled = [];

    setColumnChartYZero(chart);

    for (var i = 0; i < chart.options.datasets.length; i++) {
      var gSet = document.createElementNS("http://www.w3.org/2000/svg", "g");
      gSet.setAttribute("class", "chart__set chart__set--" + (i + 1) + " js-chart__set");
      chart.datasetScaled[i] = JSON.parse(JSON.stringify(chart.options.datasets[i].data));
      chart.datasetScaled[i] = getChartData(chart, chart.datasetScaled[i]);
      chart.datasetScaledFlat[i] = JSON.parse(JSON.stringify(chart.datasetScaled[i]));
      if (!chart.loaded && chart.options.animate) {
        flatDatasets(chart, i);
      }
      gSet.appendChild(getSvgColumns(chart, chart.datasetScaledFlat[i], i));
      gEl.appendChild(gSet);
      gSet.appendChild(getMarkers(chart, chart.datasetScaled[i], i));
    }

    chart.svg.appendChild(gEl);
  }

  function setColumnChartYZero(chart) {
    // if there are negative values -> make sre columns start from zero
    chart.yZero = chart.height - chart.bottomDelta;
    if (chart.yAxisInterval[0] < 0) {
      chart.yZero =
        chart.height -
        chart.bottomDelta +
        (chart.yAxisHeight * chart.yAxisInterval[0]) /
          (chart.yAxisInterval[1] - chart.yAxisInterval[0]);
    }
  }

  function getSvgColumns(chart, dataset, index) {
    var gEl = document.createElementNS("http://www.w3.org/2000/svg", "g");

    for (var i = 0; i < dataset.length; i++) {
      var pathL = document.createElementNS("http://www.w3.org/2000/svg", "path");
      var points = getColumnPoints(chart, dataset[i], index, i, chart.datasetScaledFlat);
      var lineType = chart.options.column && chart.options.column.radius ? "round" : "square";
      if (lineType == "round" && chart.options.stacked && index < chart.options.datasets.length - 1)
        lineType = "square";
      var dPath =
        lineType == "round" ? getRoundedColumnRect(chart, points) : getStraightLine(points);
      setAttributes(pathL, {
        d: dPath,
        class:
          "chart__data-bar chart__data-bar--" +
          (index + 1) +
          " js-chart__data-bar js-chart__data-bar--" +
          (index + 1),
      });
      gEl.appendChild(pathL);
    }
    return gEl;
  }

  function getColumnPoints(chart, point, index, pointIndex, dataSetsAll) {
    var xOffset = chart.columnDelta + index * (chart.columnWidth + chart.columnGap),
      yOffset = 0;

    if (chart.options.stacked) {
      xOffset = chart.columnDelta;
      yOffset = getyOffsetColChart(chart, dataSetsAll, index, pointIndex);
    }

    return [
      [point[0] + xOffset, chart.yZero - yOffset],
      [point[0] + xOffset, point[1] - yOffset],
      [point[0] + xOffset + chart.columnWidth, point[1] - yOffset],
      [point[0] + xOffset + chart.columnWidth, chart.yZero - yOffset],
    ];
  }

  function getyOffsetColChart(chart, dataSetsAll, index, pointIndex) {
    var offset = 0;
    for (var i = 0; i < index; i++) {
      if (dataSetsAll[i] && dataSetsAll[i][pointIndex])
        offset = offset + (chart.height - chart.bottomDelta - dataSetsAll[i][pointIndex][1]);
    }
    return offset;
  }

  function getRoundedColumnRect(chart, points) {
    var radius = parseInt(chart.options.column.radius);
    var arcType = "0,0,1",
      deltaArc1 = "-",
      deltaArc2 = ",",
      rectHeight = points[1][1] + radius;
    if (chart.yAxisInterval[0] < 0 && points[1][1] > chart.yZero) {
      arcType = "0,0,0";
      deltaArc1 = ",";
      deltaArc2 = "-";
      rectHeight = points[1][1] - radius;
    }
    var dpath = "M " + points[0][0] + " " + points[0][1];
    dpath = dpath + " V " + rectHeight;
    dpath =
      dpath + " a " + radius + "," + radius + "," + arcType + "," + radius + deltaArc1 + radius;
    dpath = dpath + " H " + (points[2][0] - radius);
    dpath =
      dpath + " a " + radius + "," + radius + "," + arcType + "," + radius + deltaArc2 + radius;
    dpath = dpath + " V " + points[3][1];
    return dpath;
  }

  function animateRectPath(chart, type) {
    var currentTime = null,
      duration = 600;

    var startArray = chart.datasetScaledFlat,
      finalArray = chart.datasetScaled;

    var animateSingleRectPath = function (timestamp) {
      if (!currentTime) currentTime = timestamp;
      var progress = timestamp - currentTime;
      if (progress > duration) progress = duration;
      var multiSetPoint = [];
      for (var i = 0; i < finalArray.length; i++) {
        // multi sets
        var points = [];
        var paths = chart.element.getElementsByClassName("js-chart__data-bar--" + (i + 1));
        var rectLine = chart.options.column && chart.options.column.radius ? "round" : "square";
        if (chart.options.stacked && rectLine == "round" && i < finalArray.length - 1)
          rectLine = "square";
        for (var j = 0; j < finalArray[i].length; j++) {
          var val = Math.easeOutQuart(
            progress,
            startArray[i][j][1],
            finalArray[i][j][1] - startArray[i][j][1],
            duration
          );
          points[j] = [finalArray[i][j][0], val];
          // get path and animate
          var rectPoints = getColumnPoints(chart, points[j], i, j, multiSetPoint);
          var dPath =
            rectLine == "round"
              ? getRoundedColumnRect(chart, rectPoints)
              : getStraightLine(rectPoints);
          paths[j].setAttribute("d", dPath);
        }

        multiSetPoint[i] = points;
      }
      if (progress < duration) {
        window.requestAnimationFrame(animateSingleRectPath);
      }
    };

    window.requestAnimationFrame(animateSingleRectPath);
  }

  function setAttributes(el, attrs) {
    for (var key in attrs) {
      el.setAttribute(key, attrs[key]);
    }
  }

  function getPieSvgCode(chart) {}

  function getDoughnutSvgCode(chart) {}

  var extendProps = function () {
    // Variables
    var extended = {};
    var deep = false;
    var i = 0;
    var length = arguments.length;
    // Check if a deep merge
    if (Object.prototype.toString.call(arguments[0]) === "[object Boolean]") {
      deep = arguments[0];
      i++;
    }
    // Merge the object into the extended object
    var merge = function (obj) {
      for (var prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
          // If deep merge and property is an object, merge properties
          if (deep && Object.prototype.toString.call(obj[prop]) === "[object Object]") {
            extended[prop] = extend(true, extended[prop], obj[prop]);
          } else {
            extended[prop] = obj[prop];
          }
        }
      }
    };
    // Loop through each object and conduct a merge
    for (; i < length; i++) {
      var obj = arguments[i];
      merge(obj);
    }
    return extended;
  };

  Chart.defaults = {
    element: "",
    type: "line", // can be line, area, bar
    xAxis: {},
    yAxis: {},
    datasets: [],
    tooltip: {
      enabled: false,
      classes: false,
      customHTM: false,
    },
    yIndicator: true,
    padding: 10,
  };

  window.Chart = Chart;

  var intObservSupported =
    "IntersectionObserver" in window &&
    "IntersectionObserverEntry" in window &&
    "intersectionRatio" in window.IntersectionObserverEntry.prototype;
})();

// File#: _3_column-chart
// Usage: codyhouse.co/license
(function () {
  // --default chart demo
  var columnChart1 = document.getElementById("column-chart-1");
  if (columnChart1) {
    new Chart({
      element: columnChart1,
      type: "column",
      xAxis: {
        line: true,
        labels: ["B1G", "SEC", "Big 12", "ACC"],
        legend: "Annual Revenue Per Team",
        ticks: true,
      },
      yAxis: {
        legend: "Total ($ Millions)",
        labels: true,
      },
      datasets: [
        {
          data: [62.5, 50, 31.67, 17.14],
        },
      ],
      column: {
        width: "60%",
        gap: "2px",
        radius: "4px",
      },
      tooltip: {
        enabled: true,
        customHTML: function (index, chartOptions, datasetIndex) {
          return '<span class="color-contrast-medium">' + chartOptions.xAxis.labels[index] + ":</span> $" + chartOptions.datasets[datasetIndex].data[index] + " M";
        },
      },
      animate: true,
    });
  }

  var columnChart1 = document.getElementById("column-chart-1-2");
  if (columnChart1) {
    new Chart({
      element: columnChart1,
      type: "column",
      xAxis: {
        line: true,
        labels: ["A", "B", "C", "D", "E", "F"],
        legend: "Annual Revenue Per Team",
        ticks: true,
      },
      yAxis: {
        legend: "Total ($ Millions)",
        labels: true,
      },
      datasets: [
        {
          data: [75, 50, 25, 15, 8, 4],
        },
      ],
      column: {
        width: "60%",
        gap: "2px",
        radius: "4px",
      },
      tooltip: {
        enabled: true,
        customHTML: function (index, chartOptions, datasetIndex) {
          return '<span class="color-contrast-medium">' + chartOptions.xAxis.labels[index] + ":</span> $" + chartOptions.datasets[datasetIndex].data[index] + " M";
        },
      },
      animate: true,
    });
  }

  var columnChart1 = document.getElementById("column-chart-opt-out");
  if (columnChart1) {
    new Chart({
      element: columnChart1,
      type: "column",
      xAxis: {
        line: true,
        labels: ["2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023"],
        legend: "Year",
        ticks: true,
      },
      yAxis: {
        legend: "Total",
        labels: true,
      },
      datasets: [
        {
          data: [5, 12, 20, 30, 50, 60, 70, 80],
        },
      ],
      column: {
        width: "60%",
        gap: "2px",
        radius: "4px",
      },
      tooltip: {
        enabled: true,
        customHTML: function (index, chartOptions, datasetIndex) {
          return '<span class="color-contrast-medium">' + chartOptions.xAxis.labels[index] + ":</span> " + chartOptions.datasets[datasetIndex].data[index] + "";
        },
      },
      animate: true,
    });
  }

  // --multiset chart demo
  var columnChart2 = document.getElementById("column-chart-2");
  if (columnChart2) {
    new Chart({
      element: columnChart2,
      type: "column",
      xAxis: {
        line: true,
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        legend: "Months",
        ticks: true,
      },
      yAxis: {
        legend: "Total",
        labels: true,
      },
      datasets: [
        {
          data: [1, 2, 3, 12, 8, 7, 10, 4, 9, 5, 16, 3],
        },
        {
          data: [4, 8, 10, 12, 15, 11, 7, 3, 5, 2, 12, 6],
        },
      ],
      column: {
        width: "60%",
        gap: "2px",
        radius: "4px",
      },
      tooltip: {
        enabled: true,
        customHTML: function (index, chartOptions, datasetIndex) {
          var html = '<p class="margin-bottom-2xs">Total ' + chartOptions.xAxis.labels[index] + "</p>";
          html = html + '<p class="flex items-center"><span class="height-3xs width-3xs radius-50% bg-primary margin-right-2xs"></span>$' + chartOptions.datasets[0].data[index] + "</p>";
          html = html + '<p class="flex items-center"><span class="height-3xs width-3xs radius-50% bg-contrast-higher margin-right-2xs"></span>$' + chartOptions.datasets[1].data[index] + "</p>";
          return html;
        },
        position: "top",
      },
      animate: true,
    });
  }

  // --stacked chart demo
  var columnChart3 = document.getElementById("column-chart-3");
  if (columnChart3) {
    new Chart({
      element: columnChart3,
      type: "column",
      stacked: true,
      xAxis: {
        line: true,
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        legend: "Months",
        ticks: true,
      },
      yAxis: {
        legend: "Total",
        labels: true,
      },
      datasets: [
        {
          data: [1, 2, 3, 12, 8, 7, 10, 4, 9, 5, 16, 3],
        },
        {
          data: [4, 8, 10, 12, 15, 11, 7, 3, 5, 2, 12, 6],
        },
      ],
      column: {
        width: "60%",
        gap: "2px",
        radius: "4px",
      },
      tooltip: {
        enabled: true,
        customHTML: function (index, chartOptions, datasetIndex) {
          var html = '<p class="margin-bottom-2xs">Total ' + chartOptions.xAxis.labels[index] + "</p>";
          html = html + '<p class="flex items-center"><span class="height-3xs width-3xs radius-50% bg-primary margin-right-2xs"></span>$' + chartOptions.datasets[0].data[index] + "</p>";
          html = html + '<p class="flex items-center"><span class="height-3xs width-3xs radius-50% bg-contrast-higher margin-right-2xs"></span>$' + chartOptions.datasets[1].data[index] + "</p>";
          return html;
        },
        position: "top",
      },
      animate: true,
    });
  }

  // --negative-values chart demo
  var columnChart4 = document.getElementById("column-chart-4");
  if (columnChart4) {
    new Chart({
      element: columnChart4,
      type: "column",
      xAxis: {
        line: true,
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        legend: "Months",
        ticks: true,
      },
      yAxis: {
        legend: "Total",
        labels: true,
      },
      datasets: [
        {
          data: [1, 4, 8, 5, 3, -2, -5, -7, 4, 9, 5, 10, 3],
        },
      ],
      column: {
        width: "60%",
        gap: "2px",
        radius: "4px",
      },
      tooltip: {
        enabled: true,
        customHTML: function (index, chartOptions, datasetIndex) {
          return '<span class="color-contrast-medium">' + chartOptions.xAxis.labels[index] + ":</span> " + chartOptions.datasets[datasetIndex].data[index] + "$";
        },
      },
      animate: true,
    });
  }
})();

// File#: _1_stacking-cards
// Usage: codyhouse.co/license
(function () {
  var StackCards = function (element) {
    this.element = element;
    this.items = this.element.getElementsByClassName("js-stack-cards__item");
    this.scrollingFn = false;
    this.scrolling = false;
    initStackCardsEffect(this);
    initStackCardsResize(this);
  };

  function initStackCardsEffect(element) {
    // use Intersection Observer to trigger animation
    setStackCards(element); // store cards CSS properties
    var observer = new IntersectionObserver(stackCardsCallback.bind(element), {
      threshold: [0, 1],
    });
    observer.observe(element.element);
  }

  function initStackCardsResize(element) {
    // detect resize to reset gallery
    element.element.addEventListener("resize-stack-cards", function () {
      setStackCards(element);
      animateStackCards.bind(element);
    });
  }

  function stackCardsCallback(entries) {
    // Intersection Observer callback
    if (entries[0].isIntersecting) {
      if (this.scrollingFn) return; // listener for scroll event already added
      stackCardsInitEvent(this);
    } else {
      if (!this.scrollingFn) return; // listener for scroll event already removed
      window.removeEventListener("scroll", this.scrollingFn);
      this.scrollingFn = false;
    }
  }

  function stackCardsInitEvent(element) {
    element.scrollingFn = stackCardsScrolling.bind(element);
    window.addEventListener("scroll", element.scrollingFn);
  }

  function stackCardsScrolling() {
    if (this.scrolling) return;
    this.scrolling = true;
    window.requestAnimationFrame(animateStackCards.bind(this));
  }

  function setStackCards(element) {
    // store wrapper properties
    element.marginY = getComputedStyle(element.element).getPropertyValue("--stack-cards-gap");
    getIntegerFromProperty(element); // convert element.marginY to integer (px value)
    element.elementHeight = element.element.offsetHeight;

    // store card properties
    var cardStyle = getComputedStyle(element.items[0]);
    element.cardTop = Math.floor(parseFloat(cardStyle.getPropertyValue("top")));
    element.cardHeight = Math.floor(parseFloat(cardStyle.getPropertyValue("height")));

    // store window property
    element.windowHeight = window.innerHeight;

    // reset margin + translate values
    if (isNaN(element.marginY)) {
      element.element.style.paddingBottom = "0px";
    } else {
      element.element.style.paddingBottom = element.marginY * (element.items.length - 1) + "px";
    }

    for (var i = 0; i < element.items.length; i++) {
      if (isNaN(element.marginY)) {
        element.items[i].style.transform = "none;";
      } else {
        element.items[i].style.transform = "translateY(" + element.marginY * i + "px)";
      }
    }
  }

  function getIntegerFromProperty(element) {
    var node = document.createElement("div");
    node.setAttribute(
      "style",
      "opacity:0; visbility: hidden;position: absolute; height:" + element.marginY
    );
    element.element.appendChild(node);
    element.marginY = parseInt(getComputedStyle(node).getPropertyValue("height"));
    element.element.removeChild(node);
  }

  function animateStackCards() {
    if (isNaN(this.marginY)) {
      // --stack-cards-gap not defined - do not trigger the effect
      this.scrolling = false;
      return;
    }

    var top = this.element.getBoundingClientRect().top;

    if (
      this.cardTop -
        top +
        this.element.windowHeight -
        this.elementHeight -
        this.cardHeight +
        this.marginY +
        this.marginY * this.items.length >
      0
    ) {
      this.scrolling = false;
      return;
    }

    for (var i = 0; i < this.items.length; i++) {
      // use only scale
      var scrolling = this.cardTop - top - i * (this.cardHeight + this.marginY);
      if (scrolling > 0) {
        var scaling =
          i == this.items.length - 1 ? 1 : (this.cardHeight - scrolling * 0.05) / this.cardHeight;
        this.items[i].style.transform =
          "translateY(" + this.marginY * i + "px) scale(" + scaling + ")";
      } else {
        this.items[i].style.transform = "translateY(" + this.marginY * i + "px)";
      }
    }

    this.scrolling = false;
  }

  // initialize StackCards object
  var stackCards = document.getElementsByClassName("js-stack-cards"),
    intersectionObserverSupported =
      "IntersectionObserver" in window &&
      "IntersectionObserverEntry" in window &&
      "intersectionRatio" in window.IntersectionObserverEntry.prototype,
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (stackCards.length > 0 && intersectionObserverSupported && !reducedMotion) {
    var stackCardsArray = [];
    for (var i = 0; i < stackCards.length; i++) {
      (function (i) {
        stackCardsArray.push(new StackCards(stackCards[i]));
      })(i);
    }

    var resizingId = false,
      customEvent = new CustomEvent("resize-stack-cards");

    window.addEventListener("resize", function () {
      clearTimeout(resizingId);
      resizingId = setTimeout(doneResizing, 500);
    });

    function doneResizing() {
      for (var i = 0; i < stackCardsArray.length; i++) {
        (function (i) {
          stackCardsArray[i].element.dispatchEvent(customEvent);
        })(i);
      }
    }
  }
})();

// File#: _1_ticker
// Usage: codyhouse.co/license
(function () {
  var Ticker = function (element) {
    this.element = element;
    this.list = this.element.getElementsByTagName("ul")[0];
    this.items = this.list.children;
    this.paused = false;
    // clones info
    this.clones = this.list.innerHTML;
    this.clonesNumber = 1;
    this.itemsLength = this.items.length;
    // animation duration
    this.animationDuration = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue("--ticker-animation-duration")
    );
    initTicker(this);
  };

  function initTicker(ticker) {
    // clone ticker children
    setTickerWidth(ticker);
    cloneItems(ticker);
    initAnimation(ticker);

    // resize/font loaded event
    ticker.element.addEventListener("update-ticker", function (event) {
      setTickerWidth(ticker);
      cloneItems(ticker);
    });

    // click on control button events
    ticker.element.addEventListener("anim-ticker", function (event) {
      ticker.paused = false;
      ticker.element.classList.remove("ticker--paused");
    });

    ticker.element.addEventListener("pause-ticker", function (event) {
      ticker.paused = true;
      ticker.element.classList.add("ticker--paused");
    });

    // all set
    ticker.element.classList.add("ticker--loaded");
  }

  function setTickerWidth(ticker) {
    var width = 0;
    for (var i = 0; i < ticker.itemsLength; i++) {
      width = width + getItemWidth(ticker.items[i]);
    }
    // check if we need to update the number of clones
    if (width < window.innerWidth) {
      ticker.clonesNumber = Math.ceil(window.innerWidth / width) * 2 - 1;
    } else {
      ticker.clonesNumber = 1;
    }

    // update list width
    ticker.list.style.width = (ticker.clonesNumber + 1) * width + "px";
  }

  function getItemWidth(item) {
    var style = window.getComputedStyle(item);
    return parseFloat(style.marginRight) + parseFloat(style.marginLeft) + item.offsetWidth;
  }

  function cloneItems(ticker) {
    ticker.list.innerHTML = ticker.clones;
    for (var i = 0; i < ticker.clonesNumber; i++) {
      ticker.list.insertAdjacentHTML("beforeend", ticker.clones);
    }
    // update animation duration
    ticker.element.style.setProperty(
      "--ticker-animation-duration",
      ticker.animationDuration * (ticker.clonesNumber + 1) + "s"
    );
  }

  function initAnimation(ticker) {
    // init observer - animate ticker only when in viewport
    var observer = new IntersectionObserver(tickerObserve.bind(ticker));
    observer.observe(ticker.element);
  }

  function tickerObserve(entries) {
    if (entries[0].isIntersecting) {
      if (!this.paused) this.element.classList.add("ticker--animate");
    } else {
      this.element.classList.remove("ticker--animate");
    }
  }

  function initTickerController(controller) {
    // play/pause btn controller
    var tickerContainer = document.getElementById(controller.getAttribute("aria-controls"));
    if (!tickerContainer) return;
    var tickerList = tickerContainer.getElementsByClassName("js-ticker");
    if (tickerList.length < 1) tickerList = [tickerContainer];
    // detect click
    controller.addEventListener("click", function (event) {
      var playAnimation = controller.getAttribute("aria-pressed") == "true";
      var animEvent = playAnimation ? "anim-ticker" : "pause-ticker";
      playAnimation
        ? controller.setAttribute("aria-pressed", "false")
        : controller.setAttribute("aria-pressed", "true");
      for (var i = 0; i < tickerList.length; i++) {
        tickerList[i].dispatchEvent(new CustomEvent(animEvent));
      }
    });
  }

  //initialize the Ticker objects
  var tickers = document.getElementsByClassName("js-ticker"),
    requestAnimationFrameSupported = window.requestAnimationFrame,
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    intersectionObserverSupported =
      "IntersectionObserver" in window &&
      "IntersectionObserverEntry" in window &&
      "intersectionRatio" in window.IntersectionObserverEntry.prototype;

  if (tickers.length > 0) {
    var tickersArray = [];
    for (var i = 0; i < tickers.length; i++) {
      if (!requestAnimationFrameSupported || reducedMotion || !intersectionObserverSupported) {
        // animation is off if requestAnimationFrame/IntersectionObserver is not supported or reduced motion is on
        tickers[i].classList.add("ticker--anim-off");
      } else {
        (function (i) {
          tickersArray.push(new Ticker(tickers[i]));
        })(i);
      }
    }

    if (tickersArray.length > 0) {
      var resizingId = false,
        customEvent = new CustomEvent("update-ticker");

      // on resize -> update ticker width
      window.addEventListener("resize", function () {
        clearTimeout(resizingId);
        resizingId = setTimeout(doneResizing, 500);
      });

      // wait for font to be loaded -> update ticker width
      if (document.fonts) {
        document.fonts.onloadingdone = function (fontFaceSetEvent) {
          doneResizing();
        };
      }

      function doneResizing() {
        for (var i = 0; i < tickersArray.length; i++) {
          (function (i) {
            tickersArray[i].element.dispatchEvent(customEvent);
          })(i);
        }
      }

      // ticker play/pause buttons
      var tickerControl = document.getElementsByClassName("js-ticker-control");
      if (tickerControl.length > 0) {
        for (var i = 0; i < tickerControl.length; i++) {
          if (!requestAnimationFrameSupported || reducedMotion || !intersectionObserverSupported) {
            tickerControl[i].classList.add("hide");
          } else {
            (function (i) {
              initTickerController(tickerControl[i]);
            })(i);
          }
        }
      }
    }
  }
})();

if (!Util) function Util() {}

Util.scrollTo = function (final, duration, cb, scrollEl) {
  var element = scrollEl || window;
  var start = element.scrollTop || document.documentElement.scrollTop,
    currentTime = null;

  if (!scrollEl) start = window.scrollY || document.documentElement.scrollTop;

  var animateScroll = function (timestamp) {
    if (!currentTime) currentTime = timestamp;
    var progress = timestamp - currentTime;
    if (progress > duration) progress = duration;
    var val = Math.easeInOutQuad(progress, start, final - start, duration);
    element.scrollTo(0, val);
    if (progress < duration) {
      window.requestAnimationFrame(animateScroll);
    } else {
      cb && cb();
    }
  };

  window.requestAnimationFrame(animateScroll);
};

Util.moveFocus = function (element) {
  if (!element) element = document.getElementsByTagName("body")[0];
  element.focus();
  if (document.activeElement !== element) {
    element.setAttribute("tabindex", "-1");
    element.focus();
  }
};

Util.cssSupports = function (property, value) {
  return CSS.supports(property, value);
};

Math.easeInOutQuad = function (t, b, c, d) {
  t /= d / 2;
  if (t < 1) return (c / 2) * t * t + b;
  t--;
  return (-c / 2) * (t * (t - 2) - 1) + b;
};

// File#: _1_smooth-scrolling
// Usage: codyhouse.co/license
(function () {
  var SmoothScroll = function (element) {
    if (!("CSS" in window) || !CSS.supports("color", "var(--color-var)")) return;
    this.element = element;
    this.scrollDuration = parseInt(this.element.getAttribute("data-duration")) || 300;
    this.dataElementY =
      this.element.getAttribute("data-scrollable-element-y") ||
      this.element.getAttribute("data-scrollable-element") ||
      this.element.getAttribute("data-element");
    this.scrollElementY = this.dataElementY ? document.querySelector(this.dataElementY) : window;
    this.dataElementX = this.element.getAttribute("data-scrollable-element-x");
    this.scrollElementX = this.dataElementY ? document.querySelector(this.dataElementX) : window;
    this.initScroll();
  };

  SmoothScroll.prototype.initScroll = function () {
    var self = this;

    //detect click on link
    this.element.addEventListener("click", function (event) {
      event.preventDefault();
      var targetId = event.target
          .closest(".js-smooth-scroll")
          .getAttribute("href")
          .replace("#", ""),
        target = document.getElementById(targetId),
        targetTabIndex = target.getAttribute("tabindex"),
        windowScrollTop = self.scrollElementY.scrollTop || document.documentElement.scrollTop;

      // scroll vertically
      if (!self.dataElementY)
        windowScrollTop = window.scrollY || document.documentElement.scrollTop;

      var scrollElementY = self.dataElementY ? self.scrollElementY : false;

      var fixedHeight = self.getFixedElementHeight(); // check if there's a fixed element on the page
      Util.scrollTo(
        target.getBoundingClientRect().top + windowScrollTop - fixedHeight,
        self.scrollDuration,
        function () {
          // scroll horizontally
          self.scrollHorizontally(target, fixedHeight);
          //move the focus to the target element - don't break keyboard navigation
          Util.moveFocus(target);
          history.pushState(false, false, "#" + targetId);
          self.resetTarget(target, targetTabIndex);
        },
        scrollElementY
      );
    });
  };

  SmoothScroll.prototype.scrollHorizontally = function (target, delta) {
    var scrollEl = this.dataElementX ? this.scrollElementX : false;
    var windowScrollLeft = this.scrollElementX
      ? this.scrollElementX.scrollLeft
      : document.documentElement.scrollLeft;
    var final = target.getBoundingClientRect().left + windowScrollLeft - delta,
      duration = this.scrollDuration;

    var element = scrollEl || window;
    var start = element.scrollLeft || document.documentElement.scrollLeft,
      currentTime = null;

    if (!scrollEl) start = window.scrollX || document.documentElement.scrollLeft;
    // return if there's no need to scroll
    if (Math.abs(start - final) < 5) return;

    var animateScroll = function (timestamp) {
      if (!currentTime) currentTime = timestamp;
      var progress = timestamp - currentTime;
      if (progress > duration) progress = duration;
      var val = Math.easeInOutQuad(progress, start, final - start, duration);
      element.scrollTo({
        left: val,
      });
      if (progress < duration) {
        window.requestAnimationFrame(animateScroll);
      }
    };

    window.requestAnimationFrame(animateScroll);
  };

  SmoothScroll.prototype.resetTarget = function (target, tabindex) {
    if (parseInt(target.getAttribute("tabindex")) < 0) {
      target.style.outline = "none";
      !tabindex && target.removeAttribute("tabindex");
    }
  };

  SmoothScroll.prototype.getFixedElementHeight = function () {
    var scrollElementY = this.dataElementY ? this.scrollElementY : document.documentElement;
    var fixedElementDelta = parseInt(
      getComputedStyle(scrollElementY).getPropertyValue("scroll-padding")
    );
    if (isNaN(fixedElementDelta)) {
      // scroll-padding not supported
      fixedElementDelta = 0;
      var fixedElement = document.querySelector(this.element.getAttribute("data-fixed-element"));
      if (fixedElement) fixedElementDelta = parseInt(fixedElement.getBoundingClientRect().height);
    }
    return fixedElementDelta;
  };

  //initialize the Smooth Scroll objects
  var smoothScrollLinks = document.getElementsByClassName("js-smooth-scroll");
  if (
    smoothScrollLinks.length > 0 &&
    !Util.cssSupports("scroll-behavior", "smooth") &&
    window.requestAnimationFrame
  ) {
    // you need javascript only if css scroll-behavior is not supported
    for (var i = 0; i < smoothScrollLinks.length; i++) {
      (function (i) {
        new SmoothScroll(smoothScrollLinks[i]);
      })(i);
    }
  }
})();

if (!Util) function Util() {}

Util.hasClass = function (el, className) {
  return el.classList.contains(className);
};

Util.addClass = function (el, className) {
  var classList = className.split(" ");
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(" "));
};

Util.removeClass = function (el, className) {
  var classList = className.split(" ");
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(" "));
};

Util.toggleClass = function (el, className, bool) {
  if (bool) Util.addClass(el, className);
  else Util.removeClass(el, className);
};

// File#: _2_table-of-contents
// Usage: codyhouse.co/license
(function () {
  var Toc = function (element) {
    this.element = element;
    this.list = this.element.getElementsByClassName("js-toc__list")[0];
    this.anchors = this.list.querySelectorAll('a[href^="#"]');
    this.sections = getSections(this);
    this.controller = this.element.getElementsByClassName("js-toc__control");
    this.controllerLabel = this.element.getElementsByClassName("js-toc__control-label");
    this.content = getTocContent(this);
    this.clickScrolling = false;
    this.intervalID = false;
    this.staticLayoutClass = "toc--static";
    this.contentStaticLayoutClass = "toc-content--toc-static";
    this.expandedClass = "toc--expanded";
    this.isStatic = Util.hasClass(this.element, this.staticLayoutClass);
    this.layout = "static";
    initToc(this);
  };

  function getSections(toc) {
    var sections = [];
    // get all content sections
    for (var i = 0; i < toc.anchors.length; i++) {
      var section = document.getElementById(toc.anchors[i].getAttribute("href").replace("#", ""));
      if (section) sections.push(section);
    }
    return sections;
  }

  function getTocContent(toc) {
    if (toc.sections.length < 1) return false;
    var content = toc.sections[0].closest(".js-toc-content");
    return content;
  }

  function initToc(toc) {
    checkTocLayour(toc); // switch between mobile and desktop layout
    if (toc.sections.length > 0) {
      // listen for click on anchors
      toc.list.addEventListener("click", function (event) {
        var anchor = event.target.closest('a[href^="#"]');
        if (!anchor) return;
        // reset link apperance
        toc.clickScrolling = true;
        resetAnchors(toc, anchor);
        // close toc if expanded on mobile
        toggleToc(toc, true);
      });

      // check when a new section enters the viewport
      var intersectionObserverSupported = "IntersectionObserver" in window && "IntersectionObserverEntry" in window && "intersectionRatio" in window.IntersectionObserverEntry.prototype;
      if (intersectionObserverSupported) {
        var observer = new IntersectionObserver(
          function (entries, observer) {
            entries.forEach(function (entry) {
              if (!toc.clickScrolling) {
                // do not update classes if user clicked on a link
                getVisibleSection(toc);
              }
            });
          },
          {
            threshold: [0, 0.1],
            rootMargin: "0px 0px -70% 0px",
          }
        );

        for (var i = 0; i < toc.sections.length; i++) {
          observer.observe(toc.sections[i]);
        }
      }

      // detect the end of scrolling -> reactivate IntersectionObserver on scroll
      toc.element.addEventListener("toc-scroll", function (event) {
        toc.clickScrolling = false;
      });
    }

    // custom event emitted when window is resized
    toc.element.addEventListener("toc-resize", function (event) {
      checkTocLayour(toc);
    });

    // collapsed version only (mobile)
    initCollapsedVersion(toc);
  }

  function resetAnchors(toc, anchor) {
    if (!anchor) return;
    for (var i = 0; i < toc.anchors.length; i++) Util.removeClass(toc.anchors[i], "toc__link--selected");
    Util.addClass(anchor, "toc__link--selected");
  }

  function getVisibleSection(toc) {
    if (toc.intervalID) {
      clearInterval(toc.intervalID);
    }
    toc.intervalID = setTimeout(function () {
      var halfWindowHeight = window.innerHeight / 2,
        index = -1;
      for (var i = 0; i < toc.sections.length; i++) {
        var top = toc.sections[i].getBoundingClientRect().top;
        if (top < halfWindowHeight) index = i;
      }
      if (index > -1) {
        resetAnchors(toc, toc.anchors[index]);
      }
      toc.intervalID = false;
    }, 100);
  }

  function checkTocLayour(toc) {
    if (toc.isStatic) return;
    toc.layout = getComputedStyle(toc.element, ":before").getPropertyValue("content").replace(/\'|"/g, "");
    Util.toggleClass(toc.element, toc.staticLayoutClass, toc.layout == "static");
    if (toc.content) Util.toggleClass(toc.content, toc.contentStaticLayoutClass, toc.layout == "static");
  }

  function initCollapsedVersion(toc) {
    // collapsed version only (mobile)
    if (toc.controller.length < 1) return;

    // toggle nav visibility
    toc.controller[0].addEventListener("click", function (event) {
      var isOpen = Util.hasClass(toc.element, toc.expandedClass);
      toggleToc(toc, isOpen);
    });

    // close expanded version on esc
    toc.element.addEventListener("keydown", function (event) {
      if (toc.layout == "static") return;
      if ((event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == "escape")) {
        toggleToc(toc, true);
        toc.controller[0].focus();
      }
    });
  }

  function toggleToc(toc, bool) {
    // collapsed version only (mobile)
    if (toc.controller.length < 1) return;
    // toggle mobile version
    Util.toggleClass(toc.element, toc.expandedClass, !bool);
    bool ? toc.controller[0].removeAttribute("aria-expanded") : toc.controller[0].setAttribute("aria-expanded", "true");
    if (!bool && toc.anchors.length > 0) {
      toc.anchors[0].focus();
    }
  }

  var tocs = document.getElementsByClassName("js-toc");

  var tocsArray = [];
  if (tocs.length > 0) {
    for (var i = 0; i < tocs.length; i++) {
      (function (i) {
        tocsArray.push(new Toc(tocs[i]));
      })(i);
    }

    // listen to window scroll -> reset clickScrolling property
    var scrollId = false,
      resizeId = false,
      scrollEvent = new CustomEvent("toc-scroll"),
      resizeEvent = new CustomEvent("toc-resize");

    window.addEventListener("scroll", function () {
      clearTimeout(scrollId);
      scrollId = setTimeout(doneScrolling, 100);
    });

    window.addEventListener("resize", function () {
      clearTimeout(resizeId);
      scrollId = setTimeout(doneResizing, 100);
    });

    function doneScrolling() {
      for (var i = 0; i < tocsArray.length; i++) {
        (function (i) {
          tocsArray[i].element.dispatchEvent(scrollEvent);
        })(i);
      }
    }

    function doneResizing() {
      for (var i = 0; i < tocsArray.length; i++) {
        (function (i) {
          tocsArray[i].element.dispatchEvent(resizeEvent);
        })(i);
      }
    }
  }
})();

// File#: _1_accordion
// Usage: codyhouse.co/license
(function () {
  var Accordion = function (element) {
    this.element = element;
    this.items = getChildrenByClassName(this.element, "js-accordion__item");
    this.version = this.element.getAttribute("data-version") ? "-" + this.element.getAttribute("data-version") : "";
    this.showClass = "accordion" + this.version + "__item--is-open";
    this.animateHeight = this.element.getAttribute("data-animation") == "on";
    this.multiItems = !(this.element.getAttribute("data-multi-items") == "off");
    // deep linking options
    this.deepLinkOn = this.element.getAttribute("data-deep-link") == "on";
    // init accordion
    this.initAccordion();
  };

  Accordion.prototype.initAccordion = function () {
    //set initial aria attributes
    for (var i = 0; i < this.items.length; i++) {
      var button = this.items[i].getElementsByTagName("button")[0],
        content = this.items[i].getElementsByClassName("js-accordion__panel")[0],
        isOpen = this.items[i].classList.contains(this.showClass) ? "true" : "false";
      button.setAttribute("aria-expanded", isOpen);
      button.setAttribute("aria-controls", "accordion-content-" + i);
      button.setAttribute("id", "accordion-header-" + i);
      button.classList.add("js-accordion__trigger");
      content.setAttribute("aria-labelledby", "accordion-header-" + i);
      content.setAttribute("id", "accordion-content-" + i);
    }

    //listen for Accordion events
    this.initAccordionEvents();

    // check deep linking option
    this.initDeepLink();
  };

  Accordion.prototype.initAccordionEvents = function () {
    var self = this;

    this.element.addEventListener("click", function (event) {
      var trigger = event.target.closest(".js-accordion__trigger");
      //check index to make sure the click didn't happen inside a children accordion
      if (trigger && Array.prototype.indexOf.call(self.items, trigger.parentElement) >= 0) self.triggerAccordion(trigger);
    });
  };

  Accordion.prototype.triggerAccordion = function (trigger) {
    var bool = trigger.getAttribute("aria-expanded") === "true";

    this.animateAccordion(trigger, bool, false);

    if (!bool && this.deepLinkOn) {
      history.replaceState(null, "", "#" + trigger.getAttribute("aria-controls"));
    }
  };

  Accordion.prototype.animateAccordion = function (trigger, bool, deepLink) {
    var self = this;
    var item = trigger.closest(".js-accordion__item"),
      content = item.getElementsByClassName("js-accordion__panel")[0],
      ariaValue = bool ? "false" : "true";

    if (!bool) item.classList.add(this.showClass);
    trigger.setAttribute("aria-expanded", ariaValue);
    self.resetContentVisibility(item, content, bool);

    if ((!this.multiItems && !bool) || deepLink) this.closeSiblings(item);
  };

  Accordion.prototype.resetContentVisibility = function (item, content, bool) {
    item.classList.toggle(this.showClass, !bool);
    content.removeAttribute("style");
    if (bool && !this.multiItems) {
      // accordion item has been closed -> check if there's one open to move inside viewport
      this.moveContent();
    }
  };

  Accordion.prototype.closeSiblings = function (item) {
    //if only one accordion can be open -> search if there's another one open
    var index = Array.prototype.indexOf.call(this.items, item);
    for (var i = 0; i < this.items.length; i++) {
      if (this.items[i].classList.contains(this.showClass) && i != index) {
        this.animateAccordion(this.items[i].getElementsByClassName("js-accordion__trigger")[0], true, false);
        return false;
      }
    }
  };

  Accordion.prototype.moveContent = function () {
    // make sure title of the accordion just opened is inside the viewport
    var openAccordion = this.element.getElementsByClassName(this.showClass);
    if (openAccordion.length == 0) return;
    var boundingRect = openAccordion[0].getBoundingClientRect();
    if (boundingRect.top < 0 || boundingRect.top > window.innerHeight) {
      var windowScrollTop = window.scrollY || document.documentElement.scrollTop;
      window.scrollTo(0, boundingRect.top + windowScrollTop);
    }
  };

  Accordion.prototype.initDeepLink = function () {
    if (!this.deepLinkOn) return;
    var hash = window.location.hash.substr(1);
    if (!hash || hash == "") return;
    var trigger = this.element.querySelector('.js-accordion__trigger[aria-controls="' + hash + '"]');
    if (trigger && trigger.getAttribute("aria-expanded") !== "true") {
      this.animateAccordion(trigger, false, true);
      setTimeout(function () {
        trigger.scrollIntoView(true);
      });
    }
  };

  function getChildrenByClassName(el, className) {
    var children = el.children,
      childrenByClass = [];
    for (var i = 0; i < children.length; i++) {
      if (children[i].classList.contains(className)) childrenByClass.push(children[i]);
    }
    return childrenByClass;
  }

  window.Accordion = Accordion;

  //initialize the Accordion objects
  var accordions = document.getElementsByClassName("js-accordion");
  if (accordions.length > 0) {
    for (var i = 0; i < accordions.length; i++) {
      (function (i) {
        new Accordion(accordions[i]);
      })(i);
    }
  }
})();

// File#: _1_back-to-top
// Usage: codyhouse.co/license
(function () {
  var backTop = document.getElementsByClassName('js-back-to-top')[0];
  if (backTop) {
    var dataElement = backTop.getAttribute('data-element');
    var scrollElement = dataElement ? document.querySelector(dataElement) : window;
    var scrollOffsetInit = parseInt(backTop.getAttribute('data-offset-in')) || parseInt(backTop.getAttribute('data-offset')) || 0,
      scrollOffsetOutInit = parseInt(backTop.getAttribute('data-offset-out')) || 0,
      scrollOffset = 0,
      scrollOffsetOut = 0,
      scrolling = false;

    var targetIn = backTop.getAttribute('data-target-in') ? document.querySelector(backTop.getAttribute('data-target-in')) : false,
      targetOut = backTop.getAttribute('data-target-out') ? document.querySelector(backTop.getAttribute('data-target-out')) : false;

    updateOffsets();

    backTop.addEventListener('click', function (event) {
      event.preventDefault();
      if (!window.requestAnimationFrame) {
        scrollElement.scrollTo(0, 0);
      } else {
        if (dataElement) {
          scrollElement.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        } else {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
      }
      moveFocus(document.getElementById(backTop.getAttribute('href').replace('#', '')));
    });

    checkBackToTop();
    if (scrollOffset > 0 || scrollOffsetOut > 0) {
      scrollElement.addEventListener("scroll", function () {
        if (!scrolling) {
          scrolling = true;
          (!window.requestAnimationFrame) ? setTimeout(checkBackToTop, 250): window.requestAnimationFrame(checkBackToTop);
        }
      });
    }

    function checkBackToTop() {
      updateOffsets();
      var windowTop = scrollElement.scrollTop || document.documentElement.scrollTop;
      if (!dataElement) windowTop = window.scrollY || document.documentElement.scrollTop;

      var condition = windowTop >= scrollOffset;
      if (scrollOffsetOut > 0) {
        condition = (windowTop >= scrollOffset) && (window.innerHeight + windowTop < scrollOffsetOut);
      }
      backTop.classList.toggle('back-to-top--is-visible', condition);

      // Ensure button visibility when at the bottom of the page
      if ((window.innerHeight + windowTop) >= document.documentElement.scrollHeight) {
        backTop.classList.add('back-to-top--is-visible');
      }

      scrolling = false;
    }

    function updateOffsets() {
      scrollOffset = getOffset(targetIn, scrollOffsetInit, true);
      scrollOffsetOut = getOffset(targetOut, scrollOffsetOutInit);
    }

    function getOffset(target, startOffset, bool) {
      var offset = 0;
      if (target) {
        var windowTop = scrollElement.scrollTop || document.documentElement.scrollTop;
        if (!dataElement) windowTop = window.scrollY || document.documentElement.scrollTop;
        var boundingClientRect = target.getBoundingClientRect();
        offset = bool ? boundingClientRect.bottom : boundingClientRect.top;
        offset += windowTop;
      }
      if (startOffset) {
        offset += parseInt(startOffset);
      }
      return offset;
    }

    function moveFocus(element) {
      if (!element) element = document.body;
      element.focus();
      if (document.activeElement !== element) {
        element.setAttribute('tabindex', '-1');
        element.focus();
      }
    }
  }
}());