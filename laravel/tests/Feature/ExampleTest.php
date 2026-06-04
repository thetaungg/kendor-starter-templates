<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * Test that the application returns a successful response.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    /**
     * Test that the home page contains expected content.
     */
    public function test_home_page_contains_expected_content(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertSee('Laravel', false); // Case-insensitive search
    }

    /**
     * Test that a non-existent route returns 404.
     */
    public function test_non_existent_route_returns_404(): void
    {
        $response = $this->get('/non-existent-route');

        $response->assertStatus(404);
    }

    /**
     * Test response headers.
     */
    public function test_response_has_correct_headers(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $this->assertNotNull($response->headers->get('Content-Type'));
    }
}
