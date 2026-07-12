<?php

// Reference solution — stripped from the candidate seed (kendor.solutionDir).

function pluck(array $rows, string $key): array
{
    return array_map(fn($row) => $row[$key], $rows);
}

function sum_by(array $rows, string $key): float|int
{
    return array_reduce($rows, fn($carry, $row) => $carry + $row[$key], 0);
}

function group_by(array $rows, string $key): array
{
    $out = [];
    foreach ($rows as $row) {
        $out[$row[$key]][] = $row;
    }
    return $out;
}
