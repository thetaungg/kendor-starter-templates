#include "ranking.hpp"

#include <algorithm>
#include <numeric>

std::vector<int> rank(const std::vector<int>& matchesPerDocument) {
    std::vector<int> ids(matchesPerDocument.size());
    std::iota(ids.begin(), ids.end(), 0);

    std::stable_sort(ids.begin(), ids.end(), [&](int a, int b) {
        return matchesPerDocument[a] > matchesPerDocument[b];
    });

    return ids;
}
