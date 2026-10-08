#include "wordcount.hpp"

#include <cctype>

std::map<std::string, int> countWords(const std::string& text) {
    std::map<std::string, int> counts;
    std::string word;

    for (char ch : text) {
        if (std::isalnum(static_cast<unsigned char>(ch))) {
            word += static_cast<char>(std::tolower(static_cast<unsigned char>(ch)));
            continue;
        }

        if (!word.empty()) {
            counts[word] += 1;
            word.clear();
        }
    }

    if (!word.empty()) {
        counts[word] += 1;
    }

    return counts;
}
