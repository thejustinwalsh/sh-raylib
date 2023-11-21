(() => {

  const RAYWHITE = malloc(_sizeof_Color); set_Color_r(RAYWHITE, 245); set_Color_g(RAYWHITE, 245); set_Color_b(RAYWHITE, 245); set_Color_a(RAYWHITE, 255);
  const BLACK = malloc(_sizeof_Color); set_Color_r(BLACK, 0); set_Color_g(BLACK, 0); set_Color_b(BLACK, 0); set_Color_a(BLACK, 255);

  const WIDTH = 640;
  const HEIGHT = 480;

  const TITLE = stringToAsciiz("raylib - hello world");
  const MESSAGE = stringToAsciiz("Hello Static Hermes!");

  const cleanup: c_ptr[] = [RAYWHITE, BLACK, TITLE, MESSAGE];

  _InitWindow(WIDTH, HEIGHT, TITLE);
  _SetTargetFPS(60);

  let quit = false;
  while (!quit)
  {
      if (_WindowShouldClose() || _IsKeyPressed(_KEY_ESCAPE)) {
        quit = true;
      }

      _BeginDrawing();

      _ClearBackground(RAYWHITE);

      _DrawText(MESSAGE, WIDTH / 2 - 100, HEIGHT / 2, 20, BLACK);

      _EndDrawing();
  }

  for (let i = 0; i < cleanup.length; i++) { _free(cleanup[i]) };

  _CloseWindow();

})();