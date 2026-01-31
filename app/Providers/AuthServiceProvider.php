<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\Visit;
use App\Policies\VisitPolicy;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Visit::class => VisitPolicy::class,
    ];

    public function boot()
    {
        $this->registerPolicies();

        // Other gates can be defined here
    }
}
