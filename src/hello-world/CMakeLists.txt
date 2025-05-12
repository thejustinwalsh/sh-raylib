set_source_files_properties(${CMAKE_CURRENT_BINARY_DIR}/../shared/js_externs.js PROPERTIES GENERATED TRUE)
set_source_files_properties(${CMAKE_CURRENT_BINARY_DIR}/../shared/js_externs_cwrap.c PROPERTIES GENERATED TRUE)

set(HELLOWORLD_O hello-world${CMAKE_C_OUTPUT_EXTENSION})
add_custom_command(OUTPUT ${HELLOWORLD_O}
        COMMAND ${CMAKE_BINARY_DIR}/bin/shermes $<$<CONFIG:Debug>:-g3> -typed -c
          ../shared/ffi_helpers.js ../shared/asciiz.js ${CMAKE_CURRENT_BINARY_DIR}/../shared/js_externs.js hello-world.ts
        -Wc,-I.,-I${hermes_SOURCE_DIR}/include,-I${hermes_BINARY_DIR}/lib/config,-DRESOURCE_PATH=\\\"${CMAKE_CURRENT_SOURCE_DIR}/resources/\\\"
        -o ${CMAKE_CURRENT_BINARY_DIR}/${HELLOWORLD_O}
        DEPENDS
        ${CMAKE_BINARY_DIR}/bin/shermes
        ../shared/ffi_helpers.js ../shared/asciiz.js ${CMAKE_CURRENT_BINARY_DIR}/../shared/js_externs.js hello-world.ts
        WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
)

add_executable(hello-world ${CMAKE_CURRENT_BINARY_DIR}/${HELLOWORLD_O} ${CMAKE_CURRENT_BINARY_DIR}/../shared/js_externs_cwrap.c)

set_property(TARGET hello-world PROPERTY RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin/${CMAKE_CFG_INTDIR})
set_target_properties(hello-world PROPERTIES LINKER_LANGUAGE CXX)

add_dependencies(hello-world shermes shared)

target_include_directories(hello-world PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/../shared)
target_link_directories(hello-world PRIVATE ${hermes_BINARY_DIR}/lib)

target_link_libraries(hello-world hermesvm shermes_console raylib)


