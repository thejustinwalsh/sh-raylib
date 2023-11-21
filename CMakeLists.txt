cmake_minimum_required(VERSION 3.26)
project(sh-raylib)

set(CMAKE_CXX_STANDARD 17)

include(FetchContent)
set(FETCHCONTENT_QUIET FALSE)
set(BUILD_EXAMPLES OFF CACHE BOOL "" FORCE) # don't build the supplied examples
set(BUILD_GAMES    OFF CACHE BOOL "" FORCE) # don't build the supplied example games

FetchContent_Declare(
    raylib
    GIT_REPOSITORY "https://github.com/raysan5/raylib.git"
    GIT_TAG "5.0"
    GIT_PROGRESS TRUE
)

FetchContent_Declare(
    hermes
    GIT_REPOSITORY "https://github.com/facebook/hermes.git"
    GIT_TAG "static_h"
    GIT_PROGRESS TRUE
)

FetchContent_MakeAvailable(raylib hermes)

set(SHERMES ${hermes_BINARY_DIR}/tools/shermes CACHE FILEPATH "shermes tool path")
set(FFIGEN ${hermes_SOURCE_DIR}/tools/ffigen/ffigen.py CACHE FILEPATH "ffigen tool path")

include_directories(${hermes_BINARY_DIR}/lib/config)
include_directories(${hermes_SOURCE_DIR}/include)
include_directories(${hermes_SOURCE_DIR}/Public)
include_directories(${hermes_SOURCE_DIR}/API)
include_directories(${hermes_SOURCE_DIR}/API/jsi)

add_subdirectory(src/shared)
add_subdirectory(src/hello-world)
add_subdirectory(src/bunny-mark)
