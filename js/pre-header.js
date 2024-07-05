(function () {
  var preHeader = document.getElementsByClassName("js-pre-header");
  if (preHeader.length > 0) {
    if (isPreHeaderClosed()) {
      for (var i = 0; i < preHeader.length; i++) {
        preHeader[i].classList.add("pre-header--hide");
      }
    } else {
      for (var i = 0; i < preHeader.length; i++) {
        (function (i) {
          addPreHeaderEvent(preHeader[i]);
        })(i);
      }
    }

    function addPreHeaderEvent(element) {
      var close = element.getElementsByClassName("js-pre-header__close-btn")[0];
      if (close) {
        close.addEventListener("click", function (event) {
          event.preventDefault();
          element.classList.add("pre-header--hide");
          setPreHeaderClosed(7); // Hide for 7 days
        });
      }
    }
  }

  function setPreHeaderClosed(days) {
    var expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
    localStorage.setItem(
      "preHeaderClosed",
      JSON.stringify({
        value: true,
        expires: expirationDate.getTime(),
      })
    );
  }

  function isPreHeaderClosed() {
    var item = localStorage.getItem("preHeaderClosed");
    if (!item) {
      return false;
    }

    var data = JSON.parse(item);
    if (data.expires < Date.now()) {
      localStorage.removeItem("preHeaderClosed");
      return false;
    }

    return data.value;
  }
})();
