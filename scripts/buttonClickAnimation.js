function buttonClickAnimation(button) {
  var check_status = false;
  var like_cnt = button.querySelector("img");
  var like_parent = button;

  var burst = new mojs.Burst({
    parent: like_parent,
    radius: { 20: 60 },
    count: 15,
    angle: { 0: 30 },
    children: {
      delay: 250,
      duration: 700,
      radius: { 10: 0 },
      fill: ["#ddca7e"],
      easing: mojs.easing.bezier(0.08, 0.69, 0.39, 0.97),
    },
  });

  button.click(function () {
    var t1 = new TimelineLite();
    var t2 = new TimelineLite();
    if (!check_status) {
      t1.set(like_parent, { scale: 0 });
      t1.set(like_cnt, { scale: 0 });
      t1.to(like_parent, 0.6, { scale: 1, background: "#ddca7e", ease: Expo.easeOut });
      t2.to(like_cnt, 0.65, { scale: 1, ease: Elastic.easeOut.config(1, 0.3) }, "+=0.2");
      //    t1.timeScale(5);
      check_status = true;
      //circleShape.replay();
      burst.replay();
    } else {
      t1.to(like_cnt, 1, { scale: 1 }).to(like_cnt, 1, { scale: 1, background: "rgba(255,255,255,0.3)", ease: Power4.easeOut });
      t1.timeScale(7);
      check_status = false;
    }
  });
}

export { buttonClickAnimation };
