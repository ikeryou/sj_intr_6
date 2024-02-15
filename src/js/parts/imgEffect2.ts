import { BufferAttribute, BufferGeometry, Color, Object3D, Points, RawShaderMaterial, Vector3 } from "three";
import { Canvas, CanvasConstructor } from "../webgl/canvas";
import { Conf } from "../core/conf";
import { Param } from "../core/param";
import { ImgEffectShader2 } from "../glsl/imgEffectShader2";
import { Util } from "../libs/util";
import { Func } from "../core/func";

export class ImgEffect2 extends Canvas {
  private _con: Object3D
  private _mesh: Points | undefined
  private _ang:number = 0
  private _val:number = 0
  private _imgSize:number = 512
  private _sample:Array<any> = []
  private _oldAng:number = -1
  private _rotCnt:number = 0

  constructor(opt: CanvasConstructor) {
    super(opt)

    this._con = new Object3D()
    this.mainScene.add(this._con)

    Param.instance.setDebug('test')

    // センサー取得
    if(!Conf.FLG_TEST && window.DeviceOrientationEvent) {
      document.querySelector('.l-btn')?.addEventListener('click', () => {
        (window.DeviceOrientationEvent as any).requestPermission().then((r:any) => {
          if(r == 'granted') {
            window.addEventListener('deviceorientation', (e:DeviceOrientationEvent) => {
              if(this._oldAng != -1) {
                this._oldAng = this._val
              } else {
                this._oldAng = Number(e.alpha)
              }
              this._val = Number(e.alpha)

              // const alpha = e.alpha
              Param.instance.setDebug('ang ' + this._val)

              if((this._oldAng - this._val) > 300) {
                this._rotCnt++
              }
              if((this._oldAng - this._val) < -300) {
                this._rotCnt--
              }

            }, true)
            document.querySelector('.l-btn')?.classList.add('s-none')
          }

        })
      })
    } else {
      document.querySelector('.l-btn')?.classList.add('s-none')
    }

    // 画像解析
    this._loadImg()

    this._resize()
  }


  private _loadImg(): void {
    const img = new Image();
    img.src = Conf.PATH_IMG + 'sample2.png'

    img.onload = () => {
      const cvs:any = document.createElement('canvas');
      cvs.width = cvs.height = this._imgSize;
      const ctx = cvs.getContext('2d');
      ctx.drawImage(img, 0, 0);
      img.style.display = 'none';

      const imageData = ctx.getImageData(0, 0, cvs.width, cvs.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const key = ~~(i / 4)
        const ix = ~~(key % cvs.width)
        const iy = ~~(key / cvs.width)
        const r = data[i + 0] // 0 ~ 255
        const g = data[i + 1] // 0 ~ 255
        const b = data[i + 2] // 0 ~ 255
        const a = data[i + 3] // 0 ~ 255

        const kake = 1
        if(a > 0) {
          this._sample.push({
            color:new Color(r / 255, g / 255, b / 255),
            pos:new Vector3(
              (ix - this._imgSize * 0.5) * kake,
              ((iy - this._imgSize * 0.5) * -1) * kake,
              0
            )
          })
        }

      }
      console.log(this._sample.length);
      this._makeMesh();
    }
  }


  private _makeMesh(): void {
    this._mesh = new Points(
      this.getGeo(),
      new RawShaderMaterial({
        vertexShader:ImgEffectShader2.vertexShader,
        fragmentShader:ImgEffectShader2.fragmentShader,
        transparent:true,
        uniforms:{
          alpha:{value:0},
          size:{value:2},
          time:{value:0},
          ang:{value:0},
        }
      })
    )
    this._con.add(this._mesh)
  }


  protected _update(): void {
    super._update()

    // ローカルテスト用
    if(Conf.FLG_TEST) {
      this._oldAng = this._val
      this._val = Math.sin(this._c * 0.01) * 90

      if((this._oldAng - this._val) > 300) {
        this._rotCnt++
      }
    }

    if(this._mesh != undefined) {
      const s = Func.r(1)
      this._mesh.scale.set(s, s, 1)

      this._setUni(this._mesh, 'size', 5)

      const ang = this._val + (this._rotCnt * 360);
      this._ang += (ang - this._ang) * 0.1
      this._setUni(this._mesh, 'ang', Util.radian(this._ang))
    }

    this.renderer.setClearColor(0x000000, 1)
    this.renderer.render(this.mainScene, this.cameraOrth)
  }


  protected _resize(): void {
    super._resize()

    const w = Func.sw()
    const h = Func.sh()

    this.renderSize.width = w
    this.renderSize.height = h

    this._updateOrthCamera(this.cameraOrth, w, h)

    let pixelRatio: number = window.devicePixelRatio || 1

    this.renderer.setPixelRatio(pixelRatio)
    this.renderer.setSize(w, h)
    this.renderer.clear()
  }


  // ---------------------------------
  //
  // ---------------------------------
  public getGeo():BufferGeometry {
    const num = this._sample.length

    const geometry = new BufferGeometry()

    const translate = new Float32Array(num * 3)
    const info = new Float32Array(num * 3)
    const color = new Float32Array(num * 3)

    let pKey = 0
    let i = 0
    while(i < num) {
        const p = this._sample[i].pos
        const col = this._sample[i].color

        translate[pKey*3+0] = p.x
        translate[pKey*3+1] = p.y
        translate[pKey*3+2] = 0

        info[pKey*3+0] = Math.sqrt(p.x * p.x + p.y * p.y)
        info[pKey*3+1] = 0
        info[pKey*3+2] = 0

        color[pKey*3+0] = col.r
        color[pKey*3+1] = col.g
        color[pKey*3+2] = col.b

        pKey++
        i++
    }

    geometry.setAttribute('position', new BufferAttribute(translate, 3))
    geometry.setAttribute('info', new BufferAttribute(info, 3))
    geometry.setAttribute('color', new BufferAttribute(color, 3))
    geometry.computeBoundingSphere()

    return geometry
  }
}
