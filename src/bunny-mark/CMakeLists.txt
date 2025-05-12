set(src resources.js bunny-mark.ts)
set(deps resources.h)

set_source_files_properties(${CMAKE_CURRENT_BINARY_DIR}/../shared/js_externs.js PROPERTIES GENERATED TRUE)
set_source_files_properties(${CMAKE_CURRENT_BINARY_DIR}/../shared/js_externs_cwrap.c PROPERTIES GENERATED TRUE)

set(BUNNYMARK_O bunny-mark${CMAKE_C_OUTPUT_EXTENSION})
add_custom_command(OUTPUT ${BUNNYMARK_O}
        COMMAND ${CMAKE_BINARY_DIR}/bin/shermes $<$<CONFIG:Debug>:-g3> -typed -c
          ../shared/ffi_helpers.js ../shared/asciiz.js ${CMAKE_CURRENT_BINARY_DIR}/../shared/js_externs.js ${src}
        -Wc,-I.,-I${hermes_SOURCE_DIR}/include,-I${hermes_BINARY_DIR}/lib/config,-DRESOURCE_PATH=\\\"${CMAKE_CURRENT_SOURCE_DIR}/resources/\\\"
        -o ${CMAKE_CURRENT_BINARY_DIR}/${BUNNYMARK_O}
        DEPENDS
        ${CMAKE_BINARY_DIR}/bin/shermes
        ../shared/ffi_helpers.js ../shared/asciiz.js ${CMAKE_CURRENT_BINARY_DIR}/../shared/js_externs.js ${src} ${deps}
        WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
)

add_executable(bunny-mark ${CMAKE_CURRENT_BINARY_DIR}/${BUNNYMARK_O} ${CMAKE_CURRENT_BINARY_DIR}/../shared/js_externs_cwrap.c)
add_executable(bunny-mark-c ${CMAKE_CURRENT_SOURCE_DIR}/bunny-mark.c)

set_property(TARGET bunny-mark bunny-mark-c PROPERTY RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin/${CMAKE_CFG_INTDIR})
set_property(TARGET bunny-mark bunny-mark-c PROPERTY LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin/${CMAKE_CFG_INTDIR})

set_target_properties(bunny-mark bunny-mark-c PROPERTIES LINKER_LANGUAGE CXX)

add_dependencies(bunny-mark shermes shared)
target_sources(bunny-mark-c PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/bunny-mark.c)

target_include_directories(bunny-mark PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/../shared)
target_include_directories(bunny-mark-c PRIVATE ${CMAKE_CURRENT_SOURCE_DIR} ${raylib_BINARY_DIR}/include)

target_link_directories(bunny-mark PRIVATE ${hermes_BINARY_DIR}/lib)

add_compile_definitions(bunny-mark-c -DRESOURCE_PATH="${CMAKE_CURRENT_SOURCE_DIR}/resources/")

if(APPLE)
  add_compile_definitions(-DCUSTOMIZE_BUILD=ON -DOPENGL_VERSION="ES 2.0")

  set(ANGLE_LIBRARY_DIR ../../lib/macos)
  find_library(ANGLE_GLESv2_LIBRARY libGLESv2.dylib PATHS ${ANGLE_LIBRARY_DIR})
  find_library(ANGLE_EGL_LIBRARY libEGL.dylib PATHS ${ANGLE_LIBRARY_DIR})
  
  target_link_libraries(bunny-mark hermesvm raylib ${ANGLE_GLESv2_LIBRARY} ${ANGLE_EGL_LIBRARY})
  target_link_libraries(bunny-mark-c raylib ${ANGLE_GLESv2_LIBRARY} ${ANGLE_EGL_LIBRARY})

  configure_file("${CMAKE_CURRENT_SOURCE_DIR}/../../lib/macos/libGLESv2.dylib" "${CMAKE_BINARY_DIR}/bin/${CMAKE_CFG_INTDIR}/libGLESv2.dylib" COPYONLY)
  configure_file("${CMAKE_CURRENT_SOURCE_DIR}/../../lib/macos/libEGL.dylib" "${CMAKE_BINARY_DIR}/bin/${CMAKE_CFG_INTDIR}/libEGL.dylib" COPYONLY)
else()
  target_link_libraries(bunny-mark hermesvm shermes_console raylib)
  target_link_libraries(bunny-mark-c raylib)
endif()
