#include <catch_amalgamated.hpp>

#include "wordcount.hpp"

TEST_CASE("counts repeated words") {
    auto counts = countWords("the cat and the hat");

    REQUIRE(counts["the"] == 2);
    REQUIRE(counts["cat"] == 1);
}

TEST_CASE("ignores case and punctuation") {
    auto counts = countWords("Hello, hello! HELLO?");

    REQUIRE(counts.size() == 1);
    REQUIRE(counts["hello"] == 3);
}
