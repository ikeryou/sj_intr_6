import { Mesh, Object3D, PlaneGeometry, ShaderMaterial } from "three";
import { Canvas, CanvasConstructor } from "../webgl/canvas";
import { ImgEffectShader } from "../glsl/imgEffectShader";
import { TexLoader } from "../webgl/texLoader";
import { Conf } from "../core/conf";
import { Func } from "../core/func";


export class ImgEffect extends Canvas {

  private _con: Object3D;
  private _mesh: Mesh;

  constructor(opt: CanvasConstructor) {
    super(opt)

    this._con = new Object3D()
    this.mainScene.add(this._con)

    const geo = new PlaneGeometry(1, 1, 64, 64)

    this._mesh = new Mesh(
      geo,
      new ShaderMaterial({
        vertexShader: ImgEffectShader.vertexShader,
        fragmentShader: ImgEffectShader.fragmentShader,
        transparent: true,
        uniforms:{
          tex:{value: TexLoader.instance.get(Conf.PATH_IMG + 'sample.png')},
          time:{value: 0},
        }
      })
    )
    this._con.add(this._mesh)

    this._resize()
  }


  protected _update(): void {
    super._update()

    const w = Func.sw()
    const h = Func.sh()

    const uni = this._getUni(this._mesh)
    uni.time.value += 1

    // 画像のサイズ
    const s = Math.min(w, h) * 0.75
    this._mesh.scale.set(s, s, 1)

    // レンダリング
    this.renderer.setClearColor(0x000000, 1)
    this.renderer.render(this.mainScene, this.cameraPers)
  }


  protected _resize(): void {
    super._resize()

    const w = Func.sw()
    const h = Func.sh()

    this.renderSize.width = w
    this.renderSize.height = h

    this._updatePersCamera(this.cameraPers, w, h)

    let pixelRatio: number = window.devicePixelRatio || 1

    this.renderer.setPixelRatio(pixelRatio)
    this.renderer.setSize(w, h)
    this.renderer.clear()
  }
}
