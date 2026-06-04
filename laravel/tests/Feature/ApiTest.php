<?php

namespace Tests\Feature;

use Tests\TestCase;

class ApiTest extends TestCase
{
    /**
     * Test GET request to root endpoint.
     */
    public function test_get_root_endpoint(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    /**
     * Test that response is HTML.
     */
    public function test_response_is_html(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $this->assertStringContainsString('text/html', $response->headers->get('Content-Type'));
    }

    /**
     * Test response structure.
     */
    public function test_response_has_valid_structure(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $this->assertNotEmpty($response->getContent());
    }

    /**
     * Test that response time is reasonable.
     */
    public function test_response_time_is_reasonable(): void
    {
        $start = microtime(true);
        $response = $this->get('/');
        $end = microtime(true);

        $response->assertStatus(200);
        $responseTime = ($end - $start) * 1000; // Convert to milliseconds

        // Response should be under 1 second
        $this->assertLessThan(1000, $responseTime);
    }
}


