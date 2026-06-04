<?php

namespace Tests\Feature;

use Tests\TestCase;

class HttpMethodTest extends TestCase
{
    /**
     * Test GET method.
     */
    public function test_get_method(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    /**
     * Test POST method (should return 405 Method Not Allowed for root).
     */
    public function test_post_method_not_allowed_on_root(): void
    {
        $response = $this->post('/');

        // Root route only accepts GET, so POST should return 405
        $this->assertContains($response->status(), [405, 404]);
    }

    /**
     * Test PUT method (should return 405 Method Not Allowed for root).
     */
    public function test_put_method_not_allowed_on_root(): void
    {
        $response = $this->put('/');

        // Root route only accepts GET, so PUT should return 405
        $this->assertContains($response->status(), [405, 404]);
    }

    /**
     * Test DELETE method (should return 405 Method Not Allowed for root).
     */
    public function test_delete_method_not_allowed_on_root(): void
    {
        $response = $this->delete('/');

        // Root route only accepts GET, so DELETE should return 405
        $this->assertContains($response->status(), [405, 404]);
    }
}


