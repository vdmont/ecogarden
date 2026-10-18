globalThis.GardenModels = globalThis.GardenModels || {};
GardenModels.registry = {};
// 幼崽比成体小一圈。以前只有兔子、羊驼、访客三个文件各自写了一遍自己的缩放，
// 结果鹿、狐狸、刺猬、松鼠、鸟这些幼崽跟成体一样大。这里统一在这里缩，
// 模型文件里就不用再各写一遍，也就不会漏掉谁。
const JUVENILE = 0.7;

GardenModels.animals = function (ctx) {
  const type = ctx.a.type,
    key = ['fox', 'wolf'].includes(type)
      ? 'fox-wolf'
      : ['sheep', 'alpaca'].includes(type)
        ? 'sheep-alpaca'
        : type;
  if (ctx.a.age < 0) {
    const raw = ctx.part;
    ctx = {
      ...ctx,
      // 第 9 个参数 pitch（腿的转角）也必须透传：漏掉的话幼崽的腿是「整块平移」
      // 而不是绕胯转，幼崽走路看上去就是滑行。
      part: (dx, y, dz, w, h, d, col, tilt = 0, pitch = 0) =>
        raw(
          dx * JUVENILE,
          y * JUVENILE,
          dz * JUVENILE,
          w * JUVENILE,
          h * JUVENILE,
          d * JUVENILE,
          col,
          tilt,
          pitch,
        ),
    };
  }
  GardenModels.registry[key]?.(ctx);
};

// 全身只有躯干、没有腿的物种：走路时没腿可摆，只能靠身体一颠一颠表示在移动。
// 鸡和火烈鸟/夜鹭都有腿，不在这个名单里。
const LEGLESS = new Set(['bird', 'bee', 'butterfly', 'bug', 'redstart', 'longtail', 'wren']);

// 头最多往下转多少度（吃的时候低头够草）。
const NECK_MAX = (45 * Math.PI) / 180;
// 每只动物当前的头部角度。pose() 是逐帧调用的，所以平滑状态自己记一份，
// 不写回 a（写回 a 会被存进存档）。
const neckSmooth = new WeakMap();

