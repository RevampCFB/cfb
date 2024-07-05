// File#: _1_cookie-notice
(function () {
  function hideNotice(notice) {
    notice.classList.add("notice--hide");
  }

  function initNoticeEvents(notice) {
    notice.addEventListener("click", function (event) {
      if (event.target.closest(".js-notice__hide-control")) {
        event.preventDefault();
        hideNotice(notice);
        localStorage.setItem("cookieNotice", "true");
      }
    });
  }

  // Function to check the localStorage and hide the notice if needed
  function checkCookieNotice() {
    var cookieNotice = localStorage.getItem("cookieNotice");
    if (cookieNotice === "true") {
      var noticeElements = document.getElementsByClassName("js-notice");
      for (var i = 0; i < noticeElements.length; i++) {
        hideNotice(noticeElements[i]);
      }
    }
  }

  // Initialize notice events and check for the cookie notice
  var noticeElements = document.getElementsByClassName("js-notice");
  for (var i = 0; i < noticeElements.length; i++) {
    initNoticeEvents(noticeElements[i]);
  }

  checkCookieNotice();
})();
