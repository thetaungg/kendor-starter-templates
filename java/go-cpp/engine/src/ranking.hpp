#pragma once

#include <vector>

// Rank documents by how many query terms they matched: highest first, ties by lower id.
std::vector<int> rank(const std::vector<int>& matchesPerDocument);
