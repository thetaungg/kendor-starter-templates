<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_that_true_is_true(): void
    {
        $this->assertTrue(true);
    }

    /**
     * Test basic assertions.
     */
    public function test_basic_assertions(): void
    {
        // Assert equals
        $this->assertEquals(2, 1 + 1);
        $this->assertEquals('hello', 'hello');

        // Assert not equals
        $this->assertNotEquals(2, 3);

        // Assert same (strict comparison)
        $this->assertSame(1, 1);
        $this->assertSame('test', 'test');
    }

    /**
     * Test array assertions.
     */
    public function test_array_assertions(): void
    {
        $array = [1, 2, 3, 4, 5];

        // Assert array contains
        $this->assertContains(3, $array);
        $this->assertNotContains(10, $array);

        // Assert array count
        $this->assertCount(5, $array);

        // Assert array has key
        $assocArray = ['name' => 'John', 'age' => 30];
        $this->assertArrayHasKey('name', $assocArray);
        $this->assertArrayNotHasKey('email', $assocArray);
    }

    /**
     * Test string assertions.
     */
    public function test_string_assertions(): void
    {
        $string = 'Hello World';

        // Assert string contains
        $this->assertStringContainsString('World', $string);
        $this->assertStringNotContainsString('Universe', $string);

        // Assert string starts with
        $this->assertStringStartsWith('Hello', $string);

        // Assert string ends with
        $this->assertStringEndsWith('World', $string);
    }

    /**
     * Test null and empty assertions.
     */
    public function test_null_and_empty_assertions(): void
    {
        $nullValue = null;
        $emptyString = '';
        $emptyArray = [];
        $nonEmpty = 'value';

        $this->assertNull($nullValue);
        $this->assertNotNull($nonEmpty);
        $this->assertEmpty($emptyString);
        $this->assertEmpty($emptyArray);
        $this->assertNotEmpty($nonEmpty);
    }

    /**
     * Test numeric assertions.
     */
    public function test_numeric_assertions(): void
    {
        $number = 10;

        $this->assertGreaterThan(5, $number);
        $this->assertGreaterThanOrEqual(10, $number);
        $this->assertLessThan(20, $number);
        $this->assertLessThanOrEqual(10, $number);
    }

    /**
     * This test intentionally fails to demonstrate failure display.
     */
    public function test_that_will_fail(): void
    {
        $this->assertTrue(false, 'This test is designed to fail');
    }

    /**
     * Another failing test example.
     */
    public function test_equality_assertion_failure(): void
    {
        $expected = 'hello';
        $actual = 'world';
        $this->assertEquals($expected, $actual, 'Expected hello but got world');
    }
}
