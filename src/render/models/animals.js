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
// 真正靠扑翼飞的那几种（比 LEGLESS 少一个 bug —— 幼虫在地上爬，不会飞）。
// 这份名单必须和 core.js 导出的 Eco.FLIERS 一致，check-fly.cjs 里有断言守着，
// 两边对不上会直接报错。渲染层要自己查一遍名单，不能只看 a.flying：
// 那个字段谁都能设，给猫设成 true 它就浮空了（测试里真踩到过）。
// 龙也不在内 —— 它的 TRAITS.move 是 fly，但它画了六条腿在地上走。
const FLIERS = new Set(['bird', 'bee', 'butterfly', 'redstart', 'longtail', 'wren']);

// 头最多往下转多少度（吃的时候低头够草）。
const NECK_MAX = (45 * Math.PI) / 180;

// 睡觉时歪头的角度（弧度）。检查脚本要用它认出「哪些部件是跟着头一起歪的」，
// 所以别把这个数字抄到检查脚本里去。
const HEAD_TILT = 0.3;
GardenModels.HEAD_TILT = HEAD_TILT;

// 每只动物当前的头部角度。pose() 是逐帧调用的，所以平滑状态自己记一份，
// 不写回 a（写回 a 会被存进存档）。
const neckSmooth = new WeakMap();

// 「被冲走时整只翻转」的角度，在 pose() 里算一次、scene.js 画每个方块时都读同一个值。
// 之所以绕这一圈而不是两边各算一次：drawAnimals 每帧对每只动物只调一次 pose()，
// 而 part() 要被调几十次（每个方块一次）。两边各算就会因为逐帧顺序和浮点差一点点，
// 翻转会看着抖。存一份在这里，读的人用 GardenModels.driftRoll() 取。
let lastDriftRoll = 0;
GardenModels.driftRoll = () => lastDriftRoll;

// 被冲走时整只翻转的支点高度（局部坐标，0 是脚底）。
// 取 0.3：多数动物的身子中心就在 0.3–0.45，腿短、脖子长的略高一点也还在附近。
// 支点太高整只几乎不倾（只是原地转），太低则像被人从脚底掀翻。
const DRIFT_PIVOT = 0.3;
GardenModels.DRIFT_PIVOT = DRIFT_PIVOT;

