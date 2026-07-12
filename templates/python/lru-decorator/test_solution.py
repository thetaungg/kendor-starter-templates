from solution import lru_cache


def make_counter():
    calls = {"n": 0}

    @lru_cache(maxsize=2)
    def square(n):
        calls["n"] += 1
        return n * n

    return square, calls


def test_caches_repeated_calls():
    square, calls = make_counter()
    assert square(2) == 4
    assert square(2) == 4
    assert calls["n"] == 1  # underlying function called once


def test_tracks_hits_and_misses():
    square, _ = make_counter()
    square(2)
    square(2)
    square(3)
    assert square.stats == {"hits": 1, "misses": 2}


def test_evicts_least_recently_used():
    square, calls = make_counter()
    square(1)  # miss -> cache {1}
    square(2)  # miss -> cache {1, 2}
    square(1)  # hit  -> 1 is now most recent
    square(3)  # miss -> evicts 2 (LRU); cache {1, 3}
    assert calls["n"] == 3
    square(2)  # miss again, since 2 was evicted
    assert calls["n"] == 4


def test_preserves_return_values():
    @lru_cache(maxsize=8)
    def add(a, b):
        return a + b

    assert add(2, 3) == 5
    assert add(2, 3) == 5
    assert add(10, 1) == 11
