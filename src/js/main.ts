import { Conf } from "./core/conf";
import { ImgEffect } from "./parts/imgEffect";
// import { ImgEffect2 } from "./parts/imgEffect2";

if(Conf.IS_TOUCH_DEVICE) document.body.classList.add('-touch')
if(!Conf.IS_TOUCH_DEVICE) document.body.classList.add('-mouse')


// 画像うにょうにょ
new ImgEffect({
  el: document.querySelector('.l-mainCanvas') as HTMLElement,
  transparent: true,
})

// 画像、デバイス回転
// new ImgEffect2({
//   el: document.querySelector('.l-mainCanvas') as HTMLElement,
//   transparent: true,
// })
