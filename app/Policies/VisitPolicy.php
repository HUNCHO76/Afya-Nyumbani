<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Visit;
use Illuminate\Auth\Access\HandlesAuthorization;

class VisitPolicy
{
    use HandlesAuthorization;

    public function view(User $user, Visit $visit)
    {
        if ($user->role === 'super_admin' || $user->role === 'admin') return true;
        if ($user->role === 'practitioner' && $user->practitioner) {
            return $visit->practitioner_id === $user->practitioner->id || ($visit->booking && $visit->booking->assigned_practitioner_id === $user->practitioner->id);
        }
        return false;
    }

    public function update(User $user, Visit $visit)
    {
        return $this->view($user, $visit);
    }
}