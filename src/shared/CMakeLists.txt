add_custom_command(OUTPUT js_externs.js
  COMMAND ${FFIGEN} js ../../include/raylib-ffi.h builtin,raylib.h,raymath.h > ${CMAKE_CURRENT_BINARY_DIR}/js_externs.js
  DEPENDS ${FFIGEN} ../../include/raylib-ffi.h
  WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
)

add_custom_command(OUTPUT js_externs_cwrap.c.in
  COMMAND ${FFIGEN} cwrap ../../include/raylib-ffi.h builtin,raylib.h,raymath.h > ${CMAKE_CURRENT_BINARY_DIR}/js_externs_cwrap.c.in
  DEPENDS ${FFIGEN} ../../include/raylib-ffi.h
  WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
)

set(externs_cwrap ${CMAKE_CURRENT_SOURCE_DIR}/../../include/raylib.h.in ${CMAKE_CURRENT_BINARY_DIR}/js_externs_cwrap.c.in)
add_custom_command(OUTPUT js_externs_cwrap.c
  COMMAND ${CMAKE_COMMAND} -E cat ${externs_cwrap} > ${CMAKE_CURRENT_BINARY_DIR}/js_externs_cwrap.c
  WORKING_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR}
  DEPENDS ${externs_cwrap}
)

add_custom_target(generate-externs DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/js_externs.js)
add_custom_target(generate-cwrap DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/js_externs_cwrap.c)
add_custom_target(shared DEPENDS generate-externs generate-cwrap)