// 把一个部件的局部坐标按翻转角转一下 —— 位置绕支点转，盒子自己转同一个角。
//
// 以前是把翻转角当 tilt 分发给每个方块，而 put() 只转盒子不转位置，于是鹿角、兔耳、
// 狼耳各自原地打转而身子不动，画面上就是散架（项目所有者原话：「那个静止不动的模型，
// 绕着一个轴去转」）。要刚体，位置和角度就**必须由这一个函数一起给**，缺一半就不刚体。
//
// 放在这里而不是写在 scene.js 的 part() 里，是为了能被检查脚本直接调用：
// check-sleep-drift.cjs 拿它把每个部件在翻转过程中的坐标算一遍，验证两件事 ——
// 部件之间的距离一个数都不能变（刚体），而且真的挪动了（不是原地只转盒子）。
const rigidRoll = (dx, y, dz, roll) => {
  const cr = Math.cos(roll),
    sr = Math.sin(roll),
    ry = y - DRIFT_PIVOT;
  return { x: dx * cr - ry * sr, y: DRIFT_PIVOT + dx * sr + ry * cr, rz: roll };
};
GardenModels.rigidRoll = rigidRoll;

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

  // 一条腿的摆动：fwd 是脚相对身体的前后偏移（格），lift 是抬离地面的高度系数。
  //
  // 为什么 fwd 必须"对相位线性"：脚踩在地上时，世界位置 = 身体位置 + fwd，
  // 身体每走 1 格 fwd 就要减 1，fwd 才是匀速后退、脚才原地不动。
  // 而角度不能直接设成线性：角度线性的话 sin 不是线性，脚会在原地一快一慢地晃。
  // 所以先定 fwd（线性，保证不打滑），再由 fwd 反推角度（asin），腿就是绕胯真转。
  function legAt(i, legLen) {
    if (stride === null) stride = strideOf(legLen);
    const A = (DUTY * stride) / 2;
    // 被冲走时**不摆腿**：保持 REST，整体交给 driftRoll 当刚体转。
    // 以前这里也走一遍扑腾（u = driftU + i*0.5），腿相对身子在动 ——
    // 那样就不是刚体了，翻转时看着像腿在甩、身子在转，两件事打架。
    if (!walk) return REST;
    const u = (cycleU() + i * 0.5) % 1;
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

  // 飞：a.flying 由模拟推导（core.js 里的 IN_AIR 名单），表示这类物种此刻在不在空中移动。
  // 翅膀这一拍的角度集中在这里算 —— 之前鸟 / 蝴蝶 / 蜜蜂 / 访客小鸟各自写死了一个乘数
  // （0.4 / 0.4 / 0.45 / 0.08），四份都不一样，想统一调就得改四个地方。
  //
  // 站着：小幅慢扇（停在枝头也会偶尔扇两下）。
  // 飞着：大幅快扇，鸟翼一拍大约十次 —— 所以这两档是分开的，不是一个乘数。
  // 频率按时间走而不是按走路进度：翼拍快慢和移动快慢没关系，而且站着不动时照样在扇。
  // 带上 a.variant 是为了让同一格里的几只不同步扇。
  const flying = FLIERS.has(a.type) && !!a.flying,
    flap = asleep ? 0 : (flying ? 0.95 : 0.3) * Math.sin(sec * TAU * (flying ? 9 : 1.4) + (a.variant || 0) * 1.3);

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
    LEG_K = asleep ? 0.22 : 1,
    // 睡觉时歪头的角度。headFrame() 里要用，所以提到局部变量（下面返回对象里也有一份同值的 earTilt）。
    earTilt = asleep ? HEAD_TILT : 0,
    // 喝醉了走路摇摇晃晃。身子用它，头也用它（头要跟着身子一起晃）。
    bodyTilt = drunk ? Math.sin(sec * TAU * 0.63) * 0.11 : 0,
    // 整个身子被托起多少（呼吸、被冲走时浮起来、没腿的走路时颠一下）。
    // 头也要跟着一起被托起来，所以提到局部变量。
    bodyLift =
      breath * (asleep ? 0.02 : 0.004) +
      (drift ? 0.07 : 0) +
      // 模型里没画腿的（鸟、蜂、蝶、幼虫）走路时没东西可摆，
      // 只能靠身体一颠一颠表示在移动：一个循环里颠两次
      // （这些物种永远不调 place()，所以这里的步长固定就是 STRIDE_MAX）
      (walk && LEGLESS.has(a.type)
        ? Math.abs(Math.sin((a.phase / STRIDE_MAX) * Math.PI)) * 0.035
        : 0);
  // 整只翻转的角度：存一份给 scene.js 的 part() 用（见上面 driftRoll 的说明）
  lastDriftRoll = drift ? Math.sin(sec * TAU * 1.3) * 0.5 : 0;
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
    legY: LEG_K,
    eyeH: asleep ? 0.25 : 1,
    earTilt: asleep ? HEAD_TILT : 0,
    // —— 头 = 一个刚体 ——
    //
    // 头不是一个东西，是一堆盒子：头、鼻子、眼睛、耳朵、鹿角。任何动作都不该把它们拆开转，
    // 拆开的后果项目所有者已经见过两次：
    //   「头歪了眼睛不歪」  —— 歪斜角只发给了盒子，位置没转
    //   「歪鼻子歪眼」      —— 盒子各自绕自己中心拧，彼此的相对位置一个数都没变
    // 和「被冲走时方块搭的小动物散架」是同一个病根：同一个角，位置和盒子必须一起转。
    //
    // 所以模型**不许自己算头的位置和转角**。它只能说一句话：
    // 「这个盒子在**清醒、不歪**时的头局部坐标里放在哪、有多大、什么颜色」，
    // 然后调 head.draw(...)。剩下的（歪头、低头、睡着压低、整体摇晃、模型自己的缩放）
    // 全在这里算一次 —— 模型拿不到「让鼻子单独歪一点」的机会，因为这里根本没有让它插手的地方。
    //
    // 连接点由每个物种自己给（pivotY / pivotZ），性质和腿的胯高、腿长一样。
    //
    //   const HEAD = P.headFrame(part, NECK_Y, NECK_Z, { sway: P.sway * 0.05 });
    //   HEAD.draw(0, 0.86, 0.44, 0.4, 0.35, 0.35, col);   // 头
    //   HEAD.draw(0.115, 0.905, 0.625, 0.065, 0.065 * P.eyeH, 0.035, dark);  // 眼睛
    //
    // opt 里只放「整个头一起做」的事，一个数都不能少：
    //   sway      醉的时候整体左右摇多少（以前 12 个模型各写一遍 P.sway * 0.05）
    //   xScale    整个头在左右方向缩放（访客的 wide = 0.76）
    //   rest      整个头纵向压低（访客晒太阳 0.62 / 泡水 0.55）
    //   pressWith 睡着时往下压用头的比例还是身子的比例（幼虫整个身子都在缩）
    //   sleepDrop 往下压的倍数（鸟 1.6：它睡觉要把头缩进脖子里）
    //   sleepZ    睡着时整个头在前后方向挪多少（鸟 −0.05）
    //   sleepW    睡着时整个头宽度缩多少（鸟 0.9）
    headFrame: (part, pivotY, pivotZ, opt = {}) => {
      const sway = opt.sway || 0,
        xScale = opt.xScale === undefined ? 1 : opt.xScale,
        rest = opt.rest === undefined ? 1 : opt.rest,
        press = asleep ? (opt.pressWith === 'body' ? BODY_K : HEAD_K) : 1,
        drop = asleep ? 0.04 * (opt.sleepDrop === undefined ? 1 : opt.sleepDrop) : 0,
        dz = asleep ? opt.sleepZ || 0 : 0,
        dw = asleep && opt.sleepW ? opt.sleepW : 1;
      // 一个头的部件最终放哪（不含盒子自己的转角，那在 draw 里统一加）
      const place = (dx, y, z) => {
        let hx = dx,
          hy = y,
          hz = z;
        // 歪头：在冠状面里绕脖子连接点左右转
        if (earTilt) {
          const c = Math.cos(earTilt),
            s = Math.sin(earTilt),
            ry = y - pivotY;
          hx = dx * c - ry * s;
          hy = pivotY + dx * s + ry * c;
        }
        // 低头：在矢状面里绕脖子连接点前后转（绕 X 轴，正数 = 低头）
        if (neck) {
          const dy = hy - pivotY,
            dzz = z - pivotZ,
            c = Math.cos(neck),
            s = Math.sin(neck);
          hy = pivotY + dy * c - dzz * s;
          hz = pivotZ + dy * s + dzz * c;
        }
        return { x: hx * xScale + sway, y: (hy * press - drop) * rest + bodyLift, z: hz + dz };
      };
      const draw = (dx, y, dz2, w, h, d, col, tilt = 0, pitch = 0) => {
        const p = place(dx, y, dz2);
        // rz = 绕前后轴 = 冠状面 = 左右歪；rx = 绕左右轴 = 矢状面 = 低头。
        // 两个角都加在这里，模型碰不到，也就不会再出现「头歪了眼睛没歪」。
        part(p.x, p.y, p.z, w * xScale * dw, h, d, col, tilt + earTilt + bodyTilt, neck + pitch);
      };
      return {
        at: place,
        draw,
        // 画一只眼睛。和 draw 的唯一区别：睡着时把它压扁（闭眼）。
        //
        // 闭眼改的是**盒子的大小**，刚体管的是**位置和转角** —— 两件事互不干涉，
        // 所以「头是一个刚体」并不妨碍闭眼：刚体保证眼睛永远黏在脸上不挪位，
        // 闭眼只把那个盒子压成一条。眼睛是整张脸上唯一允许单独改变形状的东西。
        //
        // 压扁的比例统一在这里，不再让 12 个模型各写一遍 h * P.eyeH
        //（漏一个就是「睡着了眼睛还睁着」）。
        drawEye: (dx, y, dz, w, h, d, col) => draw(dx, y, dz, w, h * (asleep ? 0.25 : 1), d, col),
      };
    },
    // 被冲走时整只被水托起来一点，所以这里比呼吸大得多
    lift: bodyLift,
    // 醉：走路摇摇晃晃。频率故意不和脚步同频，同频的话看着像在打拍子而不是站不稳。
    sway: drunk ? Math.sin(sec * TAU * 0.9) : 0,
    tilt: bodyTilt,
    // 被冲走：整只当一个刚体翻转。**不要把这个角度塞进 tilt** ——
    // tilt 是「每个方块绕自己中心转」，而 put() 只转盒子不转位置，所以鹿角、
    // 兔耳、狼耳会各自原地打转而身子不动，看着就是散架（项目所有者原话）。
    // 正确的做法是位置和盒子一起转同一个角度、绕同一个支点，scene.js 的 part()
    // 里做（那里才是所有部件的唯一出口）。
    driftRoll: lastDriftRoll,
    // 飞起来的三样东西，6 种会飞的共用（鸟 / 蝴蝶 / 蜜蜂 / 红尾水鸲 / 长尾山雀 / 冬鹪鹩）
    fly: flying,
    flap,
    // 升空高度。站着时各模型自己的 lift 已经把身体托到该在的位置，
    // 飞起来再抬这么一截才像离开了地面。
    flyLift: flying ? 0.3 : 0,
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

// 渲染层那份会飞名单，暴露出来是为了让检查脚本能断言它和 core.js 的 Eco.FLIERS
// 没有跑偏。两边各写一份是为了不让渲染层依赖模拟的内部结构（和 LEGLESS 一个道理），
// 代价就是必须有人盯着它们一致 —— 那就是 check-fly.cjs 的活。
GardenModels.FLIERS = FLIERS;
