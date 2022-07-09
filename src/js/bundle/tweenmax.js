export function tweenMax() {
  // var setSpeedMain = 5;
  const setSpeedMain = 1.35;
  const setSpeedSub = 1.12;
  const setDelaySub = 0.23;
  // if (spFlg) {
  //   setSpeedMain = 1.35;
  //   setSpeedSub = 1.3;
  //   setDelaySub = 0.05;
  // }
  TweenMax.to('.hero__ttl', setSpeedMain,
    {opacity: 1, y: -10, duration: setSpeedMain
  });

  TweenMax.to('.top-main-logo .top-slide-up-anime', setSpeedMain, {
    y: '0%',
    ease: Power3.easeout,
    // z: 0.01,
    z: 800,
  });

  TweenMax.to('.top-main-ttl .top-slide-up-anime', setSpeedMain, {
    y: '0%',
    ease: Power3.easeOut,
    // z: 0.01,
    z: 800,
  });
  TweenMax.to('.top-main-ttl-sub .top-slide-up-anime', setSpeedSub, {
    y: '0%',
    ease: Power3.easeOut,
    delay: setDelaySub,
    // z: 0.01,
    z: 800,
  });
}
