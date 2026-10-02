#pragma once

#include <map>
#include <string>

// Count each word in `text`, lowercased; words are runs of letters and digits.
std::map<std::string, int> countWords(const std::string& text);
