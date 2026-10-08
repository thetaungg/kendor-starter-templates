<?php

use PHPUnit\Framework\TestCase;

// Solution.php is loaded by phpunit's bootstrap (see phpunit.xml).
final class SolutionTest extends TestCase
{
    public function testDoublesTwo(): void
    {
        $this->assertSame(4, solve(2));
    }
}