// 所有动物共用的姿态都在这里算，模型文件只管画自己的方块。
// 放在一起是有意的：31 种动物要做同一件事时（比如"四条腿怎么交替"），
// 抄 31 份一定会改一处忘一处，节奏也会走样。
// 模型里这样用：
//   const P = GardenModels.pose(a, t);
//   const L = P.place(P.legGroup(side, dz > 0), 0.44, dz, 0.42);
//   然后 part(x, L.y, L.z, w, L.len, d, col, P.tilt, L.pitch)。
GardenModels.pose = function (a, t) {
  // —— 走路的算式，数字不是随手填的 ——
  // a.phase 是"累计走过的格数"（core.js 里 a.phase += speed * dt）。
  //
  // 摆角是直接定出来的（MAX_SWING），不是算出来的。
  // 之前写的是 A = min(0.3, 腿长×0.95)：偏移量写死 0.3 格，腿越短除出来的角度越猛 ——
  // 兔子、猫、狗一律撞到 asin(0.95)=72°，腿几乎甩成水平；鹿和火烈鸟腿长，角度自然小。
  // 于是"腿短"变成了"腿甩得离谱"，跟真实走路正好相反。现在反过来：先卡角度，
  // 再由角度算出偏移量 A = 腿长×sin(MAX_SWING)。
  const STRIDE_MAX = 1.0, // 腿长的动物一个循环正好走 1 格
    DUTY = 0.6, // 一个循环里踩地占几成（不管腿长短都保持这个比例）
    MAX_SWING = (45 * Math.PI) / 180,
    TAU = Math.PI * 2,
    sec = (t || 0) / 1000,
    asleep = a.sleep > 0,
    drunk = a.drunk > 0,
    drift = a.drift > 0,
    walk = a.state === 'walk';

  // 一个循环身体走几格。不打滑要求「踩地期间身体前进的距离 = 脚相对身体后退的距离 = 2A」，
  // 而 duty×stride = 2A 是死的，所以腿短的只能走得更少、循环得更密 ——
  // 这本来就符合现实：小动物步频高、步子小。
  const strideOf = (legLen) => {
    const A = Math.min((DUTY * STRIDE_MAX) / 2, legLen * Math.sin(MAX_SWING));
    return Math.max(1e-3, (2 * A) / DUTY);
  };
  // 同一只动物的所有腿必须共用一个步长，否则前腿和后腿会走岔（龙的四条腿长度还不一样）。
  // 所以由第一个调 place() 的腿把步长定下来，后面的腿一律沿用。
  let stride = null;
  const cycleU = () => {
    const u = (a.phase / (stride ?? STRIDE_MAX)) % 1;
    return u < 0 ? u + 1 : u;
  };

  // 走路的循环位置。被冲走时脚下没有"一个整圈"，用时间直接驱动，幅度也更大：一眼就要看出在扑腾
  //
  // fwd 必须是 0，不能省。站着不动时 legAt 返回 REST，place() 会拿 fwd 去算角度
  // （asin(fwd/len)）。以前这里写成 { ang: 0, lift: 0 }，fwd 是 undefined，
  // 除出来是 NaN，于是**待机时（默认状态就是 idle）整条腿的坐标全是 NaN**，
  // three.js 直接不画 —— 画面上就是动物没有腿、整只悬空。
  const REST = { fwd: 0, lift: 0 };
  const driftU = (sec * 2.1) % 1;

  // 一条腿的摆动：fwd 是脚相对身体的前后偏移（格），lift 是抬离地面的高度系数。
  //
  // 为什么 fwd 必须"对相位线性"：脚踩在地上时，世界位置 = 身体位置 + fwd，
  // 身体每走 1 格 fwd 就要减 1，fwd 才是匀速后退、脚才原地不动。
  // 而角度不能直接设成线性：角度线性的话 sin 不是线性，脚会在原地一快一慢地晃。
  // 所以先定 fwd（线性，保证不打滑），再由 fwd 反推角度（asin），腿就是绕胯真转。
  function legAt(i, legLen) {
    if (stride === null) stride = strideOf(legLen);
    const A = (DUTY * stride) / 2;
    let u = null;
    if (walk) u = (cycleU() + i * 0.5) % 1;
    else if (drift) u = (driftU + i * 0.5) % 1;
    if (u === null) return REST;
    if (u < DUTY) return { fwd: A - (2 * A * u) / DUTY, lift: 0 }; // 踩地：匀速后退
    const f = (u - DUTY) / (1 - DUTY);
    return { fwd: -A + 2 * A * f, lift: Math.sin(Math.PI * f) }; // 摆动：抬起来往前送
  }

  // 呼吸：站着浅而快，睡着深而慢（scene.js 里睡着时整体起伏是关掉的，所以睡着反而要靠这里）
  const breath = Math.sin(sec * TAU * (asleep ? 0.22 : 0.42));
  // 吃：站着低头嚼那 10 拍（a.act 由模拟设置，到期它自己清掉）。
  // 咀嚼节奏用渲染层的时间驱动（这里拿得到毫秒），所以头是一点一点在动的，
  // 而不是十拍一动。头往哪边低、往哪边转，由模拟把整只动物转过去（a.dir）。
  const eat = a.act === 'eat',
    chew = eat ? Math.sin(sec * TAU * 3.6) : 0; // -1..1

  // —— 头绕脖子转，不是整块上下平移 ——
  // 之前「吃」是把头整体往下挪（headY 打折 + headDrop 减一点），画面上头是上下窜的，
  // 像被人按了一下又弹起来。腿那边早就改成绕胯转了，头得用同一个道理：
  // 上端钉在脖子与躯干的连接点上，下端画弧，那才像低头够草。
  //
  // 角度上限 45°。实际角度每帧只趋近目标的一小部分，所以从抬头到低头是「压下去」，
  // 不是「啪一下弹过去」。这份平滑状态记在这里、不写回 a —— 写回会被存进存档；
  // scene.js 里转朝向的 motion 表也是同样的思路。
  const neckState = (() => {
    let st = neckSmooth.get(a);
    if (!st) neckSmooth.set(a, (st = { ang: 0 }));
    const target = eat ? NECK_MAX : 0;
    st.ang += (target - st.ang) * 0.22;
    if (!target && Math.abs(st.ang) < 0.0015) st.ang = 0;
    return st;
  })();
  // 咀嚼是在极限角附近轻轻点一下，但**不许越出 0–45°**：所以点的是上限之内，
  // 而不是「45° 再加 2°」——那样峰值会变成 47°，就超出定的范围了。
  const neck = Math.max(0, Math.min(NECK_MAX, neckState.ang + chew * 0.035));

  // 睡着时各个部位各自压到什么程度。
  // 头单独用一个压法：压得比身子轻，不然头会陷进躯干里糊成一坨。
  // （睡着还是整体压低、不走 neck，那是另一套，不在这次的范围里）
  const BODY_K = asleep ? 0.55 : 1,
    HEAD_K = asleep ? 0.62 : 1,
    LEG_K = asleep ? 0.22 : 1;
  return {
    asleep,
    drunk,
    drift,
    walk,
    eat,
    chew,
    neck,
    breath,
    bodyY: BODY_K,
    headY: HEAD_K,
    legY: LEG_K,
    headDrop: asleep ? 0.04 : 0,
    headFwd: asleep ? 0.15 : 0,
    headH: asleep ? 0.8 : 1,
    eyeH: asleep ? 0.25 : 1,
    earTilt: asleep ? 0.3 : 0,
    // 头的一个部件绕「脖子与躯干的连接点」转，返回模型要用的 y / z / pitch。
    //
    // 模型里这样用（连接点由每个物种自己给，和腿的胯高、腿长一个性质）：
    //   const NECK_Y = 0.55, NECK_Z = 0.2;   // 脖子接在躯干上的那个点
    //   const H = P.neckAt(y, dz, NECK_Y, NECK_Z);
    //   part(dx, H.y, H.z, w, h, d, col, tilt, H.pitch);   // ← H.pitch 放最后一格
    //
    // ⚠ H.pitch 必须放 part() 的**最后一格（pitch），不能加进倒数第二格（tilt）**。
    // 动物的正面朝 +z，所以最后一格进 put() 的 rx = 绕左右轴的前后摆 = 矢状面 =
    // 低头；倒数第二格进 rz = 绕前后轴的左右歪 = 冠状面 = 左右扭头。
    // 放错进去的后果很隐蔽：头盒子拧了、眼睛没拧（eye() 一直是放对的），
    // 画面上就是「脖子歪着扭」，而不低头。
    //
    // 绕 X 轴（矢状面）转，正数=低头。鼻子往下走的同时贴着脖子画弧，
    // 不会一边低头一边往回缩（那是绕自己中心转才会有的毛病）。
    neckAt: (y, z, pivotY, pivotZ) => {
      if (!neck) return { y, z, pitch: 0 };
      const dy = y - pivotY,
        dz = z - pivotZ,
        c = Math.cos(neck),
        s = Math.sin(neck);
      return {
        y: pivotY + dy * c - dz * s,
        z: pivotZ + dy * s + dz * c,
        pitch: neck,
      };
    },
    // 被冲走时整只被水托起来一点，所以这里比呼吸大得多
    lift:
      breath * (asleep ? 0.02 : 0.004) +
      (drift ? 0.07 : 0) +
      // 模型里没画腿的（鸟、蜂、蝶、幼虫）走路时没东西可摆，
      // 只能靠身体一颠一颠表示在移动：一个循环里颠两次
      // （这些物种永远不调 place()，所以这里的步长固定就是 STRIDE_MAX）
      (walk && LEGLESS.has(a.type)
        ? Math.abs(Math.sin((a.phase / STRIDE_MAX) * Math.PI)) * 0.035
        : 0),
    // 醉：走路摇摇晃晃。频率故意不和脚步同频，同频的话看着像在打拍子而不是站不稳。
    sway: drunk ? Math.sin(sec * TAU * 0.9) : 0,
    tilt: drift ? Math.sin(sec * TAU * 4.2) * 0.2 : drunk ? Math.sin(sec * TAU * 0.63) * 0.11 : 0,
    flail: drift ? Math.sin(sec * TAU * 4.2) : 0,
    lean: drift ? 0.22 : 0,
    // 对角的两条腿同步：前左+后右一组，前右+后左一组，走起来才不会四条腿一起动。
    // 模型不用自己算，只管说"这条腿在前还是在后、在左边还是右边"。
    // 注意必须返回数字：数组用布尔值当下标取到的是键 "true"/"false"，结果是 undefined。
    legGroup: (side, front) => ((front ? side < 0 : side > 0) ? 0 : 1),
    // 模型里最常用的一句：给我这条腿的组号、胯的位置、腿多长。
    // 转的是胯，不是腿自己的中心，所以腿像铰链一样前后摆，而不是整块平移。
    // 返回：y/z = 腿中心的位置，footY/footZ = 蹄子中心，footH = 蹄子高度，pitch = 该传的转角。
    // 睡着时腿缩进肚子底下（P.legY）并且不再摆。
    //
    // footH 是蹄子有多高（羊、羊驼有）。给了就返回「正好盖在腿末端」的蹄子中心：
    // 之前这里是写死的 len−0.06，腿一变短（幼崽、睡着）这 0.06 不跟着缩，
    // 蹄子就会浮在腿中间，或者甩起来变成一块斜插的板子。
    place: (i, hipY, hipZ, legLen, footH = 0) => {
      const len = legLen * LEG_K,
        L = asleep ? REST : legAt(i, len),
        // 脚的偏移就是 len·sin(角度)，所以角度由偏移反推（腿短时夹一下，别越界）
        ang = Math.asin(Math.max(-1, Math.min(1, L.fwd / Math.max(1e-4, len)))),
        c = Math.cos(ang),
        s = Math.sin(ang),
        hip = hipY * LEG_K,
        hop = L.lift * len * 0.28,
        at = (down) => [hip - down * c + hop, hipZ + down * s];
      const [y, z] = at(len / 2);
      // 蹄子跟着腿一起缩放，底面正好落在腿末端
      const fh = footH * (len / Math.max(1e-4, legLen));
      const [footY, footZ] = fh > 0 ? at(Math.max(0, len - fh / 2)) : at(len);
      // endY/endZ 是腿末端（真正踩在地面上的那个点），打滑检查要量它，不是量蹄子中心
      const [endY, endZ] = at(len);
      return { y, z, footY, footZ, endY, endZ, footH: fh, pitch: -ang, len };
    },
  };
};
