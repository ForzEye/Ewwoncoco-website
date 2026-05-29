<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\LoyaltyPoint;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReferralController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Ensure user has referral code
        if (! $user->referral_code) {
            $user->update([
                'referral_code' => 'COCO-'.strtoupper(bin2hex(random_bytes(3))),
            ]);
        }

        $referrals = User::where('referred_by_id', $user->id)
            ->select('id', 'name', 'created_at')
            ->get();

        $referralPoints = LoyaltyPoint::where('customer_id', $user->id)
            ->where('transaction_type', 'earn')
            ->where('reference_type', 'referral')
            ->sum('points');

        return Inertia::render('Customer/Referral', [
            'referral_code' => $user->referral_code,
            'referrals' => $referrals,
            'total_points' => $referralPoints,
        ]);
    }
}
