#include <catch_amalgamated.hpp>

int solve(int n);

TEST_CASE("doubles two") {
    REQUIRE(solve(2) == 4);
}
