"""Reference solution — stripped from the candidate seed (kendor.solutionDir)."""

from collections import OrderedDict
from functools import wraps


def lru_cache(maxsize: int):
    def decorator(func):
        cache: OrderedDict = OrderedDict()
        stats = {"hits": 0, "misses": 0}

        @wraps(func)
        def wrapper(*args):
            if args in cache:
                cache.move_to_end(args)
                stats["hits"] += 1
                return cache[args]
            stats["misses"] += 1
            result = func(*args)
            cache[args] = result
            cache.move_to_end(args)
            if len(cache) > maxsize:
                cache.popitem(last=False)
            return result

        wrapper.stats = stats
        wrapper.cache = cache
        return wrapper

    return decorator
