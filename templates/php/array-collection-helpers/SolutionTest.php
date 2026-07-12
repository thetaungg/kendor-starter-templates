<?php

use PHPUnit\Framework\TestCase;

// Solution.php is loaded by phpunit's bootstrap (see phpunit.xml).
final class SolutionTest extends TestCase
{
    private function rows(): array
    {
        return [
            ['team' => 'a', 'pts' => 3],
            ['team' => 'b', 'pts' => 5],
            ['team' => 'a', 'pts' => 2],
        ];
    }

    public function testPluck(): void
    {
        $this->assertSame(['a', 'b', 'a'], pluck($this->rows(), 'team'));
    }

    public function testSumBy(): void
    {
        $this->assertSame(10, sum_by($this->rows(), 'pts'));
    }

    public function testSumByEmpty(): void
    {
        $this->assertSame(0, sum_by([], 'pts'));
    }

    public function testGroupBy(): void
    {
        $grouped = group_by($this->rows(), 'team');
        $this->assertSame(['a', 'b'], array_keys($grouped));
        $this->assertCount(2, $grouped['a']);
        $this->assertCount(1, $grouped['b']);
    }
}
