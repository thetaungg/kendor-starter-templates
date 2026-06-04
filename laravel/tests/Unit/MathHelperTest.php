<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class MathHelperTest extends TestCase
{
    /**
     * Test addition function.
     */
    public function test_addition(): void
    {
        $result = 5 + 3;
        $this->assertEquals(8, $result);
    }

    /**
     * Test subtraction function.
     */
    public function test_subtraction(): void
    {
        $result = 10 - 4;
        $this->assertEquals(6, $result);
    }

    /**
     * Test multiplication function.
     */
    public function test_multiplication(): void
    {
        $result = 7 * 6;
        $this->assertEquals(42, $result);
    }

    /**
     * Test division function.
     */
    public function test_division(): void
    {
        $result = 20 / 4;
        $this->assertEquals(5, $result);
    }

    /**
     * Test that division by zero throws exception.
     */
    public function test_division_by_zero(): void
    {
        $this->expectException(\DivisionByZeroError::class);
        // This will throw DivisionByZeroError in PHP 8+
        $result = 10 / 0;
        $this->fail('Division by zero should have thrown an exception');
    }

    /**
     * Test array sum calculation.
     */
    public function test_array_sum(): void
    {
        $numbers = [1, 2, 3, 4, 5];
        $sum = array_sum($numbers);

        $this->assertEquals(15, $sum);
    }

    /**
     * Test array average calculation.
     */
    public function test_array_average(): void
    {
        $numbers = [10, 20, 30];
        $average = array_sum($numbers) / count($numbers);

        $this->assertEquals(20, $average);
    }
}

