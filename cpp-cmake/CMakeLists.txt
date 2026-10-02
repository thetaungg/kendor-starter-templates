cmake_minimum_required(VERSION 3.20)
project(app CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_library(wordcount src/wordcount.cpp)
target_include_directories(wordcount PUBLIC src)

add_executable(app src/main.cpp)
target_link_libraries(app PRIVATE wordcount)

# Catch2 comes prebuilt from the C++ toolchain folder (CATCH2_DIR), so tests need no download.
add_executable(tests tests/wordcount_test.cpp $ENV{CATCH2_DIR}/catch_amalgamated.o)
target_include_directories(tests PRIVATE $ENV{CATCH2_DIR})
target_link_libraries(tests PRIVATE wordcount)
