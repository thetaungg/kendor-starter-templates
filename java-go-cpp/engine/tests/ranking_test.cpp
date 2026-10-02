#include <catch_amalgamated.hpp>

#include "ranking.hpp"

TEST_CASE("ranks by matches, highest first") {
    REQUIRE(rank({1, 3, 2}) == std::vector<int>{1, 2, 0});
}

TEST_CASE("keeps ties in id order") {
    REQUIRE(rank({2, 2, 5}) == std::vector<int>{2, 0, 1});
}
