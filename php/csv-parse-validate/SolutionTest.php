<?php

use PHPUnit\Framework\TestCase;

// Solution.php is loaded by phpunit's bootstrap (see phpunit.xml).
final class SolutionTest extends TestCase
{
    public function testParseCsvMapsHeaders(): void
    {
        $rows = parse_csv("name, email\nAda, ada@x.com\nLin,");
        $this->assertSame([
            ['name' => 'Ada', 'email' => 'ada@x.com'],
            ['name' => 'Lin', 'email' => ''],
        ], $rows);
    }

    public function testParseCsvSkipsBlankLines(): void
    {
        $rows = parse_csv("a,b\n\n1,2\n\n");
        $this->assertSame([['a' => '1', 'b' => '2']], $rows);
    }

    public function testParseCsvNoDataRows(): void
    {
        $this->assertSame([], parse_csv('only,headers'));
    }

    public function testFilterValidDropsIncompleteRows(): void
    {
        $rows = [
            ['name' => 'Ada', 'email' => 'ada@x.com'],
            ['name' => 'Lin', 'email' => ''],
        ];
        $this->assertSame([
            ['name' => 'Ada', 'email' => 'ada@x.com'],
        ], filter_valid($rows, ['name', 'email']));
    }
}
