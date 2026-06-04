<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class FailingTest extends TestCase
{
    /**
     * A test that will fail.
     */
    public function test_that_false_is_false(): void
    {
        $this->assertTrue(false, 'This test is designed to fail');
    }

    /**
     * Another failing test.
     */
    public function test_that_one_equals_two(): void
    {
        $this->assertEquals(1, 2, '1 should not equal 2');
    }

    /**
     * A passing test in the same suite.
     */
    public function test_that_one_equals_one(): void
    {
        $this->assertEquals(1, 1);
    }
}

