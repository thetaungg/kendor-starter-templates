#include <iostream>
#include <iterator>
#include <string>

#include "wordcount.hpp"

// Usage: echo "the cat and the hat" | ./build/app
int main() {
    std::string text(std::istreambuf_iterator<char>(std::cin), {});

    for (const auto& [word, count] : countWords(text)) {
        std::cout << word << " " << count << "\n";
    }

    return 0;
}
