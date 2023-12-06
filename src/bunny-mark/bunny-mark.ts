(() => {
  const mem = (() => {
    const pinned: c_ptr[] = [];

    return {
      alloc: (val: number | string): c_ptr => {
        const mem = (typeof val === "string") ? stringToAsciiz(val) : malloc(Math.floor(val))
        pinned.push(mem);
        return mem;
      },
      pin: (val: c_ptr) => {
        pinned.push(val);
        return val;
      },
      release: () => {
        for (let i = 0; i < pinned.length; i++) { _free(pinned[i]) };
      }
    };
  })();

  /// Pack color channels into a 32-bit unsigned integer.
  function makeColor(r: number, g: number, b: number, a: number): number {
    "inline";
    return (a << 24) | (b << 16) | (g << 8) | r;
  }

  // Constants
  const RAYWHITE: c_ptr = mem.alloc(_sizeof_Color); set_Color_r(RAYWHITE, 245); set_Color_g(RAYWHITE, 245); set_Color_b(RAYWHITE, 245); set_Color_a(RAYWHITE, 255);
  const BLACK: c_ptr = mem.alloc(_sizeof_Color); set_Color_r(BLACK, 0); set_Color_g(BLACK, 0); set_Color_b(BLACK, 0); set_Color_a(BLACK, 255);
  const GREEN: c_ptr = mem.alloc(_sizeof_Color); set_Color_r(GREEN, 0); set_Color_g(GREEN, 255); set_Color_b(GREEN, 0); set_Color_a(GREEN, 255);
  const MAROON: c_ptr = mem.alloc(_sizeof_Color); set_Color_r(MAROON, 190); set_Color_g(MAROON, 33); set_Color_b(MAROON, 55); set_Color_a(MAROON, 255);
  const MAX_BUNNIES = 100000;
  const MAX_BATCH_ELEMENTS = 8192;

  // Bunny buffers
  let bunniesCount = 0;
  const bunnyBridge_pos: c_ptr = mem.alloc(_sizeof_Vector2);
  const bunnyBridge_color: c_ptr = mem.alloc(_sizeof_Color);

  class Bunny {
    pos_x: number;
    pos_y: number;
    speed_x: number;
    speed_y: number;
    color: number;

    constructor(pos_x: number, pos_y: number, speed_x: number, speed_y: number, color: number) {
        this.pos_x = pos_x;
        this.pos_y = pos_y;
        this.speed_x = speed_x;
        this.speed_y = speed_y;
        this.color = color;
    }
  }
  // TODO: Unsupported ObjectTypeAnnotation
  //const bunnies: { pos: { x: number, y: number }, speed: { x: number, y: number }, color: {r: number, g: number, b: number, a: number} }[] = [];

  // TODO: new Array(MAX_BUNNIES) causes a runtime assertion when assigning the elements of the array
  const bunnies: Bunny[] = [];

  // Initialization
  const width = 640, height = 480;
  const title = mem.alloc("raylib - bunny mark");
  _InitWindow(width, height, title);

  const wabbitTexture: c_ptr = mem.alloc(_sizeof_Texture);
  const wabbitTexturePath = mem.pin(get_resource_path(mem.alloc("wabbit_alpha.png")));
  var wabbitDim_w = 0;
  var wabbitDim_h = 0;

  const bunniesText = mem.alloc(256);
  const batchedText = mem.alloc(256);

  _LoadTexture(wabbitTexture, wabbitTexturePath);
  wabbitDim_w = get_Texture_width(wabbitTexture);
  wabbitDim_h = get_Texture_height(wabbitTexture);

  _SetTargetFPS(144);

  // Create more bunnies
  for (let i = 0; i < 100000; i++)
  {
    if (bunniesCount < MAX_BUNNIES)
    {
      bunnies.push( new Bunny(
          width/2,
          height/2,
          (Math.floor(Math.random() * (250 - -250 + 1)) + -250) / 60,
          (Math.floor(Math.random() * (250 - -250 + 1)) + -250) / 60,
          makeColor(Math.floor(Math.random() * (240 - 50 + 1)) + 50,
            Math.floor(Math.random() * (240 - 80 + 1)) + 80,
            Math.floor(Math.random() * (240 - 100 + 1)) + 100,
            255)));
      bunniesCount++;
    }
  }

  while (!_WindowShouldClose())
  {
    // Update

    // Update bunnies speed and position
    for (let i = 0; i < bunniesCount; i++)
    {
        let bunny: Bunny = bunnies[i];
        bunny.pos_x += bunny.speed_x;
        bunny.pos_y += bunny.speed_y;

        if (((bunny.pos_x + wabbitDim_w/2) > width) || ((bunny.pos_x + wabbitDim_w/2) < 0)) bunny.speed_x *= -1;
        if (((bunny.pos_y + wabbitDim_h/2) > height) || ((bunny.pos_y + wabbitDim_h/2 - 40) < 0)) bunny.speed_y *= -1;
    }

    // Draw
      _BeginDrawing();

        _ClearBackground(RAYWHITE);
        for (let i = 0; i < bunniesCount; i++)
        {
            let bunny: Bunny = bunnies[i];
            _sh_ptr_write_c_uint(bunnyBridge_color, 0, bunny.color);
            _DrawTexture(wabbitTexture, bunny.pos_x, bunny.pos_y, bunnyBridge_color);
        }

        _DrawRectangle(0, 0, width, 40, BLACK);

        copyToAsciiz(`bunnies: ${bunniesCount}`, bunniesText, 256);
        _DrawText(bunniesText, 120, 10, 20, GREEN);

        copyToAsciiz(`batched draw calls: ${1 + Math.floor(bunniesCount/MAX_BATCH_ELEMENTS)}`, batchedText, 256);
        _DrawText(batchedText, 320, 10, 20, MAROON);

        _DrawFPS(10, 10);

      _EndDrawing();
  }

  _UnloadTexture(wabbitTexture);

  mem.release();

  _CloseWindow();
})();
