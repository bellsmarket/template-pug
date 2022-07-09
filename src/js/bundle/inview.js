export function inview() {
  $(".inView").on("inview", function(e, visible) {
    if (visible) {
      $(this)
        .stop()
        .addClass("inViewOn");
    }
  });
}
