<?php

// Reference solution — stripped from the candidate seed (kendor.solutionDir).

function parse_csv(string $text): array
{
    $lines = array_values(array_filter(
        array_map('trim', explode("\n", $text)),
        fn($line) => $line !== ''
    ));
    if (count($lines) === 0) {
        return [];
    }
    $headers = array_map('trim', explode(',', array_shift($lines)));
    $rows = [];
    foreach ($lines as $line) {
        $values = array_map('trim', explode(',', $line));
        $rows[] = array_combine($headers, $values);
    }
    return $rows;
}

function filter_valid(array $rows, array $required): array
{
    return array_values(array_filter($rows, function ($row) use ($required) {
        foreach ($required as $key) {
            if (!isset($row[$key]) || $row[$key] === '') {
                return false;
            }
        }
        return true;
    }));
}
