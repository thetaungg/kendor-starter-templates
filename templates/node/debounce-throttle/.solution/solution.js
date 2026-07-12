// Reference solution — stripped from the candidate seed (kendor.solutionDir).

function debounce(fn, wait) {
    let timer = null;
    return function (...args) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            timer = null;
            fn.apply(this, args);
        }, wait);
    };
}

function throttle(fn, wait) {
    let last = null;
    return function (...args) {
        const now = Date.now();
        if (last === null || now - last >= wait) {
            last = now;
            fn.apply(this, args);
        }
    };
}

module.exports = { debounce, throttle };
