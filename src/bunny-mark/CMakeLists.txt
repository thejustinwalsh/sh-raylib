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

set_property(TARGET bunny-mark PROPERTY RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin/${CMAKE_CFG_INTDIR})
set_target_properties(bunny-mark PROPERTIES LINKER_LANGUAGE CXX)

add_dependencies(bunny-mark shermes shared)

target_include_directories(bunny-mark PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/../shared)
target_link_directories(bunny-mark PRIVATE ${hermes_BINARY_DIR}/lib)

target_link_libraries(bunny-mark hermesvm raylib)


