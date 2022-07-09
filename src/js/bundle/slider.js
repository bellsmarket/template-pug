export function slider() {
  $('.main-visual__slider').slick({
    dots: false,
    infinite: true,
    speed: 1600,
    fade: true,
    cssEase: 'linear',
    autoplay: true,
    autoplaySpeed: 10000,
  });
}
