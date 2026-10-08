// Reference solution — stripped from the candidate seed (kendor.solutionDir).

function tokenize(text) {
    return text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

module.exports = { tokenize, slugify };
