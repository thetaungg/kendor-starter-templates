<?php

namespace Tests\Unit;

use App\Models\User;
use PHPUnit\Framework\TestCase;

class UserModelTest extends TestCase
{
    /**
     * Test that User model has fillable attributes.
     */
    public function test_user_has_fillable_attributes(): void
    {
        $user = new User();
        $fillable = $user->getFillable();

        $this->assertContains('name', $fillable);
        $this->assertContains('email', $fillable);
        $this->assertContains('password', $fillable);
    }

    /**
     * Test that User model has hidden attributes.
     */
    public function test_user_has_hidden_attributes(): void
    {
        $user = new User();
        $hidden = $user->getHidden();

        $this->assertContains('password', $hidden);
        $this->assertContains('remember_token', $hidden);
    }

    /**
     * Test that User can be instantiated.
     */
    public function test_user_can_be_instantiated(): void
    {
        $user = new User();

        $this->assertInstanceOf(User::class, $user);
    }

    /**
     * Test User model mass assignment.
     */
    public function test_user_mass_assignment(): void
    {
        $user = new User([
            'name' => 'John Doe',
            'email' => 'john@example.com',
        ]);

        $this->assertEquals('John Doe', $user->name);
        $this->assertEquals('john@example.com', $user->email);
    }
}


