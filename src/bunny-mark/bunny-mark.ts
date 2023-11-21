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

  // Constants
  const RAYWHITE = mem.alloc(_sizeof_Color); set_Color_r(RAYWHITE, 245); set_Color_g(RAYWHITE, 245); set_Color_b(RAYWHITE, 245); set_Color_a(RAYWHITE, 255);
  const BLACK = mem.alloc(_sizeof_Color); set_Color_r(BLACK, 0); set_Color_g(BLACK, 0); set_Color_b(BLACK, 0); set_Color_a(BLACK, 255);
  const GREEN = mem.alloc(_sizeof_Color); set_Color_r(GREEN, 0); set_Color_g(GREEN, 255); set_Color_b(GREEN, 0); set_Color_a(GREEN, 255);
  const MAROON = mem.alloc(_sizeof_Color); set_Color_r(MAROON, 190); set_Color_g(MAROON, 33); set_Color_b(MAROON, 55); set_Color_a(MAROON, 255);
  const MAX_BUNNIES = 50000;
  const MAX_BATCH_ELEMENTS = 8192;

  // Bunny buffers
  let bunniesCount = 0;
  const bunnyBridge = {
    pos: mem.alloc(_sizeof_Vector2),
    color: mem.alloc(_sizeof_Color),
  };

  // TODO: Unsupported ObjectTypeAnnotation
  //const bunnies: { pos: { x: number, y: number }, speed: { x: number, y: number }, color: {r: number, g: number, b: number, a: number} }[] = [];

  // TODO: new Array(MAX_BUNNIES) causes a runtime assertion when assigning the elements of the array
  const bunnies_pos_x: number[] = []; 
  const bunnies_pos_y: number[] = [];
  const bunnies_speed_x: number[] = [];
  const bunnies_speed_y: number[] = [];
  const bunnies_color_r: number[] = [];
  const bunnies_color_g: number[] = [];
  const bunnies_color_b: number[] = [];
  const bunnies_color_a: number[] = [];

  // Initialization
  const width = 640, height = 480;
  const title = mem.alloc("raylib - bunny mark");
  _InitWindow(width, height, title);
  
  const wabbitTexture = mem.alloc(_sizeof_Texture);
  const wabbitTexturePath = mem.pin(get_resource_path(mem.alloc("wabbit_alpha.png")));
  const wabbitDim = { w: 0, h: 0 };

  const bunniesText = mem.alloc(256);
  const batchedText = mem.alloc(256);
  
  _LoadTexture(wabbitTexture, wabbitTexturePath);
  wabbitDim.w = get_Texture_width(wabbitTexture);
  wabbitDim.h = get_Texture_height(wabbitTexture);
  
  _SetTargetFPS(60);

  while (!_WindowShouldClose())
  {
    // Update
    if (_IsMouseButtonDown(_MOUSE_BUTTON_LEFT))
    {
        // Create more bunnies
        for (let i = 0; i < 100; i++)
        {
          if (bunniesCount < MAX_BUNNIES)
          {
            _GetMousePosition(bunnyBridge.pos);
            bunnies_pos_x.push(get_Vector2_x(bunnyBridge.pos));
            bunnies_pos_y.push(get_Vector2_y(bunnyBridge.pos));
            bunnies_speed_x.push((Math.floor(Math.random() * (250 - -250 + 1)) + -250) / 60);
            bunnies_speed_y.push((Math.floor(Math.random() * (250 - -250 + 1)) + -250) / 60);
            bunnies_color_r.push(Math.floor(Math.random() * (240 - 50 + 1)) + 50);
            bunnies_color_g.push(Math.floor(Math.random() * (240 - 80 + 1)) + 80);
            bunnies_color_b.push(Math.floor(Math.random() * (240 - 100 + 1)) + 100);
            bunnies_color_a.push(255);
            bunniesCount++;
          }
        }
    }

    // Update bunnies speed and position
    for (let i = 0; i < bunniesCount; i++)
    {
        bunnies_pos_x[i] += bunnies_speed_x[i];
        bunnies_pos_y[i] += bunnies_speed_y[i];

        if (((bunnies_pos_x[i] + wabbitDim.w/2) > width) || ((bunnies_pos_x[i] + wabbitDim.w/2) < 0)) bunnies_speed_x[i] *= -1;
        if (((bunnies_pos_y[i] + wabbitDim.h/2) > height) || ((bunnies_pos_y[i] + wabbitDim.h/2 - 40) < 0)) bunnies_speed_y[i] *= -1;
    }

    // Draw
      _BeginDrawing();

        _ClearBackground(RAYWHITE);
        for (let i = 0; i < bunniesCount; i++)
        {
            set_Color_r(bunnyBridge.color, bunnies_color_r[i]);
            set_Color_g(bunnyBridge.color, bunnies_color_g[i]);
            set_Color_b(bunnyBridge.color, bunnies_color_b[i]);
            set_Color_a(bunnyBridge.color, bunnies_color_a[i]);
            _DrawTexture(wabbitTexture, Math.floor(bunnies_pos_x[i]), Math.floor(bunnies_pos_y[i]), bunnyBridge.color);
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
