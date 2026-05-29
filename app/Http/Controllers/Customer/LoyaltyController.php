<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\LoyaltyPoint;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LoyaltyController extends Controller
{
    public function index(Request $request)
    {
        $points = LoyaltyPoint::where('customer_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $totalPoints = $points->where('transaction_type', 'earn')->sum('points')
                     - $points->whereIn('transaction_type', ['redeem', 'expired'])->sum('points');

        return Inertia::render('Customer/Loyalty', [
            'points' => $points,
            'totalPoints' => max(0, $totalPoints),
        ]);
    }
}
