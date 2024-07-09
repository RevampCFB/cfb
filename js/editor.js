// core mods
// addon mods
// custom mods

// -------------------- //
// C O N F I G  C O D E //

// -------------------- //
// S T A R T    C O D E //

// @desc    | Codepen editor
document.addEventListener("DOMContentLoaded", function () {
  var codepenEmbed = document.querySelector(".codepen");
  console.log(codepenEmbed);
  if (codepenEmbed) {
    var desiredHeight = window.innerHeight - 75;
    console.log(desiredHeight);
    codepenEmbed.setAttribute("data-height", desiredHeight.toString());
  }
});

// -------------------- //
// E N D   //   C O D E //

// exports
