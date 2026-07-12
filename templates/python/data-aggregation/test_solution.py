from solution import top_n, word_frequencies


def test_word_frequencies_counts_words():
    assert word_frequencies("the cat the dog the") == {"the": 3, "cat": 1, "dog": 1}


def test_word_frequencies_is_case_insensitive():
    assert word_frequencies("Go go GO") == {"go": 3}


def test_word_frequencies_empty_text():
    assert word_frequencies("") == {}


def test_top_n_orders_by_count_desc():
    assert top_n("the cat the dog the", 2) == [("the", 3), ("cat", 1)]


def test_top_n_breaks_ties_alphabetically():
    assert top_n("b a c a b", 2) == [("a", 2), ("b", 2)]
