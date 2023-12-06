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

  // TODO: Unsupported ObjectTypeAnnotation
  //const bunnies: { pos: { x: number, y: number }, speed: { x: number, y: number }, color: {r: number, g: number, b: number, a: number} }[] = [];

  // TODO: new Array(MAX_BUNNIES) causes a runtime assertion when assigning the elements of the array
  const bunnies_pos_x: number[] = [];
  const bunnies_pos_y: number[] = [];
  const bunnies_speed_x: number[] = [];
  const bunnies_speed_y: number[] = [];
  const bunnies_color: number[] = [];

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
      bunnies_pos_x.push(width/2);
      bunnies_pos_y.push(height/2);
      bunnies_speed_x.push((Math.floor(Math.random() * (250 - -250 + 1)) + -250) / 60);
      bunnies_speed_y.push((Math.floor(Math.random() * (250 - -250 + 1)) + -250) / 60);
      bunnies_color.push(makeColor(Math.floor(Math.random() * (240 - 50 + 1)) + 50,
          Math.floor(Math.random() * (240 - 80 + 1)) + 80,
          Math.floor(Math.random() * (240 - 100 + 1)) + 100,
          255));
      bunniesCount++;
    }
  }

  while (!_WindowShouldClose())
  {
    // Update

    // Update bunnies speed and position
    for (let i = 0; i < bunniesCount; i++)
    {
        bunnies_pos_x[i] += bunnies_speed_x[i];
        bunnies_pos_y[i] += bunnies_speed_y[i];

        if (((bunnies_pos_x[i] + wabbitDim_w/2) > width) || ((bunnies_pos_x[i] + wabbitDim_w/2) < 0)) bunnies_speed_x[i] *= -1;
        if (((bunnies_pos_y[i] + wabbitDim_h/2) > height) || ((bunnies_pos_y[i] + wabbitDim_h/2 - 40) < 0)) bunnies_speed_y[i] *= -1;
    }

    // Draw
      _BeginDrawing();

        _ClearBackground(RAYWHITE);
        for (let i = 0; i < bunniesCount; i++)
        {
            _sh_ptr_write_c_uint(bunnyBridge_color, 0, bunnies_color[i]);
            _DrawTexture(wabbitTexture, bunnies_pos_x[i], bunnies_pos_y[i], bunnyBridge_color);
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
