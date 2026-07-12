import pytest

from solution import longest_unique_substring, max_window_sum


def test_longest_unique_basic():
    assert longest_unique_substring("abcabcbb") == 3


def test_longest_unique_all_same():
    assert longest_unique_substring("bbbbb") == 1


def test_longest_unique_empty():
    assert longest_unique_substring("") == 0


def test_max_window_sum_basic():
    assert max_window_sum([1, 4, 2, 10, 2], 3) == 16


def test_max_window_sum_whole_array():
    assert max_window_sum([1, 2, 3], 3) == 6


def test_max_window_sum_rejects_bad_k():
    with pytest.raises(ValueError):
        max_window_sum([1, 2, 3], 0)
    with pytest.raises(ValueError):
        max_window_sum([1, 2, 3], 4)
