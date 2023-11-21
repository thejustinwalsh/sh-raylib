# raylib bindings for Static Hermes
> This is highly experimental and likely not suitable for use.

## Prerequisites
```sh
brew install cmake git ninja python3 castxml
```

## Building
```sh
cmake -B ./build -G Ninja
cmake --build ./build
```

## Running
```sh
./build/bin/hello-world
./build/bin/bunny-mark
```


# Notes

## Running ffigen
```sh
brew install python3 castxml
```

`hermes/tools/ffigen/ffigen.py` uses [castxml](https://github.com/CastXML/CastXML) to generate an AST of the c/cpp code and emit function definitions for the headers that you tell it to parse.

If a function returns a struct or union you will also need to run ffigen cwrap in order to generate wrapper functions that turn the return param into an out param as the first argument.

You can limit the scope of the headers that ffigen will include, so that you don't pick up system headers, or other undesired headers from the include chain.

## Generating raylib externs
```sh
ffigen js ./raylib-ffi.h builtin,raylib.h,raymath.h > js_externs.js
ffigen cwrap ./raylib-ffi.h builtin,raylib.h,raymath.h > js_externs_cwrap.c
```

In order to get the raylib headers to parse properly you must ensure that the defines were present that raylib expects in order to use c99 stdbool, instead of some custom unsupported bool type. This is done in `raylib-ffi.h` by defining `__STDC_VERSION__` to `199901L` and `__STDC__` to `1`. There may be a better way to do this moving forward, but I did not see anyway to past args through ffigen to castxml.

The generated cwrap externs require you to include the headers that you are generating externs for, otherwise you will get errors about missing types. This is because the cwrap externs are just wrappers around the original functions, and they need to know about the types that they are wrapping. Some creative use of `cmake -E cat` to concatenate the headers into a single file is implemented in `src/shared/CMakeLists.txt` to make this work.

## Working with cwrap externs
You must allocate memory for the return value of the function, and pass it as the first argument to the cwrap function. The cwrap function will then copy the return value into the memory that you allocated.

```ts
const ptr = malloc(_sizeof_Font);
_LoadFont(ptr, "path/to/font.png");
```

## Memory management
Every malloc should be paired with a free. If you are allocating memory for a return value, you should free it after you are done with it.
Curious how to tie the lifetimes of the c allocations to the JS objects as we do not have any finalizers or destrcutors in JS.
